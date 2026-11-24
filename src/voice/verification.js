import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

// Public facts a credential service may report about a stored key. A new value
// for any of them means a new key, so an earlier test no longer counts.
const STAMP_FIELDS = ['updatedAt', 'updated_at', 'modifiedAt', 'version', 'revision', 'fingerprint'];
const OWN_CODE = /^[a-z][a-z-]{1,40}$/u, PROVIDER_CODE = /^[A-Za-z][A-Za-z_.-]{1,47}$/u;

/**
 * The short reason kept for a failed test, e.g. "provider-error · invalid_value": our own
 * code, plus the audio service's code when it sent one. Both are pattern-checked short
 * tokens, so no message, URL or key can be stored or shown.
 */
export function failureCode(error) {
  const code = typeof error?.code === 'string' && OWN_CODE.test(error.code) ? error.code : null;
  if (!code) return null;
  return typeof error.detail === 'string' && PROVIDER_CODE.test(error.detail) ? `${code} · ${error.detail}` : code;
}
const STORED_CODE = /^[a-z][a-z-]{1,40}(?: · [A-Za-z][A-Za-z_.-]{1,47})?$/u;

/**
 * Which audio settings last passed a real test, so "voice connected" means a
 * test call worked, not only that fields were filled in.
 *
 * The record on disk is a digest of the saved region, workspace, model and
 * credential name (plus the credential service's public facts), and the time
 * of the test. It never holds or reads the key. Changing any setting changes
 * the digest; saving a key through this plugin calls forget(); a failed test
 * forgets as well.
 *
 * settings() returns { region, workspace, model, credentialRef } or throws when
 * voice is not set up; describe(ref) returns the credential's { configured, … }.
 */
export function createVoiceVerification({ directory, settings, describe }) {
  const file = path.join(directory, 'voice-check.json');
  let queue = Promise.resolve();
  const serial = task => { const next = queue.then(task, task); queue = next.catch(() => {}); return next; };

  async function fingerprint() {
    let options;
    try { options = settings(); } catch { return null; }
    let info;
    try { info = await describe(options.credentialRef); } catch { return null; }
    if (!info?.configured) return null;
    const stamp = STAMP_FIELDS.map(key => info[key]).filter(value => typeof value === 'string' || typeof value === 'number');
    return createHash('sha256').update(JSON.stringify(['voice-check-1', options.region, options.workspace, options.model, options.credentialRef, stamp])).digest('hex');
  }
  async function read() {
    try {
      const value = JSON.parse(await fs.readFile(file, 'utf8'));
      return typeof value?.fingerprint === 'string' && /^[a-f0-9]{64}$/u.test(value.fingerprint) ? value : null;
    } catch { return null; }
  }
  const write = (tested, ok, code) => serial(async () => {
    if (typeof tested !== 'string') { if (!ok) await fs.rm(file, { force: true }); return; }
    const temporary = `${file}.${randomUUID()}.tmp`;
    const reason = !ok && typeof code === 'string' && STORED_CODE.test(code) ? { code } : {};
    await fs.writeFile(temporary, `${JSON.stringify({ schemaVersion: 1, fingerprint: tested, ok, testedAt: new Date().toISOString(), ...reason })}\n`, { mode: 0o600, flag: 'wx' });
    await fs.rename(temporary, file);
  });
  return {
    fingerprint,
    /** verified: the last test of these exact settings passed; failed: it did not. */
    async status() {
      const [record, current] = await Promise.all([read(), fingerprint()]);
      const same = Boolean(record && current && record.fingerprint === current);
      const verified = same && record.ok !== false;
      return { verified, ...(same && record.ok === false ? { failed: true } : {}),
        ...(same && record.ok === false && typeof record.code === 'string' && STORED_CODE.test(record.code) ? { failureCode: record.code } : {}),
        ...(same && typeof record.testedAt === 'string' ? { testedAt: record.testedAt } : {}) };
    },
    /** Remember a passing test of the settings that were current when it began. */
    record: tested => write(tested, true),
    /** Remember that a test of these settings did not pass, and its short reason code. */
    fail: (tested, code) => write(tested, false, code),
    forget: () => serial(async () => { await fs.rm(file, { force: true }); }),
  };
}

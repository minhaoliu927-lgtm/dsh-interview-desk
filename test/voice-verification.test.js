import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createVoiceVerification, failureCode } from '../src/voice/verification.js';

// "Voice connected" must mean a test call passed with the settings saved now,
// not merely that a workspace ID and a key were filled in.
const root = path.resolve(fileURLToPath(new URL('../.runtime/tests/voice-verification/', import.meta.url)));

function fixture(t) {
  fs.mkdirSync(root, { recursive: true });
  const directory = fs.mkdtempSync(path.join(root, 'case-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const state = { settings: { region: 'beijing', workspace: 'llm-abc', model: 'qwen3.5-omni-plus-realtime', credentialRef: 'ZHIJING_REALTIME_API_KEY' },
    info: { configured: true }, enabled: true };
  const check = createVoiceVerification({ directory,
    settings: () => { if (!state.enabled) throw Object.assign(new Error('off'), { code: 'not-configured' }); return state.settings; },
    describe: async () => state.info });
  return { check, state, directory };
}

test('only a recorded pass for the current settings counts as verified', async t => {
  const { check, state, directory } = fixture(t);
  assert.deepEqual(await check.status(), { verified: false });
  const tested = await check.fingerprint();
  await check.record(tested);
  const status = await check.status();
  assert.equal(status.verified, true); assert.match(status.testedAt, /^\d{4}-\d\d-\d\dT/u);
  // The record is a digest and a time, never the key.
  const stored = fs.readFileSync(path.join(directory, 'voice-check.json'), 'utf8');
  assert.doesNotMatch(stored, /sk-|llm-abc|ZHIJING/u);
  for (const change of [{ workspace: 'llm-other' }, { region: 'singapore' }, { model: 'qwen3.8-omni-flash-realtime' }]) {
    state.settings = { ...state.settings, ...change };
    assert.equal((await check.status()).verified, false, JSON.stringify(change));
    state.settings = { ...state.settings, ...Object.fromEntries(Object.keys(change).map(key => [key, { workspace: 'llm-abc', region: 'beijing', model: 'qwen3.5-omni-plus-realtime' }[key]])) };
  }
  assert.equal((await check.status()).verified, true);
  // A key the credential service reports as replaced, a removed key, or voice switched off.
  state.info = { configured: true, updatedAt: '2026-11-23T08:00:00Z' };
  assert.equal((await check.status()).verified, false);
  state.info = { configured: true };
  state.info = { configured: false };
  assert.equal((await check.status()).verified, false);
  state.info = { configured: true }; state.enabled = false;
  assert.equal((await check.status()).verified, false);
  state.enabled = true;
  assert.equal((await check.status()).verified, true);
});

test('forget clears a pass, a pass of older settings is not reused, and writes do not interleave', async t => {
  const { check, state } = fixture(t);
  const before = await check.fingerprint();
  state.settings = { ...state.settings, workspace: 'llm-changed-during-test' };
  await check.record(before);
  assert.equal((await check.status()).verified, false, 'settings changed while the test ran');
  await check.record(await check.fingerprint());
  assert.equal((await check.status()).verified, true);
  await Promise.all([check.record(await check.fingerprint()), check.forget()]);
  assert.equal((await check.status()).verified, false, 'the later forget wins');
  await check.record(null);
  assert.equal((await check.status()).verified, false, 'no settings to test means nothing to record');
});

test('a failed test of the current settings is reported as failed until a pass or a change', async t => {
  const { check, state } = fixture(t);
  await check.record(await check.fingerprint());
  await check.fail(await check.fingerprint());
  assert.deepEqual({ ...(await check.status()), testedAt: undefined }, { verified: false, failed: true, testedAt: undefined });
  state.settings = { ...state.settings, workspace: 'llm-fixed' };
  assert.deepEqual(await check.status(), { verified: false }, 'new settings have not been tested at all');
  await check.record(await check.fingerprint());
  assert.equal((await check.status()).verified, true); assert.equal((await check.status()).failed, undefined);
});

test('a failed test keeps only a short pattern-checked reason code, for the settings it tested', async t => {
  const { check, state, directory } = fixture(t);
  assert.equal(failureCode({ code: 'provider-error', detail: 'invalid_value' }), 'provider-error · invalid_value');
  assert.equal(failureCode({ code: 'provider-error', detail: 'Bearer sk-123 leaked' }), 'provider-error');
  assert.equal(failureCode({ code: 'ProviderError' }), null);
  assert.equal(failureCode(new Error('raw message')), null);
  const tested = await check.fingerprint();
  await check.fail(tested, failureCode({ code: 'provider-error', detail: 'invalid_value' }));
  assert.deepEqual({ ...(await check.status()), testedAt: undefined }, { verified: false, failed: true, failureCode: 'provider-error · invalid_value', testedAt: undefined });
  // Anything that is not one of our short codes is not stored at all.
  await check.fail(tested, 'see https://example.invalid/?key=sk-1');
  assert.equal((await check.status()).failureCode, undefined);
  assert.doesNotMatch(fs.readFileSync(path.join(directory, 'voice-check.json'), 'utf8'), /example|sk-/u);
  // A pass clears it, and a reason never outlives a settings change.
  await check.fail(tested, 'probe-timeout');
  state.settings = { ...state.settings, workspace: 'llm-other' };
  assert.deepEqual(await check.status(), { verified: false });
  state.settings = { ...state.settings, workspace: 'llm-abc' };
  await check.record(tested);
  assert.equal((await check.status()).failureCode, undefined);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { en, zh } from '../locale/dictionaries.js';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = fileURLToPath(new URL('../', import.meta.url));
const result = await build({ absWorkingDir: root, entryPoints: ['client/settings-dialog.jsx'], bundle: true, format: 'cjs', platform: 'browser', external: ['react'], loader: { '.css': 'text' }, write: false });
const settings = { exports: {} };
vm.runInNewContext(result.outputFiles[0].text, { module: settings, exports: settings.exports, require, AbortController, setTimeout, clearTimeout, console, crypto: globalThis.crypto, URL, Blob, atob, btoa });
const { SettingsDialog, commitSettings, settingsChanges, settingsProblem } = settings.exports;
const translate = dictionary => (key, params = {}) => String(dictionary[key] || key).replace(/\{([^}]+)\}/g, (_match, name) => params[name] ?? name);
const plain = value => JSON.parse(JSON.stringify(value));
const base = { realtimeEnabled: false, realtimeRegion: 'beijing', realtimeWorkspace: '', realtimeModel: 'qwen3.5-omni-plus-realtime', realtimeCredential: 'ZHIJING_REALTIME_API_KEY' };
const ready = (value = base, writable = true) => () => ({ status: 'ready', writable, revision: 7, value });

test('a workspace ID turns the service on; clearing it turns it off; nothing else changes', () => {
  assert.deepEqual(plain(settingsChanges(base, null)), { next: base, dirty: false });
  const on = settingsChanges(base, { realtimeWorkspace: 'llm-abc' });
  assert.equal(on.dirty, true); assert.equal(on.next.realtimeEnabled, true); assert.equal(on.next.realtimeCredential, base.realtimeCredential);
  const saved = { ...base, realtimeEnabled: true, realtimeWorkspace: 'llm-abc' };
  assert.equal(settingsChanges(saved, null).dirty, false);
  assert.equal(settingsChanges(saved, { realtimeWorkspace: '' }).next.realtimeEnabled, false);
  // An old saved workspace that was switched off is switched on by saving.
  assert.equal(settingsChanges({ ...saved, realtimeEnabled: false }, null).dirty, true);
});

test('checks run before anything is written and name the one thing to fix', () => {
  const next = { ...base, realtimeWorkspace: 'llm-abc', realtimeEnabled: true };
  assert.equal(settingsProblem({ ready: false, writable: false, next, key: '' }), 'rtSettingsUnavailable');
  assert.equal(settingsProblem({ ready: true, writable: false, next, key: '' }), 'rtSettingsReadonly');
  assert.equal(settingsProblem({ ready: true, writable: true, next: { ...next, realtimeWorkspace: 'bad id/' }, key: '' }), 'rtSettingsInvalid');
  assert.equal(settingsProblem({ ready: true, writable: true, next: base, key: 'sk-abc' }), 'setNeedWorkspace');
  assert.equal(settingsProblem({ ready: true, writable: true, next, key: 'abc' }), 'setKeyBadPrefix');
  assert.equal(settingsProblem({ ready: true, writable: true, next, key: 'sk-ws-abc' }), null);
});

test('saving writes the fields with the observed revision, then the key, and stops at the first refusal without echoing the key', async () => {
  const calls = [];
  const saveSettings = async (value, revision) => { calls.push(['settings', value.realtimeWorkspace, value.realtimeEnabled, revision]); return 'saved'; };
  const storeCredential = async (ref, value) => { calls.push(['key', ref, value.length]); return 'saved'; };
  const done = await commitSettings({ ready: true, writable: true, base, draft: { realtimeWorkspace: 'llm-abc' }, revision: 7, key: '  sk-ws-secret  ', saveSettings, storeCredential });
  assert.deepEqual(plain(done), { ok: true, savedSettings: true, savedKey: true });
  assert.deepEqual(calls, [['settings', 'llm-abc', true, 7], ['key', 'ZHIJING_REALTIME_API_KEY', 'sk-ws-secret'.length]]);

  calls.length = 0;
  const conflict = await commitSettings({ ready: true, writable: true, base, draft: { realtimeWorkspace: 'llm-abc' }, revision: 6, key: 'sk-ws-secret',
    saveSettings: async () => 'conflict', storeCredential });
  assert.deepEqual(plain(conflict), { ok: false, notice: 'rtSettingsConflict', savedSettings: false, savedKey: false });
  assert.deepEqual(calls, []);

  const refused = await commitSettings({ ready: true, writable: true, base: { ...base, realtimeEnabled: true, realtimeWorkspace: 'llm-abc' }, draft: null, revision: 7, key: 'sk-ws-secret',
    saveSettings: async () => { throw new Error('unchanged fields must not be written'); }, storeCredential: async () => 'readonly' });
  assert.deepEqual(plain(refused), { ok: false, notice: 'rtCredentialReadonly', savedSettings: false, savedKey: false });
  assert.equal(JSON.stringify(refused).includes('secret'), false);
  // Nothing typed and nothing changed: nothing is written.
  assert.deepEqual(plain(await commitSettings({ ready: true, writable: true, base, draft: null, revision: 7, key: '', saveSettings, storeCredential })), { ok: true, savedSettings: false, savedKey: false });
});

test('the window asks for exactly the region, workspace ID and key, in both languages, with an empty password field', () => {
  for (const dictionary of [zh, en]) {
    const html = renderToStaticMarkup(React.createElement(SettingsDialog, { t: translate(dictionary), onClose() {}, useRealtimeSettings: ready(),
      saveSettings: async () => 'saved', describeCredential: async () => ({ status: 'ready', configured: false, writable: true }), storeCredential: async () => 'saved',
      testAudio: async () => ({}), cancelAudio: async () => ({}), workspaces: [{ workspaceId: 'w1', title: 'Jobs' }], workspaceId: 'w1' }));
    for (const key of ['setTitle', 'setVoice', 'setRegion', 'rtSettingsBeijing', 'rtSettingsSingapore', 'setWorkspace', 'setWorkspaceNote', 'setKey', 'setKeyNote', 'setTest', 'setTestNote',
      'compatibleVoiceInput', 'setWorkspaceDsh', 'setWorkspaceAuto', 'setStatusNone', 'save', 'cancel']) assert.ok(html.includes(dictionary[key]), key);
    assert.match(html, /<input type="password"[^>]*value=""/);
    assert.ok(html.includes('role="radio" aria-checked="true" class="is-on"'));
    // The model list and the credential reference name stay out of the way.
    assert.equal(html.includes('qwen3.8-omni-flash-realtime'), false);
    assert.equal(html.includes(dictionary.rtSettingsCredentialRef), false);
    assert.equal(/endpoint|https?:\/\//i.test(html), false);
  }
});

test('without the host form the window says so and cannot save; a read-only form says it is read-only', () => {
  const t = translate(en);
  const missing = renderToStaticMarkup(React.createElement(SettingsDialog, { t, onClose() {} }));
  assert.ok(missing.includes(en.rtSettingsUnavailable));
  assert.match(missing, /<button type="button" class="zj-btn primary" disabled="">Save<\/button>/);
  const readonly = renderToStaticMarkup(React.createElement(SettingsDialog, { t, onClose() {}, useRealtimeSettings: ready(base, false) }));
  assert.ok(readonly.includes(en.rtSettingsReadonly));
  const connected = renderToStaticMarkup(React.createElement(SettingsDialog, { t, onClose() {}, voiceReady: true, useRealtimeSettings: ready({ ...base, realtimeEnabled: true, realtimeWorkspace: 'llm-abc' }) }));
  assert.ok(connected.includes(en.setStatusOk)); assert.ok(connected.includes('value="llm-abc"'));
  // Saved but not yet passing a test is its own state, never "set up".
  const untested = renderToStaticMarkup(React.createElement(SettingsDialog, { t, onClose() {}, voiceReady: false, voiceSaved: true, useRealtimeSettings: ready({ ...base, realtimeEnabled: true, realtimeWorkspace: 'llm-abc' }) }));
  assert.ok(untested.includes(en.setStatusUntested)); assert.equal(untested.includes(`>${en.setStatusOk}<`), false);
});

test('a failed test keeps its reason after Settings is closed: reopening shows the sentence and the short code', () => {
  for (const dictionary of [zh, en]) {
    const t = translate(dictionary);
    const html = renderToStaticMarkup(React.createElement(SettingsDialog, { t, onClose() {}, voiceSaved: true, voiceFailed: true,
      voiceFailureCode: 'provider-error · invalid_value', useRealtimeSettings: ready({ ...base, realtimeEnabled: true, realtimeWorkspace: 'ws-abc' }) }));
    assert.ok(html.includes(dictionary.setStatusFailed));
    assert.ok(html.includes(dictionary.setLastFailure + dictionary.rtProbeRejected), 'the sentence for provider-error');
    assert.ok(html.includes(t('rtProbeCode', { code: 'provider-error · invalid_value' })));
    // Without a kept code the window stays as before, and a passing state shows no old failure.
    const bare = renderToStaticMarkup(React.createElement(SettingsDialog, { t, onClose() {}, voiceSaved: true, voiceFailed: true,
      useRealtimeSettings: ready({ ...base, realtimeEnabled: true, realtimeWorkspace: 'ws-abc' }) }));
    assert.equal(bare.includes(dictionary.setLastFailure), false);
    const passed = renderToStaticMarkup(React.createElement(SettingsDialog, { t, onClose() {}, voiceReady: true, voiceSaved: true,
      voiceFailureCode: 'provider-error', useRealtimeSettings: ready({ ...base, realtimeEnabled: true, realtimeWorkspace: 'ws-abc' }) }));
    assert.equal(passed.includes(dictionary.setLastFailure), false);
  }
});

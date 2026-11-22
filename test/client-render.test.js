import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { zh, en } from '../locale/dictionaries.js';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = fileURLToPath(new URL('../', import.meta.url));
async function compile(entry, globals = {}) {
  const result = await build({ absWorkingDir: root, entryPoints: [entry], bundle: true, format: 'cjs', platform: 'browser', external: ['react'], loader: { '.css': 'text' }, write: false });
  const module = { exports: {} };
  vm.runInNewContext(result.outputFiles[0].text, { module, exports: module.exports, require, fetch: async () => {},
    AbortController, DOMException, crypto: globalThis.crypto, setInterval, clearInterval, setTimeout, clearTimeout, URL, console, ...globals });
  return module.exports;
}
const translate = dictionary => (key, params = {}) => String(dictionary[key] || key).replace(/\{([^}]+)\}/g, (_match, name) => params[name] ?? name);
const empty = { materials: [], goals: [], conversations: [], assessments: [], rewrites: [], interviews: [], reports: [], runs: [] };

test('workbench registers only native public slots and disposes every contribution', async () => {
  const plugin = await compile('client/index.jsx');
  const entries = new Map();
  const effects = [];
  let resourceCount = 0, localeCount = 0;
  const ctx = {
    slots: {
      inject(_name, register) { return register(); },
      register(options, Component) { const key = `${options.name}:${options.key || options.id || ''}`; entries.set(key, { options, Component }); return () => entries.delete(key); },
    },
    locale: { register() { localeCount++; return () => localeCount--; }, bind: () => translate(zh) },
    resources: { register(provider) { assert.equal(provider.protocol, 'zhijingchat'); resourceCount++; return () => resourceCount--; } },
    sessions: {}, workspaces: { list: { getSnapshot: () => ({ items: [] }) } }, effect(install) { effects.push(install()); },
  };
  plugin.apply(ctx);
  assert.deepEqual([...entries.keys()].sort(), ['main:zhijing', 'plugins.bundle.config:dsh-interview-desk', 'sidebar.panellist:zhijing', 'zhijing.conversation:']);
  assert.equal(entries.get('main:zhijing').options.children['zhijing.conversation'].scope, 'session');
  assert.deepEqual(Object.keys(entries.get('main:zhijing').options.children), ['zhijing.conversation']);
  assert.equal(resourceCount, 1); assert.equal(localeCount, 1);
  for (const dispose of effects.reverse()) dispose();
  assert.equal(entries.size, 0); assert.equal(resourceCount, 0); assert.equal(localeCount, 0);
});

test('the workbench slot carries the settings form and write-only credential actions, rebinding only when they change', async () => {
  const plugin = await compile('client/index.jsx');
  let options; const effects = [];
  let form = { getSnapshot: () => ({ status: 'ready', writable: true, revision: 1, value: {} }), subscribe: () => () => {} };
  const credentials = { describe: async () => ({ ok: true, value: {} }), set: async () => ({ ok: true }) };
  const ctx = {
    slots: { inject(_name, register) { return register(); }, register(value) { if (value.key === 'zhijing') options = value; return () => {}; } },
    locale: { register: () => () => {}, bind: () => translate(en) }, resources: { register: () => () => {} },
    sessions: {}, workspaces: { list: { getSnapshot: () => ({ items: [] }) } },
    get: name => name === 'configForms' ? { get: key => key === 'dsh-interview-desk' ? form : undefined } : name === 'remote.credentials' ? credentials : undefined,
    effect(install) { effects.push(install()); },
  };
  plugin.apply(ctx);
  const first = options.inject(), second = options.inject();
  assert.equal(first, second);
  assert.equal(first.hooks.realtimeSettings, form); assert.ok(first.hooks.career);
  for (const name of ['saveSettings', 'describeCredential', 'storeCredential', 'testAudio', 'cancelAudio']) assert.equal(typeof first.settingsActions[name], 'function', name);
  assert.equal('resolve' in first.settingsActions, false);
  form = { ...form };
  assert.notEqual(options.inject(), first);
  for (const dispose of effects.reverse()) dispose();
});

test('workbench interview callbacks bind materials then use native prompts for every mutation', async () => {
  const requests = [], prompts = [], created = [], effects = []; let actions, started = false;
  const plugin = await compile('client/index.jsx', { fetch: async (_url, options) => {
    const body = JSON.parse(options.body); requests.push(body);
    const data = body.action === 'state' ? { ...empty, interviews: started ? [{ id: 'interview-1', sessionId: 'session-1' }] : [] } : { sessionId: 'session-1' };
    return { ok: true, json: async () => ({ ok: true, data }) };
  } });
  const ctx = {
    slots: { inject(_name, register) { return register(); }, register(options) { if (options.key === 'zhijing') actions = options.inject(); return () => {}; } },
    locale: { register: () => () => {}, bind: () => translate(en) }, resources: { register: () => () => {} },
    workspaces: { list: { getSnapshot: () => ({ items: [{ workspaceId: 'workspace-1' }] }) } },
    sessions: { list: { getSnapshot: () => ({ byId: {} }), subscribe: () => () => {} }, create: async input => { created.push(input.workspaceId); return 'session-1'; },
      async using(_id, _options, operation) { return operation({ ready: Promise.resolve({ session: {
        beginSubmission: () => ({ requestId: 'r1', abandon() {} }), async prompt(content) { prompts.push(content[0].text); started = true; return { ok: true, value: { accepted: true } }; },
      } }) }); } },
    effect(install) { effects.push(install()); },
  };
  plugin.apply(ctx);
  await assert.rejects(actions.startInterview({ goalId: 'goal-1', versionId: 'version-1', workspaceId: 'gone' }), { code: 'WORKSPACE_REQUIRED' });
  await assert.rejects(actions.createConversation(null, 'Chat'), { code: 'WORKSPACE_REQUIRED' });
  assert.equal(created.length, 0);
  await actions.startInterview({ goalId: 'goal-1', versionId: 'version-1', language: 'en', questionCount: 3, workspaceId: 'workspace-1' });
  assert.deepEqual(created, ['workspace-1']);
  assert.match(requests[0].requestId, /^zhijing-[a-f0-9-]{36}$/);
  assert.deepEqual(requests[0], { action: 'conversation.link', input: { goalId: 'goal-1', versionId: 'version-1', sessionId: 'session-1', title: en.interview, kind: 'interview' }, requestId: requests[0].requestId });
  for (const action of ['interview.answer', 'interview.pause', 'interview.resume', 'interview.finish']) await actions.interviewAction(action, { interviewId: 'interview-1', questionNumber: 1, text: 'My actual words.' });
  assert.deepEqual(prompts, ['Please start a mock interview in English with 3 main questions.', 'Submit my answer to question 1\n\nMy actual words.', 'Please pause this mock interview.', 'Please resume this mock interview.', 'Please finish this mock interview and create the report.']);
  assert.equal(requests.some(row => row.action.startsWith('interview.')), false);
  for (const dispose of effects.reverse()) dispose();
});

test('workbench voice enablement is user-triggered, uses only the official manager, and does not disable it on disposal', async () => {
  const plugin = await compile('client/index.jsx');
  const effects = [], calls = []; let actions;
  const bundle = '@deepseek-ai/dsh-experimental-voice-input-bundle';
  const manager = {
    async listBundles() { calls.push(['list']); return { ok: true, value: [{ name: bundle, availability: 'installation', installed: false }] }; },
    async setBundleEnabled(...args) { calls.push(['enable', ...args]); return { ok: true, value: { application: 'applied', target: bundle, enabled: true } }; },
  };
  const ctx = {
    slots: { inject(_name, register) { return register(); }, register(options) { if (options.key === 'zhijing') actions = options.inject(); return () => {}; } },
    locale: { register: () => () => {}, bind: () => translate(en) }, resources: { register: () => () => {} },
    sessions: {}, workspaces: { list: { getSnapshot: () => ({ items: [] }) } },
    get: name => name === 'remote.pluginManager' ? manager : name === 'pluginNavigation' ? { openBundle(name) { calls.push(['settings', name]); } } : undefined,
    effect(install) { effects.push(install()); },
  };
  plugin.apply(ctx); assert.deepEqual(calls, []);
  const result = await actions.enableVoiceInput(); assert.equal(result.status, 'applied');
  assert.deepEqual(calls, [['list'], ['enable', bundle, true], ['settings', bundle]]);
  for (const dispose of effects.reverse()) dispose();
  assert.equal(calls.length, 3);
});

const appProps = (dictionary, data, extra = {}) => ({ t: translate(dictionary), useCareer: () => ({ data, ready: true, pending: 0 }), useNativeSessions: () => ({ ids: [], byId: {} }),
  useWorkspaceChoices: () => ({ items: [], phase: 'ready' }), renderSlot: () => null, ...extra });

test('a new user lands on the interview page: four rows, one start button, no old workbench chrome', async () => {
  const { App } = await compile('client/workbench.jsx');
  for (const dictionary of [zh, en]) {
    const html = renderToStaticMarkup(React.createElement(App, appProps(dictionary, empty)));
    assert.ok(html.includes('data-prepare'));
    for (const key of ['prepSlogan', 'prepLead', 'deskRowJob', 'deskRowResume', 'deskRowScore', 'deskRowVoice', 'deskHeadJob', 'prepStart', 'navInterview', 'navReview', 'navLibrary', 'voiceChipNone', 'openSettings'])
      assert.ok(html.includes(dictionary[key]), key);
    // The rows come in the order the user meets them.
    assert.ok(html.indexOf(dictionary.deskRowJob) < html.indexOf(dictionary.deskRowResume));
    assert.ok(html.indexOf(dictionary.deskRowResume) < html.indexOf(dictionary.deskRowScore));
    for (const old of ['class="zj-rail', 'class="zj-desk-nav', 'class="zj-review-note', '<iframe', 'class="zj-score"', 'data-step=']) assert.equal(html.includes(old), false, old);
    // Nothing is fabricated before any score exists.
    assert.equal(/\d+ ?分|\d+ · passed/.test(html.replace(/\d+ 题|\d+ questions/g, '')), false);
  }
});

test('a returning user starts from the newest role and confirmed resume, and voice says whether it is set up', async () => {
  const { App } = await compile('client/workbench.jsx');
  const data = { ...empty,
    materials: [{ id: 'mj', kind: 'job', title: 'JD', createdAt: '2026-11-01', latestVersionId: 'j1', versions: [{ id: 'j1', revision: 1, text: 'job', confirmed: true }] },
      { id: 'mr', kind: 'resume', title: 'CV.pdf', createdAt: '2026-11-02', latestVersionId: 'r1', versions: [{ id: 'r1', revision: 1, text: 'cv', confirmed: true }] }],
    goals: [{ id: 'old', title: 'Old role', status: 'archived', createdAt: '2026-11-03', materialLinks: [{ kind: 'job', versionId: 'j1' }], conversations: [] },
      { id: 'g', title: 'Data analyst', status: 'active', createdAt: '2026-11-02', materialLinks: [{ kind: 'job', versionId: 'j1' }], conversations: [] }] };
  for (const dictionary of [zh, en]) {
    const html = renderToStaticMarkup(React.createElement(App, appProps(dictionary, data)));
    assert.ok(html.includes('Data analyst')); assert.equal(html.includes('Old role'), false);
    assert.ok(html.includes('CV.pdf')); assert.ok(html.includes(dictionary.deskHeadScore));
    assert.ok(html.includes(dictionary.deskVoiceNone));
    assert.equal(html.includes('data-settings-voice'), false);
  }
});

test('an embedded conversation preserves its exact session and does not offer the global new-session hero', async () => {
  const { Conversation } = await compile('client/native-chat.jsx');
  let supplied;
  renderToStaticMarkup(React.createElement(Conversation, { useSession: () => ({ blank: true, openState: 'open' }), renderFactorySlot: (name, props) => { supplied = { name, props }; return null; } }));
  assert.equal(supplied.name, 'conversation.content'); assert.equal(supplied.props.hero, false); assert.equal(supplied.props.variant, 'embedded');
});

test('material reading escapes imported text and keeps the unconfirmed review gate visible', async () => {
  const { Materials } = await compile('client/materials.jsx');
  const state = { ...empty, materials: [{ id: 'm1', title: '<script>alert(1)</script>', kind: 'resume', latestVersionId: 'v1', versions: [{ id: 'v1', revision: 1, text: '<img src=x onerror=alert(1)>', confirmed: false }] }] };
  const html = renderToStaticMarkup(React.createElement(Materials, { state, t: translate(zh), busy: false }));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img'));
  assert.equal(html.includes('<script>alert'), false);
  assert.ok(html.includes(zh.confirm));
  assert.ok(html.includes(zh.reviewNote));
  assert.match(html, /disabled=""[^>]*>分析这份简历/);
});

test('insufficient evidence is never rendered as a zero score', async () => {
  const { Evaluation } = await compile('client/components.jsx');
  const html = renderToStaticMarkup(React.createElement(Evaluation, { result: { total: null, criteria: [], suggestions: [] }, t: translate(en) }));
  assert.ok(html.includes(en.insufficient));
  assert.equal(html.includes('class="zj-score"'), false);
});

test('source review exposes original downloads and text locations without inventing Word page numbers',async()=>{
  const {SourceDialog}=await compile('client/source.jsx');
  const data={versionId:'v1',title:'Resume',source:{originalFileId:'opaque'},metadata:{text:'First paragraph',document:{blocks:[{kind:'docx',blockIndex:0,text:'First paragraph',path:'document/body/p[0]',startOffset:0,endOffset:15}]},original:{mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}}};
  const html=renderToStaticMarkup(React.createElement(SourceDialog,{data,t:translate(en)}));
  assert.ok(html.includes(en.downloadOriginal));assert.ok(html.includes('<mark>First paragraph</mark>'));
  assert.ok(html.includes('<details'));assert.equal(/<details[^>]*\bopen/.test(html),false);
  assert.equal(html.includes('Page 1'),false);assert.equal(html.includes('<iframe'),false);
});

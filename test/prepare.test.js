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
async function compile(entry) {
  const result = await build({ absWorkingDir: root, entryPoints: [entry], bundle: true, format: 'cjs', platform: 'browser', external: ['react'], loader: { '.css': 'text' }, write: false });
  const module = { exports: {} };
  vm.runInNewContext(result.outputFiles[0].text, { module, exports: module.exports, require, AbortController, setTimeout, clearTimeout, console });
  return module.exports;
}
const prepare = await compile('client/prepare.jsx');
const t = (key, params = {}) => String(en[key] || key).replace(/\{([^}]+)\}/g, (_match, name) => params[name] ?? name);
const material = (id, kind, confirmed, title = id) => ({ id: `m-${id}`, kind, title, versions: [{ id, revision: 1, text: `${title} text`, confirmed }] });
const state = (...materials) => ({ materials, goals: [], conversations: [], assessments: [], rewrites: [], interviews: [], reports: [], runs: [] });

test('progress follows saved and confirmed versions, not button presses', () => {
  const { prepareProgress } = prepare;
  assert.equal(prepareProgress(state(), {}).current, 'job');
  const jobOnly = state(material('j', 'job', false));
  assert.equal(prepareProgress(jobOnly, { role: 'Role', jobVersionId: 'j' }).jobReady, false);
  const both = state(material('j', 'job', true), material('r', 'resume', true));
  const done = prepareProgress(both, { role: 'Role', jobVersionId: 'j', resumeVersionId: 'r' });
  assert.equal(done.current, 'start'); assert.equal(done.ready, true);
  // A version of the wrong kind never counts for a step.
  assert.equal(prepareProgress(both, { role: 'Role', jobVersionId: 'r', resumeVersionId: 'j' }).ready, false);
  // Without a role there is nothing to name the goal.
  assert.equal(prepareProgress(both, { role: '  ', jobVersionId: 'j', resumeVersionId: 'r' }).ready, false);
});

test('voice stays the default way to interview', () => {
  assert.equal(prepare.PREPARE_DEFAULTS.mode, 'realtime');
  assert.equal(prepare.PREPARE_DEFAULTS.questionCount, 5);
});

test('the start bar offers voice, text, counts and language once both sides are confirmed', () => {
  const both = state(material('j', 'job', true), material('r', 'resume', true, 'CV.pdf'));
  const html = renderToStaticMarkup(React.createElement(prepare.Prepare, { t, state: both, draft: { role: 'Data analyst', jobVersionId: 'j', resumeVersionId: 'r' },
    action: async () => undefined, upload: async () => undefined, startInterview: async () => undefined, workspaceId: 'ws' }));
  for (const key of ['realtimeCall', 'textInterview', 'zhLanguage', 'enLanguage', 'prepStart']) assert.ok(html.includes(en[key]), key);
  assert.ok(html.includes('aria-pressed="true">' + en.realtimeCall));
  assert.ok(html.includes('Data analyst')); assert.ok(html.includes('CV.pdf'));
  assert.equal(html.includes(en.prepNotReady), false);
});

test('an unconfirmed upload asks for review before the flow moves on', () => {
  const html = renderToStaticMarkup(React.createElement(prepare.Prepare, { t, state: state(material('r', 'resume', false, 'CV.pdf')), draft: { resumeVersionId: 'r' },
    action: async () => undefined, upload: async () => undefined, startInterview: async () => undefined }));
  assert.ok(html.includes(en.prepReviewNote)); assert.ok(html.includes(en.prepConfirmThis)); assert.ok(html.includes(en.prepNotReady));
});

test('prepare copy exists in both languages', () => {
  for (const key of Object.keys(en).filter(key => key.startsWith('prep'))) assert.ok(zh[key], key);
});

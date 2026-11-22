import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { en } from '../locale/dictionaries.js';

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
const workbench = await compile('client/workbench.jsx');
const components = await compile('client/components.jsx');
const interview = await compile('client/interview.jsx');
const t = (key, params = {}) => String(en[key] || key).replace(/\{([^}]+)\}/g, (_match, name) => params[name] ?? name);
const fixture = () => ({ materials: [
  { id: 'resume', kind: 'resume', title: 'My resume', versions: [{ id: 'r2', revision: 2, confirmed: true }, { id: 'r1', revision: 1, confirmed: true }, { id: 'unconfirmed', revision: 3, confirmed: false }] },
  { id: 'job', kind: 'job', title: 'Role', versions: [{ id: 'j1', confirmed: true }] },
], reports: [] });


const nav = await compile('client/desk-nav.js');
const step = (state, ...events) => events.reduce(nav.deskNavigation, state);

test('one state decides the screen: three pages, and the interview room covers them', () => {
  let state = nav.initialDesk();
  assert.equal(nav.deskScreen(state), 'interview');
  state = step(state, { type: 'page', page: 'library' }, { type: 'open', target: { kind: 'material', id: 'm1' } });
  assert.equal(nav.deskScreen(state), 'library:material');
  state = step(state, { type: 'room', sessionId: 's1' });
  assert.equal(nav.deskScreen(state), 'room');
  // Leaving the room returns to exactly where it was opened from.
  state = step(state, { type: 'leaveRoom' });
  assert.equal(nav.deskScreen(state), 'library:material');
  // A tab click always lands on the tab itself.
  state = step(state, { type: 'room', sessionId: 's1' }, { type: 'page', page: 'review' });
  assert.equal(nav.deskScreen(state), 'review'); assert.equal(state.room, null);
  assert.deepEqual([...nav.DESK_PAGES], ['interview', 'review', 'library']);
});

test('unknown pages and sheets are ignored; settings and the assistant never move the page', () => {
  let state = step(nav.initialDesk(), { type: 'page', page: 'goals' }, { type: 'open', page: 'home', target: { kind: 'goal', id: 'g' } });
  assert.equal(state.page, 'interview'); assert.equal(state.open, null);
  state = step(state, { type: 'sheet', sheet: 'score' });
  assert.equal(state.sheet, 'score');
  state = step(state, { type: 'sheet', sheet: 'anything' });
  assert.equal(state.sheet, null);
  state = step(state, { type: 'sheet', sheet: 'job' }, { type: 'settings', open: true }, { type: 'dock' }, { type: 'session', sessionId: 's2' });
  assert.equal(state.page, 'interview'); assert.equal(state.sheet, 'job'); assert.equal(state.settings, true);
  assert.equal(state.sessionId, 's2'); assert.equal(state.dock, true);
  // Entering the room closes the sheet and the settings window.
  state = step(state, { type: 'room', sessionId: 's3' });
  assert.equal(state.sheet, null); assert.equal(state.settings, false);
  assert.equal(step(state, { type: 'room' }).room, 's3');
});

test('unfinished drafts survive every move and stay scoped to their own key', () => {
  const sourceA = { material: { id: 'm1' }, version: { id: 'v1' } };
  const sourceB = { material: { id: 'm1' }, version: { id: 'v2' } };
  const keys = [workbench.materialDraftKey(sourceA), workbench.materialDraftKey(sourceB),
    workbench.materialDraftKey({ initialKind: 'job', goalId: 'A' }), workbench.materialDraftKey({ initialKind: 'job', goalId: 'B' }),
    'prepare', 'answer:interview-1:q1', 'answer:interview-1:q2'];
  assert.equal(new Set(keys).size, keys.length);
  let state = nav.initialDesk();
  keys.forEach((key, index) => { state = nav.deskNavigation(state, { type: 'draft', key, value: { text: `draft-${index}` } }); });
  state = step(state, { type: 'page', page: 'library' }, { type: 'open', target: { kind: 'goal', id: 'A' } }, { type: 'room', sessionId: 's' },
    { type: 'leaveRoom' }, { type: 'page', page: 'review' }, { type: 'settings', open: true }, { type: 'page', page: 'interview' });
  keys.forEach((key, index) => assert.equal(state.drafts[key].text, `draft-${index}`));
  // Saving a draft never moves the user.
  const before = { page: state.page, open: state.open, room: state.room, sheet: state.sheet };
  state = nav.deskNavigation(state, { type: 'draft', key: keys[0], value: undefined });
  assert.deepEqual({ page: state.page, open: state.open, room: state.room, sheet: state.sheet }, before);
  assert.equal(state.drafts[keys[0]], undefined); assert.equal(state.drafts[keys[1]].text, 'draft-1');
});

test('interview inherits the selected confirmed immutable resume and retains cancelled language/count preferences', () => {
  const state = fixture();
  const draft = interview.interviewFormDraft(state, 'r1', { versionId: 'r2', language: 'en', questionCount: 3 });
  assert.equal(draft.versionId, 'r1'); assert.equal(draft.language, 'en'); assert.equal(draft.questionCount, 3);
  assert.equal(interview.interviewFormDraft(state, 'unconfirmed').versionId, '');
  assert.equal(interview.interviewFormDraft(state, 'j1').versionId, '');
  assert.equal(interview.interviewFormDraft(state, 'deleted', { versionId: 'deleted' }).versionId, '');
  const html = renderToStaticMarkup(React.createElement(interview.InterviewForm, {
    state, goal: { id: 'A', materialLinks: [{ versionId: 'j1' }] }, t, selectedVersion: 'r1',
  }));
  assert.match(html, /<option value="r1" selected="">/);
  assert.doesNotMatch(html, /<option value="r2" selected="">/);
});

test('reopened upload uses its retained File without pretending to restore the browser file input', () => {
  const html = renderToStaticMarkup(React.createElement(components.MaterialForm, { t,
    draft: { mode: 'file', kind: 'resume', title: 'Resume draft', text: '', url: '', file: { name: 'resume.pdf' } },
  }));
  assert.match(html, /value="Resume draft"/); assert.match(html, /<span>resume.pdf<\/span>/);
  const fileInput = html.match(/<input[^>]*type="file"[^>]*>/)?.[0];
  assert.ok(fileInput); assert.doesNotMatch(fileInput, /required|value=/);
});

test('returning to a question restores its draft without attaching it to the next question', () => {
  const state = fixture();
  const data = { id: 'i1', currentQuestionId: 'q1', status: 'active', language: 'en', questions: [{ id: 'q1', text: 'First question' }, { id: 'q2', text: 'Next question' }] };
  const props = { state, interview: data, t, answerDraft: { questionId: 'q1', text: 'My unfinished example', speechDraft: null } };
  assert.match(renderToStaticMarkup(React.createElement(interview.Interview, props)), /My unfinished example/);
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(interview.Interview, { ...props, interview: { ...data, currentQuestionId: 'q2' } })), /My unfinished example/);
});

test('rapid duplicate submission is ignored and a failed request can be retried', async () => {
  const guard = components.createSubmissionGuard();
  let finish, calls = 0;
  const request = guard(() => { calls++; return new Promise(resolve => { finish = resolve; }); });
  assert.equal(await guard(() => { calls++; }), undefined); assert.equal(calls, 1);
  finish('saved'); assert.equal(await request, 'saved');
  await assert.rejects(guard(async () => { calls++; throw new Error('network'); }), /network/);
  assert.equal(await guard(async () => { calls++; return 'retry-saved'; }), 'retry-saved'); assert.equal(calls, 3);
});

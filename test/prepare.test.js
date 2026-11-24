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
const goal = (id, jobVersionId) => ({ id, title: 'Data analyst', status: 'active', materialLinks: [{ kind: 'job', versionId: jobVersionId }], conversations: [] });
const assessment = (kind, total, { goalId = 'g', versionId = 'r', jobVersionId = 'j', suggestions = [] } = {}) => ({ id: `a-${kind}-${total}`, kind, goalId, versionId,
  inputVersions: [{ id: versionId }, { id: jobVersionId }], total, suggestions, missing: [],
  criteria: [{ id: kind === 'fit' ? 'skills' : 'evidence', name: kind, weight: 100, rating: total === null ? null : 3, score: total, reason: 'why', evidence: [] }] });
const scored = (fit, resume, extra = {}) => ({ ...state(material('j', 'job', true), material('r', 'resume', true, 'CV.pdf')),
  goals: [goal('g', 'j')], assessments: [assessment('fit', fit, extra), assessment('resume', resume, extra)] });
const render = (current, draft, extra = {}) => renderToStaticMarkup(React.createElement(prepare.Prepare, { t, state: current, draft: { role: 'Data analyst', jobVersionId: 'j', resumeVersionId: 'r', ...draft },
  action: async () => undefined, upload: async () => undefined, startInterview: async () => undefined, voiceReady: true, workspaceReady: true, ...extra }));
const startDisabled = html => /<button type="button" class="zj-btn primary" disabled="">Start the interview<\/button>/.test(html);
const score = await compile('client/score.js');

test('progress follows saved and confirmed versions, not button presses', () => {
  const { prepareProgress } = prepare;
  assert.equal(prepareProgress(state(), {}).current, 'job');
  const jobOnly = state(material('j', 'job', false));
  assert.equal(prepareProgress(jobOnly, { role: 'Role', jobVersionId: 'j' }).jobReady, false);
  const both = state(material('j', 'job', true), material('r', 'resume', true));
  const done = prepareProgress(both, { role: 'Role', jobVersionId: 'j', resumeVersionId: 'r' });
  assert.equal(done.current, 'score'); assert.equal(done.ready, true); assert.equal(done.cleared, false);
  // A version of the wrong kind never counts for a step.
  assert.equal(prepareProgress(both, { role: 'Role', jobVersionId: 'r', resumeVersionId: 'j' }).ready, false);
  // Without a role there is nothing to name the goal.
  assert.equal(prepareProgress(both, { role: '  ', jobVersionId: 'j', resumeVersionId: 'r' }).ready, false);
});

test('voice stays the default way to interview', () => {
  assert.equal(prepare.PREPARE_DEFAULTS.mode, 'realtime');
  assert.equal(prepare.PREPARE_DEFAULTS.questionCount, 5);
});

test('the start card offers voice, text, counts and language once the resume scores 80', () => {
  const html = render(scored(90, 70));
  for (const key of ['realtimeCall', 'textInterview', 'zhLanguage', 'enLanguage', 'prepStart', 'deskHeadReady']) assert.ok(html.includes(en[key]), key);
  assert.ok(html.includes('aria-pressed="true" class="is-on">' + en.realtimeCall));
  assert.ok(html.includes('Data analyst')); assert.ok(html.includes('CV.pdf'));
  assert.equal(startDisabled(html), false);
  assert.equal(html.includes(en.prepNotReady), false);
});

test('an unconfirmed upload asks for review in its sheet before the page moves on', () => {
  const props = { t, state: state(material('r', 'resume', false, 'CV.pdf')), draft: { resumeVersionId: 'r' },
    action: async () => undefined, upload: async () => undefined, startInterview: async () => undefined };
  const page = renderToStaticMarkup(React.createElement(prepare.Prepare, props));
  assert.ok(page.includes(en.prepNotReady)); assert.ok(page.includes(en.deskConfirmIt)); assert.equal(page.includes(en.prepReviewNote), false);
  const sheet = renderToStaticMarkup(React.createElement(prepare.Prepare, { ...props, sheet: 'resume' }));
  assert.ok(sheet.includes(en.prepReviewNote)); assert.ok(sheet.includes(en.prepConfirmThis)); assert.ok(sheet.includes('role="dialog"'));
});

test('the start button names one reason at a time: materials, score, voice, then workspace', () => {
  const below = prepare.prepareProgress(scored(70, 70), { role: 'R', jobVersionId: 'j', resumeVersionId: 'r' });
  const passed = prepare.prepareProgress(scored(90, 90), { role: 'R', jobVersionId: 'j', resumeVersionId: 'r' });
  const text = prepare.prepareProgress(scored(90, 90), { role: 'R', jobVersionId: 'j', resumeVersionId: 'r', mode: 'text' });
  assert.equal(prepare.startBlock(prepare.prepareProgress(state(), {})), 'prep');
  assert.equal(prepare.startBlock(below, { voiceReady: true, workspaceReady: true }), 'score');
  assert.equal(prepare.startBlock(passed, { voiceReady: false, workspaceReady: true }), 'voice');
  assert.equal(prepare.startBlock(text, { voiceReady: false, workspaceReady: true }), null);
  assert.equal(prepare.startBlock(passed, { voiceReady: true, workspaceReady: false }), 'workspace');
  assert.equal(prepare.startBlock(passed, { voiceReady: true, workspaceReady: true }), null);
  const html = render(scored(90, 90), {}, { voiceReady: false });
  assert.ok(html.includes(en.deskBlockedVoice)); assert.ok(html.includes(en.deskOpenSettings)); assert.ok(html.includes(en.deskUseText));
  assert.ok(html.includes(en.deskVoiceNone)); assert.ok(startDisabled(html));
  assert.ok(render(scored(90, 90), {}, { workspaceReady: false }).includes(en.deskBlockedWorkspace));
});

test('a returning user starts from the newest active role with a confirmed job and the newest confirmed resume', () => {
  const current = { ...state(material('j', 'job', true), material('j2', 'job', false), material('r', 'resume', true, 'Old CV'), material('r2', 'resume', true, 'New CV')),
    goals: [{ ...goal('g1', 'j'), title: 'Kept', createdAt: '2026-11-01' }, { ...goal('g2', 'j2'), title: 'Unconfirmed job', createdAt: '2026-11-05' },
      { ...goal('g3', 'j'), title: 'Archived', status: 'archived', createdAt: '2026-11-09' }] };
  current.materials[2].createdAt = '2026-11-01'; current.materials[3].createdAt = '2026-11-03';
  assert.deepEqual({ ...prepare.initialPrepareDraft(current) }, { role: 'Kept', goalId: 'g1', jobVersionId: 'j', resumeVersionId: 'r2' });
  assert.deepEqual({ ...prepare.initialPrepareDraft(state()) }, {});
});

test('prepare copy exists in both languages', () => {
  for (const key of Object.keys(en).filter(key => key.startsWith('prep'))) assert.ok(zh[key], key);
});

test('one score: the job weighs 65%, the resume 35%; 80 passes', () => {
  assert.equal(score.combinedScore({ total: 90 }, { total: 70 }), 83);
  assert.equal(score.combinedScore({ total: 80 }, { total: 79 }), 80);
  assert.equal(score.combinedScore({ total: 90 }, { total: null }), null);
  const passed = prepare.prepareProgress(scored(90, 70), { role: 'R', jobVersionId: 'j', resumeVersionId: 'r' });
  assert.equal(passed.score.total, 83); assert.equal(passed.score.pass, true); assert.equal(passed.cleared, true); assert.equal(passed.current, 'start');
  const below = prepare.prepareProgress(scored(70, 70), { role: 'R', jobVersionId: 'j', resumeVersionId: 'r' });
  assert.equal(below.score.total, 70); assert.equal(below.score.gap, 10); assert.equal(below.cleared, false); assert.equal(below.current, 'score');
});

test('a score belongs to its resume version, goal and job version', () => {
  const current = scored(90, 90);
  const scope = { goalId: 'g', resumeVersionId: 'r', jobVersionId: 'j' };
  assert.equal(score.resumeScore(current, scope).status, 'scored');
  assert.equal(score.resumeScore(current, { ...scope, resumeVersionId: 'r2' }).status, 'none');
  assert.equal(score.resumeScore(current, { ...scope, goalId: 'other' }).status, 'none');
  assert.equal(score.resumeScore(current, { ...scope, jobVersionId: 'j2' }).status, 'none');
  const half = { ...current, assessments: current.assessments.filter(row => row.kind === 'fit') };
  assert.equal(score.resumeScore(half, scope).missing.join(), 'resume');
  const unknown = scored(null, 90);
  assert.equal(score.resumeScore(unknown, scope).status, 'unknown'); assert.equal(score.resumeScore(unknown, scope).pass, false);
});

test('below 80 the start card sends the user to the score sheet, and skipping opens the start button', () => {
  const below = scored(70, 70);
  const gated = render(below);
  assert.ok(gated.includes(t('prepGateBelow', { score: 70 }))); assert.ok(gated.includes(en.prepGateBack));
  assert.ok(gated.includes(t('deskScoreBelow', { score: 70, gap: 10 }))); assert.ok(startDisabled(gated));
  // The score sheet offers revising, editing and skipping.
  const sheet = render(below, {}, { sheet: 'score' });
  for (const key of ['prepRevise', 'prepEditSelf', 'prepSkipScore', 'prepFitTitle', 'prepResumeTitle']) assert.ok(sheet.includes(en[key]), key);
  const skipped = render(below, { scoreSkippedFor: 'r' });
  assert.equal(startDisabled(skipped), false); assert.ok(skipped.includes(en.prepSkipped));
  // A skip is for one resume version; a new version is scored again.
  assert.equal(prepare.prepareProgress(below, { role: 'R', jobVersionId: 'j', resumeVersionId: 'r', scoreSkippedFor: 'old' }).cleared, false);
});

test('before any score the start card asks for one and does not offer skipping yet', () => {
  const html = render({ ...state(material('j', 'job', true), material('r', 'resume', true)) });
  assert.ok(html.includes(en.prepGateNone)); assert.ok(html.includes(en.deskScoreNone)); assert.ok(html.includes(en.deskScoreIt));
  assert.equal(html.includes(en.prepSkipScore), false);
  assert.ok(render({ ...state(material('j', 'job', true), material('r', 'resume', true)) }, {}, { sheet: 'score' }).includes(en.prepScoreRun));
});

test('the flow reuses a goal already linked to this job version', () => {
  const current = scored(90, 90);
  assert.equal(score.goalForJob(current, null, 'j').id, 'g');
  assert.equal(score.goalForJob(current, null, 'other'), null);
  assert.equal(score.goalForJob({ ...current, goals: [{ ...current.goals[0], status: 'archived' }] }, 'g', 'j'), null);
});

test('rewrite instructions carry the suggestions and the no-new-facts rule', () => {
  const current = scored(60, 60, { suggestions: [{ text: 'Add results.' }] });
  const result = score.resumeScore(current, { goalId: 'g', resumeVersionId: 'r', jobVersionId: 'j' });
  assert.equal(score.scoreSuggestions(result).join('|'), 'Add results.');
  const text = score.rewriteInstructions(result, t);
  assert.ok(text.startsWith(en.prepReviseRule)); assert.ok(text.includes('- Add results.'));
});

test('the previous version score shows the change after a revision', () => {
  const current = scored(60, 60);
  current.materials[1].versions.push({ id: 'r2', revision: 2, text: 'CV v2', confirmed: true });
  current.assessments.unshift(assessment('fit', 90, { versionId: 'r2' }), assessment('resume', 90, { versionId: 'r2' }));
  assert.equal(score.previousScore(current, { goalId: 'g', resumeVersionId: 'r2', jobVersionId: 'j' }, 'm-r'), 60);
});

test('scoring waits for both assessments and reports the first failure after both finish', async () => {
  const order = [];
  const slow = new Promise(resolve => setTimeout(() => { order.push('fit saved'); resolve('fit'); }, 20));
  const busy = Promise.reject(Object.assign(new Error('BUSY'), { code: 'BUSY' }));
  await assert.rejects(prepare.settleAll([slow, busy]).finally(() => order.push('settled')), { code: 'BUSY' });
  assert.deepEqual(order, ['fit saved', 'settled']);
  assert.deepEqual([...await prepare.settleAll([Promise.resolve(1), Promise.resolve(2)])], [1, 2]);
});

test('a failed score says what went wrong and keeps the code for a report', () => {
  const zhT = (key, params = {}) => String(zh[key] || key).replace(/\{([^}]+)\}/g, (_match, name) => params[name] ?? name);
  assert.equal(prepare.failureText({ code: 'BUSY' }, zhT), `${zh.prepFailBusy}（代码 BUSY）`);
  assert.equal(prepare.failureText({ code: 'EVIDENCE_QUOTE_MISMATCH' }, t), `${en.prepFailEvidence} (code EVIDENCE_QUOTE_MISMATCH)`);
  assert.equal(prepare.failureText({ code: 'MODEL_INVALID_JSON' }, t), `${en.prepFailFormat} (code MODEL_INVALID_JSON)`);
  assert.equal(prepare.failureText({ code: 'MODEL_NOT_CONFIGURED' }, t), `${en.prepFailModel} (code MODEL_NOT_CONFIGURED)`);
  // Only stable Host codes are shown, never a raw message.
  assert.equal(prepare.failureText({ code: 'lowercase raw message' }, t), en.prepFailGeneric);
  assert.equal(prepare.failureText(new Error('boom'), t), en.prepFailGeneric);
});

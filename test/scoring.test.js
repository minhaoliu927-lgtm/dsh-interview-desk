import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCareerService } from '../src/domain/index.js';
import { locateQuote, normalizeScoring, sourceAliases, RESUME_RUBRIC } from '../src/domain/validation.js';
import { parseModelJson } from '../src/model.js';

// Resume scoring with real-model slips. One slip used to throw away the whole
// score (and a stray null surfaced as MODEL_FAILED); now the answer is put back
// into shape, while every rated item still has to quote the real material.
const root = path.resolve(fileURLToPath(new URL('../.runtime/tests/scoring/', import.meta.url)));
const RESUME = '负责产品调研，访谈20名用户。\n整理需求文档，推动3个功能上线。';
const JOB = '产品经理需要用户调研和需求文档经验。';
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/u;

async function fixture(t, respond) {
  fs.mkdirSync(root, { recursive: true });
  const directory = fs.mkdtempSync(path.join(root, 'case-'));
  const calls = [];
  const service = createCareerService({ directory, generate: async args => { calls.push(structuredClone(args)); return { result: respond(args.input), model: { provider: 'fixture', model: 'slips' } }; } });
  t.after(async () => { await service.close?.(); fs.rmSync(directory, { recursive: true, force: true }); });
  const add = async (kind, text) => {
    const row = await service.dispatch('material.add', { title: kind === 'job' ? '岗位要求' : '我的简历', kind, text });
    await service.dispatch('material.confirm', { versionId: row.latestVersionId });
    return row.latestVersionId;
  };
  const versionId = await add('resume', RESUME), jobVersionId = await add('job', JOB);
  const goal = await service.dispatch('goal.create', { title: '产品经理' });
  await service.dispatch('goal.linkMaterial', { goalId: goal.id, versionId: jobVersionId });
  return { run: kind => service.dispatch('assessment.run', { kind, versionId, goalId: goal.id }), calls };
}

test('scoring survives the format slips real models make', async t => {
  const { run, calls } = await fixture(t, input => {
    const resume = input.snapshots.find(row => row.kind === 'resume'), job = input.snapshots.find(row => row.kind === 'job');
    const keyed = Object.fromEntries(input.rubric.map((row, index) => [index === 0 ? row.name : row.id, {
      rating: index === 1 ? '3' : index === 2 ? 2.6 : 4,
      ...(index === 3 ? { comment: '用了具体数字' } : index === 0 ? {} : { reason: '有依据' }),
      // One citation object instead of a list; fit still needs the job side, named by kind.
      evidence: index === 0 ? (job ? [{ source: resume.title, quote: '访谈20名用户' }, { sourceId: 'job', quote: '需求文档经验' }] : { source: resume.title, quote: '访谈20名用户' })
        : [{ sourceId: 'resume', quote: '推动３个功能上线' }, ...(job ? [{ sourceId: job.id, quote: '用户调研' }] : [])],
    }]));
    return { criteria: { ...keyed, bonus: { rating: 4, reason: '多出来的一项', evidence: [] } }, suggestions: [null, { text: '写清调研方法', evidence: { sourceId: 'R1', quote: '负责产品调研' } }], missing: '无' };
  });
  const resume = await run('resume');
  assert.deepEqual(resume.criteria.map(row => row.rating), [4, 3, 3, 4]);
  assert.equal(resume.criteria[0].reason, '（模型没有写理由）');
  assert.equal(resume.criteria[3].reason, '用了具体数字');
  assert.equal(resume.criteria[1].evidence[0].quote, '推动3个功能上线');
  assert.equal(resume.suggestions.length, 1);
  assert.deepEqual(resume.missing, ['无']);
  assert.equal(typeof resume.total, 'number');
  const fit = await run('fit');
  assert.equal(typeof fit.total, 'number');
  // The model sees short source names and a short-answer budget, never the UUIDs.
  const input = calls[0].input;
  assert.deepEqual(input.snapshots.map(row => row.id).sort(), ['J1', 'R1']);
  assert.doesNotMatch(JSON.stringify(input), UUID);
  assert.match(input.instructions, /不超过30字/u);
});

test('a stray null or a missing criterion fails with a stable code, not MODEL_FAILED', async t => {
  const { run } = await fixture(t, input => ({ criteria: [...input.rubric.slice(1).map(row => ({ id: row.id, rating: 3, reason: '有依据',
    evidence: [{ sourceId: 'R1', quote: '访谈20名用户' }] })), null] }));
  await assert.rejects(run('resume'), { code: 'RUBRIC_INCOMPLETE' });
});

test('an explicit null rating stays "cannot judge", and invented quotes are still refused', async t => {
  let invent = false;
  const { run } = await fixture(t, input => ({ criteria: input.rubric.map((row, index) => ({ id: row.id, rating: index === 0 ? null : 3, reason: '有依据',
    evidence: index === 0 ? [] : [{ sourceId: 'R1', quote: invent ? '带领五十人团队' : '访谈20名用户' }] })) }));
  const first = await run('resume');
  assert.equal(first.criteria[0].rating, null); assert.equal(first.total, null);
  invent = true;
  await assert.rejects(run('resume'), { code: 'EVIDENCE_RANGE_REQUIRED' });
});

test('quotes match across width, case and an ellipsis, but only within the real text', () => {
  const source = 'Led A/B testing（ABT）for 3 teams, 负责产品调研，访谈20名用户，整理需求文档。';
  const range = text => { const found = locateQuote(source, text); return found && source.slice(found.start, found.end); };
  assert.equal(range('led a/b testing(abt)'), 'Led A/B testing（ABT）');
  assert.equal(range('负责产品调研,访谈２０名用户'), '负责产品调研，访谈20名用户');
  assert.equal(range('负责产品调研…整理需求文档'), '负责产品调研，访谈20名用户，整理需求文档');
  assert.equal(range('负责产品规划'), null);
  assert.equal(range('整理需求文档…负责产品调研'), null);
});

test('normalizing keeps only rubric criteria and resolves sources by alias, title or kind', () => {
  const snapshots = [{ id: 'resume-version', kind: 'resume', title: '我的简历', text: RESUME }, { id: 'job-version', kind: 'job', title: '岗位要求', text: JOB }];
  const value = normalizeScoring({ criteria: [{ id: 'EVIDENCE', rating: '4/4', reason: 'x', evidence: [{ sourceId: 'R1', quote: 'a' }, { sourceId: '岗位要求', quote: 'b' }, { sourceId: 'job', quote: 'c' }, '访谈20名用户'] }, { id: 'nonsense', rating: 1 }] },
    RESUME_RUBRIC, sourceAliases(snapshots));
  assert.equal(value.criteria.length, 1);
  assert.equal(value.criteria[0].rating, 4);
  assert.deepEqual(value.criteria[0].evidence.map(row => row.sourceId), ['resume-version', 'job-version', 'job-version', 'resume-version']);
});

test('the JSON object is read through think blocks, fences and a sentence before it', () => {
  assert.deepEqual(parseModelJson('<think>先看岗位 {不是JSON}</think>\n{"a":1}'), { a: 1 });
  assert.deepEqual(parseModelJson('好的，结果如下：\n```json\n{"a":2}\n```\n'), { a: 2 });
  assert.throws(() => parseModelJson('没有结果'), { code: 'MODEL_INVALID_JSON' });
  assert.throws(() => parseModelJson('{"a":'), { code: 'MODEL_INVALID_JSON' });
});

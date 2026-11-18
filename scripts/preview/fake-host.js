/**
 * In-memory stand-in for the DSH Host, for previewing the client without DSH.
 * It mimics only the shapes the client reads. Nothing here ships in the plugin.
 */
const now = () => new Date().toISOString();
let counter = 0;
const id = prefix => `${prefix}-${++counter}`;

function tone(seconds, rate = 24000) {
  const samples = Math.floor(seconds * rate), bytes = new Uint8Array(samples * 2), view = new DataView(bytes.buffer);
  for (let i = 0; i < samples; i++) {
    const envelope = 0.35 + 0.65 * Math.abs(Math.sin(i / rate * Math.PI * 3.1));
    view.setInt16(i * 2, Math.round(Math.sin(i / rate * 2 * Math.PI * 180) * 9000 * envelope), true);
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}

export function createFakeHost({ seed = 'empty', voice = 'ready', model = 'ready' } = {}) {
  const data = { materials: [], goals: [], conversations: [], assessments: [], rewrites: [], interviews: [], reports: [], runs: [], receipts: [], deskConversations: [] };
  const workspaces = { items: [{ workspaceId: 'ws-1', title: '我的工作区', sessionIds: [] }], phase: 'ready' };
  const listeners = new Set();
  const notify = () => listeners.forEach(run => run());
  const version = versionId => { for (const material of data.materials) { const row = material.versions.find(item => item.id === versionId); if (row) return { material, row }; } throw Object.assign(new Error('missing'), { code: 'NOT_FOUND' }); };
  function addMaterial({ title, kind, text, source }, confirmed = false) {
    const material = { id: id('m'), title, kind, createdAt: now(), versions: [] };
    material.versions.unshift({ id: id('v'), revision: 1, text, confirmed, createdAt: now(), source: source || { kind: 'user_text' } });
    material.latestVersionId = material.versions[0].id; data.materials.unshift(material);
    return material;
  }
  function addGoal({ title, company = '', description = '' }) {
    const goal = { id: id('g'), title, company, description, status: 'active', createdAt: now(), materialLinks: [], conversations: [] };
    data.goals.unshift(goal); return goal;
  }
  const question = { id: 'q-1', kind: 'main', text: '你在简历里写到，把首屏加载时间从 4.2 秒降到 1.6 秒。当时是怎么定位到瓶颈的？' };
  if (seed === 'filled') {
    const resume = addMaterial({ title: '林未-简历.pdf', kind: 'resume', text: '林未，前端工程师，4 年经验。' }, true);
    const job = addMaterial({ title: '高级前端工程师 岗位要求', kind: 'job', text: '负责核心产品的 Web 端架构与性能。' }, true);
    const goal = addGoal({ title: '高级前端工程师', company: '星桥科技' });
    goal.materialLinks.push({ versionId: job.latestVersionId, kind: 'job' });
    data.interviews.push({ id: 'i-text', goalId: goal.id, sessionId: 's-text', mode: 'text', status: 'active', language: 'zh', createdAt: now(), questions: [question], currentQuestionId: 'q-1' });
    workspaces.items[0].sessionIds.push('s-text');
    void resume;
  }
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  // Scores rise with each revision so the loop can be walked through: about 66, then 84.
  const rubrics = {
    fit: [['skills', '岗位技能', 40, [3, 4], 'React 与性能优化和岗位直接对应；岗位要求的“带小组”在简历里只出现在一句话里。'],
      ['experience', '相关经历', 35, [3, 3], '电商详情页的性能工作与岗位核心职责相符，但没有写出你在团队里的角色。'],
      ['requirements', '明确岗位要求', 25, [2, 3], '岗位要求 5 年经验，简历写 4 年；带 3 到 5 人小组的经历没有写明。']],
    resume: [['evidence', '经历与成果依据', 35, [2, 3], '首屏时间有前后数字，组件库迁移只写了覆盖范围，没有结果。'],
      ['clarity', '表达清楚', 25, [3, 4], '条目短而清楚，个别句子把工具和职责混在一起。'],
      ['structure', '内容组织', 20, [3, 3], '按时间倒序，结构合理。'],
      ['specificity', '内容具体', 20, [2, 3], '“做数据看板”这一段没有写具体做了什么。']],
  };
  function assess({ kind, versionId, goalId }) {
    if (model !== 'ready') throw Object.assign(new Error('MODEL_NOT_CONFIGURED'), { code: 'MODEL_NOT_CONFIGURED' });
    const { material, row } = version(versionId), goal = data.goals.find(item => item.id === goalId);
    const step = Math.min(1, row.revision - 1);
    const criteria = rubrics[kind].map(([cid, name, weight, ratings, reason]) => ({ id: cid, name, weight, rating: ratings[step], score: ratings[step] / 4 * weight, reason, evidence: [] }));
    const total = Math.round(criteria.reduce((sum, item) => sum + item.score, 0) * 10) / 10;
    const suggestions = step ? [] : kind === 'fit'
      ? [{ text: '写明你在团队里的角色：是否带过人、带几个人、负责哪一块。', evidence: [] }, { text: '把与岗位要求对应的技能放在前面。', evidence: [] }]
      : [{ text: '给每段经历补一句结果：规模、指标或被谁采用。', evidence: [] }, { text: '把“做数据看板”换成你具体做的那一步。', evidence: [] }];
    const job = goal?.materialLinks.find(link => link.kind === 'job');
    const result = { id: id('a'), kind, goalId: goal?.id ?? null, versionId, inputVersions: [{ id: versionId, hash: 'h' }, ...(job ? [{ id: job.versionId, hash: 'h' }] : [])],
      rubricVersion: 'preview', criteria, total, suggestions, missing: [], createdAt: now() };
    void material; data.assessments.unshift(result); return result;
  }
  function rewrite({ versionId, goalId }) {
    const { material, row } = version(versionId);
    const pairs = [['2022 年至今在一家电商公司负责商品详情页', '2022 年至今负责电商商品详情页的前端架构与性能'],
      ['2020 至 2022 年在一家 SaaS 公司做数据看板。', '2020 至 2022 年在 SaaS 公司开发数据看板前端。']];
    const items = pairs.filter(([before]) => row.text.includes(before)).map(([before, after], index) => ({ id: `item-${index + 1}`, before, after,
      start: row.text.indexOf(before), end: row.text.indexOf(before) + before.length, reason: index ? '写清做的是哪一部分，不加新事实。' : '把“负责”具体到架构与性能，原文后半句已写到首屏优化。', evidence: [] }));
    if (!items.length) throw Object.assign(new Error('REWRITE_NO_CHANGES'), { code: 'REWRITE_NO_CHANGES' });
    const result = { id: id('rw'), versionId, materialId: material.id, goalId, items, fullText: row.text, requiresConfirmation: true, acceptances: [], acceptedVersionId: null, createdAt: now() };
    data.rewrites.unshift(result); return result;
  }
  function addVersion(material, text, source) {
    const revision = Math.max(...material.versions.map(item => item.revision)) + 1;
    material.versions.unshift({ id: id('v'), revision, text, confirmed: false, createdAt: now(), source });
    material.latestVersionId = material.versions[0].id; return material.versions[0];
  }
  async function request(action, input = {}) {
    await delay(action === 'state' ? 20 : 260);
    switch (action) {
      case 'state': return structuredClone(data);
      case 'material.add': return structuredClone(addMaterial(input));
      case 'material.fetch': return structuredClone(addMaterial({ ...input, text: `（从 ${input.url} 读取的岗位要求）\n负责核心产品的 Web 端架构与性能，带 3 到 5 人的小组。\n要求：5 年以上前端经验，熟悉 React 与性能优化。`, source: { kind: 'url' } }));
      case 'material.confirm': { const { material, row } = version(input.versionId); row.confirmed = true; return { ...structuredClone(row), materialId: material.id }; }
      case 'goal.create': return structuredClone(addGoal(input));
      case 'goal.linkMaterial': { const goal = data.goals.find(row => row.id === input.goalId), { material } = version(input.versionId);
        goal.materialLinks = [...goal.materialLinks.filter(link => link.kind !== material.kind), { versionId: input.versionId, kind: material.kind }]; return structuredClone(goal); }
      case 'material.update': { const material = data.materials.find(row => row.id === input.materialId); addVersion(material, input.text, { kind: 'user_edit' }); return structuredClone(material); }
      case 'assessment.run': await delay(1600); return structuredClone(assess(input));
      case 'rewrite.run': await delay(1800); if (model !== 'ready') throw Object.assign(new Error('MODEL_NOT_CONFIGURED'), { code: 'MODEL_NOT_CONFIGURED' }); return structuredClone(rewrite(input));
      case 'rewrite.accept': {
        const proposal = data.rewrites.find(row => row.id === input.rewriteId), { material, row } = version(proposal.versionId);
        let text = row.text; for (const item of proposal.items.filter(entry => input.itemIds.includes(entry.id))) text = text.replace(item.before, item.after);
        const next = addVersion(material, text, { kind: 'ai_rewrite', rewriteId: proposal.id });
        proposal.acceptances.push({ versionId: next.id, itemIds: input.itemIds }); proposal.acceptedVersionId = next.id;
        return structuredClone({ rewriteId: proposal.id, version: { ...next, materialId: material.id }, itemIds: input.itemIds });
      }
      case 'realtime.create': {
        const interview = { id: id('i'), goalId: input.goalId, sessionId: id('s'), mode: 'realtime', status: 'paused', language: input.language, createdAt: now(), questions: [], currentQuestionId: null };
        data.interviews.unshift(interview); workspaces.items[0].sessionIds.push(interview.sessionId); notify();
        return structuredClone(interview);
      }
      case 'task.cancel': return { cancelled: false };
      default: throw Object.assign(new Error(`Preview host has no ${action}`), { code: 'REQUEST_FAILED' });
    }
  }
  const api = {
    request,
    async upload(file, { title, kind }) {
      await delay(500);
      return structuredClone(addMaterial({ title: title || file.name, kind, source: { kind: 'file' },
        text: '林未，前端工程师，4 年经验。\n2022 年至今在一家电商公司负责商品详情页，把首屏加载时间从 4.2 秒降到 1.6 秒；主导组件库迁移，覆盖 12 个业务线。\n2020 至 2022 年在一家 SaaS 公司做数据看板。' }));
    },
    voice: { catalog: async () => ({ asr: { available: false }, tts: { available: false } }), transcribe: async () => { throw new Error('unavailable'); } },
    realtime: {
      catalog: async () => voice === 'ready' ? { available: true, configured: true } : { available: true, configured: false, reason: 'not-configured' },
      async control() { return {}; },
      async open(_input, { signal, onEvent }) {
        const wait = ms => new Promise((resolve, reject) => { const timer = setTimeout(resolve, ms); signal?.addEventListener('abort', () => { clearTimeout(timer); reject(Object.assign(new Error('aborted'), { name: 'AbortError' })); }, { once: true }); });
        const base = { callId: 'call-1', epoch: 0 };
        await wait(900); onEvent({ type: 'call', ...base });
        await wait(700); onEvent({ type: 'ready', ...base, inputSampleRate: 16000, outputSampleRate: 24000, format: 'pcm16', channels: 1 });
        await wait(400); onEvent({ type: 'response-started', ...base, turnId: 0, responseId: 'r-1' });
        const words = question.text.match(/.{1,6}/g);
        for (const part of words) { onEvent({ type: 'audio', ...base, turnId: 0, responseId: 'r-1', audioBase64: tone(0.45), sampleRate: 24000 }); onEvent({ type: 'output-transcript-delta', ...base, turnId: 0, responseId: 'r-1', delta: part }); await wait(420); }
        onEvent({ type: 'output-transcript', ...base, turnId: 0, responseId: 'r-1', text: question.text });
        onEvent({ type: 'response-done', ...base, turnId: 0, responseId: 'r-1', status: 'completed' });
        await wait(2500); onEvent({ type: 'speech-started', ...base, turnId: 1 });
        const answer = '先看了线上监控的首屏分段数据，发现时间主要花在一张没做懒加载的大图上。';
        for (let end = 6; end <= answer.length + 5; end += 6) { onEvent({ type: 'input-transcript-delta', ...base, turnId: 1, text: answer.slice(0, end) }); await wait(380); }
        onEvent({ type: 'input-transcript', ...base, turnId: 1, text: answer });
        onEvent({ type: 'input-committed', ...base, turnId: 1 });
        await wait(600000);
      },
    },
  };
  return {
    api, data,
    workspaces: { getSnapshot: () => workspaces, subscribe: run => { listeners.add(run); return () => listeners.delete(run); } },
    sessions: { getSnapshot: () => EMPTY_SESSIONS, subscribe: () => () => {} },
  };
}
const EMPTY_SESSIONS = { ids: [], byId: {} };

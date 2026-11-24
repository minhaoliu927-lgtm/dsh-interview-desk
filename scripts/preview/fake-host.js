/**
 * In-memory stand-in for the DSH Host, for previewing the client without DSH.
 * It mimics only the shapes the client reads. Nothing here ships in the plugin.
 */
const now = () => new Date().toISOString();
let counter = 0;
const id = prefix => `${prefix}-${++counter}`;

function wav(seconds, rate = 24000) {
  const pcm = atob(tone(seconds, rate)), header = new Uint8Array(44), view = new DataView(header.buffer);
  const text = (at, value) => { for (let i = 0; i < value.length; i++) header[at + i] = value.charCodeAt(i); };
  text(0, 'RIFF'); view.setUint32(4, 36 + pcm.length, true); text(8, 'WAVE'); text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, pcm.length, true);
  return btoa(String.fromCharCode(...header) + pcm);
}

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
  // The plugin's own settings, as DSH ConfigForms and credentials would hold them.
  const settingsListeners = new Set();
  let settings = { status: 'ready', writable: true, revision: 1, value: voice === 'ready'
    ? { realtimeEnabled: true, realtimeRegion: 'beijing', realtimeWorkspace: 'llm-preview', realtimeModel: 'qwen3.5-omni-plus-realtime', realtimeCredential: 'ZHIJING_REALTIME_API_KEY' }
    : { realtimeEnabled: false, realtimeRegion: 'beijing', realtimeWorkspace: '', realtimeModel: 'qwen3.5-omni-plus-realtime', realtimeCredential: 'ZHIJING_REALTIME_API_KEY' } };
  let keySaved = voice === 'ready';
  // Whether a test call passed with the current settings (voice=ready starts tested; voice=fail always fails).
  let voiceVerified = voice === 'ready', voiceFailed = false, voiceFailureCode;
  data.opened = [];
  const configForm = {
    getSnapshot: () => settings,
    subscribe: run => { settingsListeners.add(run); return () => settingsListeners.delete(run); },
    async mutate(ops, revision) {
      await delay(250);
      if (revision !== undefined && revision !== settings.revision) return false;
      const value = { ...settings.value };
      for (const op of ops) value[op.path[0]] = op.value;
      settings = { ...settings, value, revision: settings.revision + 1 };
      settingsListeners.forEach(run => run());
      return true;
    },
  };
  const credentials = {
    async describe(refs) { await delay(120); return { ok: true, value: Object.fromEntries(refs.map(ref => [ref, { configured: keySaved, writable: true }])) }; },
    async set(_ref, secret) { await delay(250); keySaved = typeof secret === 'string' && secret.length > 0; return { ok: true }; },
  };
  const realtimeReady = () => settings.value.realtimeEnabled && Boolean(settings.value.realtimeWorkspace) && keySaved;
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
  if (seed === 'history') {
    // A returning user: two roles, three finished interviews with reports, and a score below 80 on the newest resume.
    const resume = addMaterial({ title: '林未-简历.pdf', kind: 'resume', text: '林未，前端工程师，4 年经验。' }, true);
    const job = addMaterial({ title: '高级前端工程师 岗位要求', kind: 'job', text: '负责核心产品的 Web 端架构与性能。' }, true);
    const other = addMaterial({ title: '前端技术负责人 岗位要求', kind: 'job', text: '带领 6 人前端团队。' }, true);
    const lead = addGoal({ title: '前端技术负责人', company: '云栈' }); lead.createdAt = '2026-11-02T09:00:00.000Z';
    lead.materialLinks.push({ versionId: other.latestVersionId, kind: 'job' });
    const goal = addGoal({ title: '高级前端工程师', company: '星桥科技' });
    goal.materialLinks.push({ versionId: job.latestVersionId, kind: 'job' });
    const days = ['2026-11-12', '2026-11-16', '2026-11-20'], totals = [62, 71, 78];
    const summaries = ['讲清了首屏优化的过程，但没说怎么验证效果。', '性能问题定位讲得具体，团队协作部分偏空。', '追问下能给出数据和取舍，回答结构清楚。'];
    days.forEach((date, index) => {
      const interviewId = id('i'), reportId = id('rp'), sessionId = id('s');
      data.interviews.push({ id: interviewId, goalId: index === 0 ? lead.id : goal.id, sessionId, mode: index === 1 ? 'text' : 'realtime', status: 'completed', reportId, language: 'zh', createdAt: `${date}T20:10:00.000Z`, questions: [], currentQuestionId: null });
      data.reports.push({ id: reportId, interviewId, goalId: index === 0 ? lead.id : goal.id, total: totals[index], summary: summaries[index], createdAt: `${date}T20:40:00.000Z`, criteria: [] });
    });
    for (const [kind, total] of [['fit', 74], ['resume', 66]]) data.assessments.push({ id: id('a'), kind, goalId: goal.id, versionId: resume.latestVersionId,
      inputVersions: [{ id: resume.latestVersionId, hash: 'h' }, { id: job.latestVersionId, hash: 'h' }], rubricVersion: 'preview', total, suggestions: [], missing: [], createdAt: now(),
      criteria: rubrics[kind].map(([cid, name, weight]) => ({ id: cid, name, weight, rating: 3, score: total / 100 * weight, reason: '', evidence: [] })) });
  }
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
  // Same lock as the real Host: one run per assessment kind, resume version and goal.
  const locks = new Set();
  async function locked(key, operation) {
    if (locks.has(key)) throw Object.assign(new Error('此项操作正在进行'), { code: 'BUSY' });
    locks.add(key);
    try { return await operation(); } finally { locks.delete(key); }
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
      case 'assessment.run': return locked(`assessment:${input.kind ?? 'resume'}:${input.versionId}:${input.goalId ?? ''}`, async () => { await delay(1600); return structuredClone(assess(input)); });
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
      case 'realtime.test': {
        await delay(1200);
        if (!realtimeReady()) { voiceVerified = false; voiceFailed = true; voiceFailureCode = 'not-configured'; throw Object.assign(new Error('not configured'), { code: 'not-configured' }); }
        if (voice === 'fail') { voiceVerified = false; voiceFailed = true; voiceFailureCode = 'session-rejected · invalid_value'; throw Object.assign(new Error('session'), { code: 'session-rejected', detail: 'invalid_value' }); }
        voiceVerified = true; voiceFailed = false; voiceFailureCode = undefined;
        return { ok: true, checks: { handshake: true, audio: true, transcript: true }, audio: { mimeType: 'audio/wav', base64: wav(0.8) }, latencyMs: { ready: 420, firstAudio: 820, total: 1630 } };
      }
      case 'realtime.forget': voiceVerified = false; voiceFailed = false; voiceFailureCode = undefined; return { verified: false };
      case 'material.open': { const { material } = version(input.versionId); data.opened.push(input.versionId); return { opened: true, filename: material.title }; }
      case 'task.cancel': return { cancelled: false };
      default: throw Object.assign(new Error(`Preview host has no ${action}`), { code: 'REQUEST_FAILED' });
    }
  }
  const api = {
    request,
    async upload(file, { title, kind }) {
      await delay(500);
      const mime = file.type || 'application/pdf';
      return structuredClone(addMaterial({ title: title || file.name, kind, source: { kind: 'file', inputKind: 'uploaded-document', originalFileId: `${id('f')}.pdf`, metadataFileId: `${id('m')}.json`, mime, pageCount: 2 },
        text: '林未，前端工程师，4 年经验。\n2022 年至今在一家电商公司负责商品详情页，把首屏加载时间从 4.2 秒降到 1.6 秒；主导组件库迁移，覆盖 12 个业务线。\n2020 至 2022 年在一家 SaaS 公司做数据看板。' }));
    },
    voice: { catalog: async () => ({ asr: { available: false }, tts: { available: false } }), transcribe: async () => { throw new Error('unavailable'); } },
    realtime: {
      catalog: async () => realtimeReady() ? { available: true, configured: true, verified: voiceVerified, ...(voiceFailed ? { failed: true, ...(voiceFailureCode ? { failureCode: voiceFailureCode } : {}) } : {}) } : { available: true, configured: false, verified: false, reason: 'not-configured' },
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
    api, data, configForm, credentials,
    workspaces: { getSnapshot: () => workspaces, subscribe: run => { listeners.add(run); return () => listeners.delete(run); } },
    sessions: { getSnapshot: () => EMPTY_SESSIONS, subscribe: () => () => {} },
  };
}
const EMPTY_SESSIONS = { ids: [], byId: {} };

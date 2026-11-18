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

export function createFakeHost({ seed = 'empty', voice = 'ready' } = {}) {
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
    goal.materialLinks.push({ versionId: job.latestVersionId });
    data.interviews.push({ id: 'i-text', goalId: goal.id, sessionId: 's-text', mode: 'text', status: 'active', language: 'zh', createdAt: now(), questions: [question], currentQuestionId: 'q-1' });
    workspaces.items[0].sessionIds.push('s-text');
    void resume;
  }
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function request(action, input = {}) {
    await delay(action === 'state' ? 20 : 260);
    switch (action) {
      case 'state': return structuredClone(data);
      case 'material.add': return structuredClone(addMaterial(input));
      case 'material.fetch': return structuredClone(addMaterial({ ...input, text: `（从 ${input.url} 读取的岗位要求）\n负责核心产品的 Web 端架构与性能，带 3 到 5 人的小组。\n要求：5 年以上前端经验，熟悉 React 与性能优化。`, source: { kind: 'url' } }));
      case 'material.confirm': { const { material, row } = version(input.versionId); row.confirmed = true; return { ...structuredClone(row), materialId: material.id }; }
      case 'goal.create': return structuredClone(addGoal(input));
      case 'goal.linkMaterial': { const goal = data.goals.find(row => row.id === input.goalId); goal.materialLinks = [{ versionId: input.versionId }]; return structuredClone(goal); }
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

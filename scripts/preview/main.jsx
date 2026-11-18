import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../client/workbench.jsx';
import { createCareerClient } from '../../client/model.js';
import { zh, en } from '../../locale/dictionaries.js';
import { createFakeHost } from './fake-host.js';

// Dev preview only: mounts the real workbench against the in-memory host.
const query = new URLSearchParams(location.search);
const dictionary = query.get('lang') === 'en' ? en : zh;
const t = (key, params = {}) => String(dictionary[key] ?? key).replace(/\{([^}]+)\}/g, (_match, name) => params[name] ?? name);
const host = createFakeHost({ seed: query.get('seed') || 'empty', voice: query.get('voice') || 'ready' });
const client = createCareerClient(host.api, { intervalMs: 1500 });
const useStore = store => selector => selector(React.useSyncExternalStore(store.subscribe, store.getSnapshot));
const useCareer = useStore(client.source), useNativeSessions = useStore(host.sessions), useWorkspaceChoices = useStore(host.workspaces);

if (query.get('theme') === 'dark') {
  const tokens = { 'bg-base': '#12171d', 'bg-layer-1': '#1b222b', 'label-primary': '#e7ecf1', 'label-secondary': '#9aa6b2', 'border-l3': '#2f3944', 'state-business-primary': '#9db2ff' };
  for (const [name, value] of Object.entries(tokens)) document.documentElement.style.setProperty(`--dsw-alias-${name}`, value);
  document.documentElement.style.setProperty('--zj-preview-on-accent', '#0f1a3d');
}

const props = {
  t, useCareer, useNativeSessions, useWorkspaceChoices,
  action: client.action, upload: client.upload, refresh: client.refresh, cancelCurrent: client.cancelCurrent, retryCurrent: client.retryCurrent,
  voiceApi: host.api.voice, realtimeApi: host.api.realtime,
  openRealtimeSettings: () => true, openVoiceSettings: () => true, openWorkspaceManager: () => true,
  enableVoiceInput: async () => ({ status: 'unavailable' }),
  createConversation: async () => { throw new Error('Preview host has no native conversations'); },
  startInterview: input => client.action('realtime.create', input),
  interviewAction: async () => undefined,
  download: async () => undefined, readSource: async () => ({}), loadOriginal: async () => ({}), downloadOriginal: async () => undefined,
  useResource: () => ({ status: 'failed', failure: { message: '预览环境没有 DSH 原生对话。' } }),
  SessionProvider: ({ children }) => children, renderSlot: () => null,
};
window.__zjPreview = { host, client };
createRoot(document.getElementById('root')).render(<App {...props}/>);

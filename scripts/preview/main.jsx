import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../client/workbench.jsx';
import { createCareerClient } from '../../client/model.js';
import { zh, en } from '../../locale/dictionaries.js';
import { createFakeHost } from './fake-host.js';
import { createRealtimeSettingsActions } from '../../client/realtime-settings.jsx';

// Dev preview only: mounts the real workbench against the in-memory host.
const query = new URLSearchParams(location.search);
const dictionary = query.get('lang') === 'en' ? en : zh;
const t = (key, params = {}) => String(dictionary[key] ?? key).replace(/\{([^}]+)\}/g, (_match, name) => params[name] ?? name);
const host = createFakeHost({ seed: query.get('seed') || 'empty', voice: query.get('voice') || 'ready', model: query.get('model') || 'ready' });
const client = createCareerClient(host.api, { intervalMs: 1500 });
const useStore = store => selector => selector(React.useSyncExternalStore(store.subscribe, store.getSnapshot));
const useCareer = useStore(client.source), useNativeSessions = useStore(host.sessions), useWorkspaceChoices = useStore(host.workspaces);
const settings = createRealtimeSettingsActions(host.configForm, host.credentials, host.api);
const useRealtimeSettings = useStore(host.configForm);

if (query.get('theme') === 'dark') {
  const tokens = { 'bg-base': '#121417', 'bg-layer-1': '#1b1e22', 'bg-layer-2': '#202328', 'label-primary': '#ececec', 'label-secondary': '#b4b4b0', 'label-tertiary': '#9a9a96', 'label-primary-inverted': '#141414',
    'button-primary-fill': '#ececec', 'button-primary-hover': '#d6d6d4', 'border-l2': 'rgba(255,255,255,.08)', 'border-l3': '#2f3944', 'border-l4': 'rgba(255,255,255,.18)', 'interactive-bg-hover': 'rgba(255,255,255,.07)', 'state-business-primary': '#9db2ff' };
  document.body.setAttribute('data-ds-dark-theme', '');
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
  useRealtimeSettings, settingsActions: { saveSettings: settings.saveSettings, describeCredential: settings.describeCredential, storeCredential: settings.storeCredential, testAudio: settings.testAudio, cancelAudio: settings.cancelAudio },
};
window.__zjPreview = { host, client };
createRoot(document.getElementById('root')).render(<App {...props} initialPage={query.get('page') || undefined}/>);

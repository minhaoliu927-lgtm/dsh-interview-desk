import React from 'react';
import { Button, Window, createSubmissionGuard } from './components.jsx';
import { REALTIME_MODELS, createRealtimeProbe, probeMessageFor, realtimeSettingsValue } from './realtime-settings.jsx';
import { VoiceSetup } from './voice-ui.jsx';

/**
 * The settings window inside the workbench. Voice interviews need two things
 * from the user's own Model Studio account: the workspace ID and an API key.
 * Fields are written through the same public ConfigForms and credentials
 * services as the DSH plugin settings page (see realtime-settings.jsx); the
 * key goes only into DSH credentials and is never read back or shown.
 */
const MODEL_NOTES = { 'qwen3.5-omni-plus-realtime': 'setModelDefault', 'qwen3.5-omni-flash-realtime': 'setModelFast', 'qwen3.8-omni-flash-realtime': 'setModelNew' };
const WORKSPACE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
const REGIONS = [['beijing', 'rtSettingsBeijing'], ['singapore', 'rtSettingsSingapore']];
const noSettings = Object.freeze({ status: 'unavailable', writable: false });
const capital = text => `${text[0].toUpperCase()}${text.slice(1)}`;
const useSnapshot = hook => (typeof hook === 'function' ? hook(value => value) : null) || noSettings;

/** Which fields a save would change; a workspace means the service is on. */
export function settingsChanges(base, draft) {
  const next = { ...base, ...draft };
  next.realtimeEnabled = Boolean(next.realtimeWorkspace);
  const dirty = ['realtimeRegion', 'realtimeWorkspace', 'realtimeModel', 'realtimeEnabled'].some(field => next[field] !== base[field]);
  return { next, dirty };
}

/** The checks made before anything is written. Returns a dictionary key, or null. */
export function settingsProblem({ ready, writable, next, key }) {
  if (!ready) return 'rtSettingsUnavailable';
  if (!writable) return 'rtSettingsReadonly';
  if (next.realtimeWorkspace && !WORKSPACE.test(next.realtimeWorkspace)) return 'rtSettingsInvalid';
  if (key && !next.realtimeWorkspace) return 'setNeedWorkspace';
  if (key && !key.startsWith('sk-')) return 'setKeyBadPrefix';
  return null;
}

/**
 * Saves the four fields if they changed, then the typed key. The key is
 * handed to DSH credentials and never kept, returned or put in a message.
 */
export async function commitSettings({ ready, writable, base, draft, revision, key, saveSettings, storeCredential }) {
  const { next, dirty } = settingsChanges(base, draft);
  const typed = String(key || '').trim();
  const problem = settingsProblem({ ready, writable, next, key: typed });
  if (problem) return { ok: false, notice: problem, savedSettings: false, savedKey: false };
  let savedSettings = false;
  if (dirty) {
    const result = await saveSettings(next, revision);
    if (result !== 'saved') return { ok: false, notice: `rtSettings${capital(String(result || 'failed'))}`, savedSettings, savedKey: false };
    savedSettings = true;
  }
  if (typed) {
    const result = await storeCredential(base.realtimeCredential, typed);
    if (result !== 'saved') return { ok: false, notice: `rtCredential${capital(String(result || 'failed'))}`, savedSettings, savedKey: false };
    return { ok: true, savedSettings, savedKey: true };
  }
  return { ok: true, savedSettings, savedKey: false };
}

export function SettingsDialog({ t, onClose, onSaved, onTested, voiceReady = false, voiceSaved = false, voiceFailed = false, voiceFailureCode, useRealtimeSettings, saveSettings, describeCredential, storeCredential, testAudio, cancelAudio,
  workspaces = [], workspaceId = '', onWorkspace, onManageWorkspaces, enableVoiceInput, openVoiceSettings }) {
  const snapshot = useSnapshot(useRealtimeSettings);
  const base = realtimeSettingsValue(snapshot.value);
  const ready = snapshot.status === 'ready', writable = ready && snapshot.writable === true;
  const [draft, setDraft] = React.useState(null), [revision, setRevision] = React.useState(undefined);
  const [key, setKey] = React.useState(''), [advanced, setAdvanced] = React.useState(false);
  const [credential, setCredential] = React.useState({ status: 'loading' });
  const [notice, setNotice] = React.useState(null), [saving, setSaving] = React.useState(false);
  const [probe, setProbe] = React.useState({ status: 'idle', playing: false });
  const probeRef = React.useRef(null), guard = React.useRef(createSubmissionGuard()), alive = React.useRef(true);
  const onTestedRef = React.useRef(onTested); onTestedRef.current = onTested;
  const regionLabel = React.useId();
  React.useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  React.useEffect(() => {
    if (typeof testAudio !== 'function' || typeof cancelAudio !== 'function') return undefined;
    // A finished test changes whether voice counts as connected, so the status is read again.
    const controller = createRealtimeProbe({ testAudio, cancelAudio }, { onChange: next => {
      if (alive.current) setProbe(next);
      if (next.status === 'succeeded' || next.status === 'failed') onTestedRef.current?.();
    } });
    probeRef.current = controller;
    return () => { controller.dispose(); if (probeRef.current === controller) probeRef.current = null; };
  }, [testAudio, cancelAudio]);
  React.useEffect(() => {
    let current = true;
    if (!ready || typeof describeCredential !== 'function') { setCredential({ status: 'unavailable' }); return undefined; }
    setCredential({ status: 'loading' });
    Promise.resolve(describeCredential(base.realtimeCredential)).then(info => { if (current) setCredential(info || { status: 'failed' }); }, () => { if (current) setCredential({ status: 'failed' }); });
    return () => { current = false; };
  }, [ready, base.realtimeCredential, describeCredential]);

  const value = { ...base, ...draft };
  const { next } = settingsChanges(base, draft);
  const typed = key.trim();
  const keyWritable = writable && credential.status === 'ready' && credential.writable !== false;
  // Connected only once a test passed; a failed or pending test never counts.
  const connected = probe.status === 'succeeded' || (voiceReady && probe.status !== 'failed' && !draft && !typed);
  const pending = Boolean(draft || typed);
  const status = connected ? 'setStatusOk' : probe.status === 'failed' || (voiceFailed && !pending && probe.status !== 'succeeded') ? 'setStatusFailed'
    : voiceSaved || pending ? 'setStatusUntested' : 'setStatusNone';
  const edit = patch => {
    probeRef.current?.clear();
    if (!draft) setRevision(snapshot.revision);
    setDraft(previous => ({ ...(previous || {}), ...patch })); setNotice(null);
  };

  // Writes what changed: the four fields first, then the key. Stops at the first refusal.
  const commit = async () => {
    const result = await commitSettings({ ready, writable, base, draft, revision: draft ? revision : snapshot.revision, key, saveSettings, storeCredential });
    if (alive.current) {
      if (result.savedSettings) setDraft(null);
      if (result.savedKey) { setKey(''); setCredential({ status: 'ready', configured: true, writable: true }); }
      if (!result.ok) setNotice(result.notice);
    }
    return result.ok;
  };
  const save = () => guard.current(async () => {
    setSaving(true); setNotice(null);
    const ok = await commit().catch(() => { setNotice('rtSettingsFailed'); return false; });
    if (!alive.current) return;
    setSaving(false);
    if (ok) { onSaved?.(); onClose(); }
  });
  // A test saves first, so one click covers "paste the key, check it works".
  const test = () => guard.current(async () => {
    if (!next.realtimeWorkspace) { setNotice('setNeedWorkspace'); return; }
    if (!typed && !(credential.status === 'ready' && credential.configured)) { setNotice('setNeedKey'); return; }
    setSaving(true); setNotice(null);
    const ok = await commit().catch(() => { setNotice('rtSettingsFailed'); return false; });
    if (!alive.current) return;
    setSaving(false);
    if (ok) { onSaved?.({ quiet: true }); void probeRef.current?.start(); }
  });

  const running = probe.status === 'running';
  const footer = <><Button disabled={saving} onClick={onClose}>{t('cancel')}</Button><Button primary disabled={saving || !writable} onClick={() => { void save(); }}>{t(saving ? 'processing' : 'save')}</Button></>;
  return <Window title={t('setTitle')} onClose={onClose} t={t} busy={saving} footer={footer}>
    <section className="zj-set" aria-label={t('setVoice')} data-settings-voice="">
      <div className="zj-set-head"><h3>{t('setVoice')}</h3><span className="zj-hint">{t('setVoiceVendor')}</span><span className={`zj-badge${connected ? '' : ' is-warn'}`}>{t(status)}</span></div>
      {!ready && <p className="zj-note" role="status">{t(snapshot.status === 'loading' ? 'loading' : 'rtSettingsUnavailable')}</p>}
      {ready && !writable && <p className="zj-note" role="status">{t('rtSettingsReadonly')}</p>}
      <div className="zj-control"><span className="zj-label" id={regionLabel}>{t('setRegion')}</span>
        <div className="zj-seg" role="radiogroup" aria-labelledby={regionLabel}>{REGIONS.map(([region, label]) => <button type="button" role="radio" key={region}
          aria-checked={value.realtimeRegion === region} className={value.realtimeRegion === region ? 'is-on' : ''} disabled={!writable || saving} onClick={() => edit({ realtimeRegion: region })}>{t(label)}</button>)}</div>
        <span className="zj-hint">{t('setRegionNote')}</span></div>
      <label className="zj-control"><span className="zj-label">{t('setWorkspace')}</span>
        <input value={value.realtimeWorkspace} maxLength={64} spellCheck={false} autoComplete="off" disabled={!writable || saving} placeholder={t('setWorkspaceHint')}
          onChange={event => edit({ realtimeWorkspace: event.target.value.trim() })}/>
        <span className="zj-hint">{t('setWorkspaceNote')}</span></label>
      <label className="zj-control"><span className="zj-label">{t('setKey')}</span>
        <input type="password" autoComplete="new-password" spellCheck={false} value={key} disabled={!keyWritable || saving}
          placeholder={t(credential.status === 'ready' && credential.configured ? 'setKeySaved' : 'setKeyEmpty')}
          onChange={event => { probeRef.current?.clear(); setKey(event.target.value); setNotice(null); }}/>
        <span className="zj-hint">{t('setKeyNote')}</span>
        {credential.status === 'ready' && credential.writable === false && <span className="zj-hint" role="status">{t('rtCredentialReadonly')}</span>}
        {credential.status === 'failed' && <span className="zj-hint" role="status">{t('rtCredentialFailed')}</span>}</label>
      <button type="button" className="zj-link-btn" aria-expanded={advanced} onClick={() => setAdvanced(open => !open)}>{t(advanced ? 'setAdvancedHide' : 'setAdvanced')}</button>
      {advanced && <div className="zj-radios" role="radiogroup" aria-label={t('rtSettingsModel')}>{REALTIME_MODELS.map(model => <button type="button" role="radio" key={model}
        aria-checked={value.realtimeModel === model} className={`zj-radio${value.realtimeModel === model ? ' is-on' : ''}`} disabled={!writable || saving} onClick={() => edit({ realtimeModel: model })}>
        <code>{model}</code><span className="zj-hint">{t(MODEL_NOTES[model])}</span></button>)}</div>}
      <div className="zj-set-test"><Button disabled={saving || running || !writable} onClick={() => { void test(); }}>{t(running ? 'setTesting' : 'setTest')}</Button>
        {running && <Button quiet onClick={() => probeRef.current?.cancel()}>{t('rtProbeCancel')}</Button>}
        <span className="zj-hint">{t('setTestNote')}</span></div>
      <div role="status" aria-live="polite" className="zj-set-status">
        {probe.status === 'succeeded' && <div className="zj-ok-line"><span>{t('rtProbeSuccess', probe.latencyMs)}</span>
          <Button small onClick={() => { if (probe.playing) probeRef.current?.stop(); else void probeRef.current?.play(); }}>{t(probe.playing ? 'setStop' : 'setPlay')}</Button></div>}
        {running && <p className="zj-hint">{t('rtProbeWaiting')}</p>}
        {probe.message && probe.status !== 'succeeded' && <p className="zj-warn-line">{t(probe.message)}{probe.code && t('rtProbeCode', { code: probe.code })}</p>}
        {!probe.message && !running && status === 'setStatusFailed' && voiceFailureCode && <p className="zj-warn-line">
          {t('setLastFailure')}{t(probeMessageFor(voiceFailureCode))}{t('rtProbeCode', { code: voiceFailureCode })}</p>}
        {probe.playbackMessage && <p className="zj-warn-line">{t(probe.playbackMessage)}</p>}
        {notice && <p className="zj-warn-line">{t(notice)}</p>}
      </div>
    </section>
    <div className="zj-rule" role="presentation"/>
    <section className="zj-set" aria-label={t('compatibleVoiceInput')}>
      <div><div className="zj-set-name">{t('compatibleVoiceInput')}</div><p className="zj-hint">{t('setDictationNote')}</p></div>
      <VoiceSetup t={t} enableVoiceInput={enableVoiceInput} openVoiceSettings={openVoiceSettings}/>
    </section>
    <div className="zj-rule" role="presentation"/>
    <section className="zj-set" aria-label={t('setWorkspaceDsh')}>
      <label className="zj-control"><span className="zj-label">{t('setWorkspaceDsh')}</span>
        <select value={workspaceId} onChange={event => onWorkspace?.(event.target.value)}><option value="">{t('selectWorkspace')}</option>
          {workspaces.map(row => <option key={row.workspaceId} value={row.workspaceId}>{row.title}</option>)}</select>
        {workspaces.length === 1 && workspaceId && <span className="zj-hint">{t('setWorkspaceAuto')}</span>}
        {!workspaces.length && <span className="zj-hint">{t('workspaceRequired')}</span>}</label>
      {onManageWorkspaces && <div><Button quiet small onClick={onManageWorkspaces}>{t('manageWorkspaces')}</Button></div>}
    </section>
  </Window>;
}

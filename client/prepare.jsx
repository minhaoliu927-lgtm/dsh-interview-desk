import React from 'react';
import { Button } from './components.jsx';
import { resumeOptions, versionEntry } from './model.js';
import { realtimeUnavailable } from './voice/realtime-call.js';

/**
 * Prepare flow: job description, resume, then start, on one vertical axis.
 *
 * It only sequences actions the Host already has (material.add / fetch /
 * upload / confirm, goal.create, goal.linkMaterial, interview start). Progress
 * is derived from saved facts: a step counts as done when its material version
 * exists and the user confirmed it, never because a button was pressed.
 */
export const PREPARE_DEFAULTS = Object.freeze({ role: '', jobSource: 'paste', jobText: '', jobUrl: '', jobVersionId: null,
  resumeSource: 'file', resumeText: '', resumeVersionId: null, goalId: null, language: 'zh', questionCount: 5, mode: 'realtime' });
export const QUESTION_COUNTS = [3, 5, 8];

function entryOfKind(state, versionId, kind) {
  const entry = versionId ? versionEntry(state, versionId) : null;
  return entry?.material.kind === kind ? entry : null;
}

export function prepareProgress(state, draft) {
  const value = { ...PREPARE_DEFAULTS, ...draft };
  const job = entryOfKind(state, value.jobVersionId, 'job');
  const resume = entryOfKind(state, value.resumeVersionId, 'resume');
  const jobReady = Boolean(job?.version.confirmed), resumeReady = Boolean(resume?.version.confirmed);
  const role = value.role.trim();
  return { value, job, resume, role, jobReady, resumeReady, ready: jobReady && resumeReady && role.length > 0,
    current: !jobReady ? 'job' : !resumeReady ? 'resume' : 'start' };
}

const excerpt = (text, length = 400) => String(text || '').trim().slice(0, length);
const calm = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

function Options({ label, values, value, onChange, render, disabled }) {
  return <div className="zj-opts" role="group" aria-label={label}>{values.map(option => <button type="button" className="zj-opt" key={option}
    aria-pressed={value === option} disabled={disabled} onClick={() => onChange(option)}>{render(option)}</button>)}</div>;
}

function SavedDocument({ entry, t, busy, onConfirm, onReplace, onContinue }) {
  const { material, version } = entry;
  if (version.confirmed) return <div className="zj-fade">
    <div className="zj-doc is-confirmed"><strong>{material.title}</strong><span className="zj-doc-state">{t('prepConfirmed')}</span></div>
    <div className="zj-flow-actions"><Button primary disabled={busy} onClick={onContinue}>{t('prepContinue')}</Button><Button quiet disabled={busy} onClick={onReplace}>{t('prepReplace')}</Button></div>
  </div>;
  return <div className="zj-fade">
    <div className="zj-doc"><strong>{material.title}</strong><p className="zj-doc-text">{excerpt(version.text, 4000)}</p></div>
    <p className="zj-block-note" style={{ margin: '14px 0 0' }}>{t('prepReviewNote')}</p>
    <div className="zj-flow-actions"><Button primary disabled={busy} onClick={onConfirm}>{t('prepConfirmThis')}</Button><Button quiet disabled={busy} onClick={onReplace}>{t('prepReplace')}</Button></div>
  </div>;
}

export function Prepare({ t, state, busy = false, draft, onDraftChange, action, upload, startInterview, workspaces = [], workspaceId = '', onWorkspace,
  onManageWorkspaces, realtimeApi, openRealtimeSettings, onSkip }) {
  const progress = prepareProgress(state, draft);
  const { value, job, resume, role, jobReady, resumeReady, ready } = progress;
  const latest = React.useRef(value); latest.current = value;
  const update = patch => { latest.current = { ...latest.current, ...patch }; onDraftChange?.(latest.current); };

  const scroller = React.useRef(null);
  const slide = name => {
    const node = scroller.current, target = node?.querySelector(`[data-step="${name}"]`);
    if (target) node.scrollTo({ top: target.offsetTop, behavior: calm() ? 'auto' : 'smooth' });
  };
  // One wheel gesture moves one step along the axis, up or down. Scroll snap
  // alone pulls a small wheel movement back to the step it started from.
  React.useEffect(() => {
    const node = scroller.current;
    if (!node) return undefined;
    let lockedUntil = 0;
    const onWheel = event => {
      if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      const down = event.deltaY > 0;
      // Let a scrollable field (a long job description) scroll first.
      for (let el = event.target; el && el !== node; el = el.parentElement) {
        if (el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY)
          && (down ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return;
      }
      const steps = [...node.querySelectorAll('[data-step]')];
      // The nearest step, not the one above: the last step may not reach the top when the panel bottoms out.
      const top = node.scrollTop, index = steps.reduce((best, step, at) => Math.abs(step.offsetTop - top) < Math.abs(steps[best].offsetTop - top) ? at : best, 0);
      const current = steps[index];
      // A step taller than the panel (narrow layouts) scrolls normally inside itself.
      if (current && current.offsetHeight > node.clientHeight + 4) {
        const inside = down ? top + node.clientHeight < current.offsetTop + current.offsetHeight - 4 : top > current.offsetTop + 4;
        if (inside) return;
      }
      event.preventDefault();
      if (Date.now() < lockedUntil || Math.abs(event.deltaY) < 4) return;
      const next = steps[index + (down ? 1 : -1)];
      if (!next) return;
      lockedUntil = Date.now() + 750;
      node.scrollTo({ top: next.offsetTop, behavior: calm() ? 'auto' : 'smooth' });
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  // Voice stays the default way to interview. Ask the Host whether the audio
  // service is ready so the start step can say so before a call is attempted.
  const [catalog, setCatalog] = React.useState(null);
  const [checking, setChecking] = React.useState(false);
  const alive = React.useRef(true);
  const checkVoice = React.useCallback(async () => {
    if (typeof realtimeApi?.catalog !== 'function') return;
    setChecking(true);
    try { const result = await realtimeApi.catalog(); if (alive.current) setCatalog(result); }
    catch { if (alive.current) setCatalog(null); }
    finally { if (alive.current) setChecking(false); }
  }, [realtimeApi]);
  React.useEffect(() => { alive.current = true; void checkVoice(); return () => { alive.current = false; }; }, [checkVoice]);
  React.useEffect(() => {
    const view = globalThis.document;
    if (!view?.addEventListener) return undefined;
    const onVisible = () => { if (!view.hidden) void checkVoice(); };
    view.addEventListener('visibilitychange', onVisible);
    return () => view.removeEventListener('visibilitychange', onVisible);
  }, [checkVoice]);
  const voiceBlocked = value.mode === 'realtime' && realtimeUnavailable(catalog);

  const savedResumes = resumeOptions(state);
  const [dragging, setDragging] = React.useState(false);

  const saveJobText = async () => {
    const saved = await action('material.add', { title: t('prepJobTitle', { role }), kind: 'job', text: value.jobText });
    if (!saved) return;
    update({ jobVersionId: saved.latestVersionId });
    if (await action('material.confirm', { versionId: saved.latestVersionId })) slide('resume');
  };
  const readJobLink = async () => {
    const saved = await action('material.fetch', { title: t('prepJobTitle', { role }), kind: 'job', url: value.jobUrl });
    if (saved) update({ jobVersionId: saved.latestVersionId });
  };
  const confirmJob = async () => { if (await action('material.confirm', { versionId: job.version.id })) slide('resume'); };
  const importResume = async file => {
    if (!file || busy) return;
    const saved = await upload(file, { title: file.name, kind: 'resume' });
    if (saved) update({ resumeVersionId: saved.latestVersionId });
  };
  const saveResumeText = async () => {
    const saved = await action('material.add', { title: t('resume'), kind: 'resume', text: value.resumeText });
    if (!saved) return;
    update({ resumeVersionId: saved.latestVersionId });
    if (await action('material.confirm', { versionId: saved.latestVersionId })) slide('start');
  };
  const confirmResume = async () => { if (await action('material.confirm', { versionId: resume.version.id })) slide('start'); };
  const start = async () => {
    if (!ready || busy || voiceBlocked) return;
    // A retry after a failed start reuses the goal it already created.
    let goalId = state.goals.some(row => row.id === latest.current.goalId) ? latest.current.goalId : null;
    if (!goalId) {
      const goal = await action('goal.create', { title: role });
      if (!goal) return;
      goalId = goal.id; update({ goalId });
    }
    if (!await action('goal.linkMaterial', { goalId, versionId: job.version.id })) return;
    await startInterview({ goalId, versionId: resume.version.id, language: value.language, questionCount: value.questionCount, mode: value.mode });
  };

  const jobInputReady = role.length > 0 && (value.jobSource === 'paste' ? value.jobText.trim().length > 0 : value.jobUrl.trim().length > 0);
  return <div className="zj-flow" ref={scroller} data-prepare="">
    <section className="zj-hero" data-step="top">
      <div className="zj-hero-space"/>
      <div className="zj-fade">
        <h1>{t('prepSlogan')}</h1>
        <p className="zj-hero-lead">{t('prepLead')}</p>
        <Button primary onClick={() => slide(progress.current)}>{t('prepBegin')}</Button>
        {onSkip && <div className="zj-flow-actions" style={{ justifyContent: 'center' }}><Button quiet onClick={onSkip}>{t('prepSkip')}</Button></div>}
      </div>
      <div className="zj-lead" aria-hidden="true"/>
    </section>

    <section className="zj-sec" data-step="job" aria-label={t('prepJobText')}>
      <div className={`zj-axis${jobReady ? ' is-lit' : ''}`} aria-hidden="true"/>
      <div className={`zj-node ${jobReady ? 'is-done' : 'is-current'}`} aria-hidden="true"/>
      <div className="zj-side is-l"><div className="zj-block zj-reveal">
        <h2>{t('prepTheirs')}</h2>
        <p className="zj-block-note">{t('prepTheirsNote')}</p>
        {job ? <SavedDocument entry={job} t={t} busy={busy} onConfirm={confirmJob} onReplace={() => update({ jobVersionId: null })} onContinue={() => slide('resume')}/> : <form onSubmit={event => { event.preventDefault(); if (!busy && jobInputReady) void (value.jobSource === 'paste' ? saveJobText() : readJobLink()); }}>
          <label className="zj-field-label" htmlFor="zj-prep-role">{t('prepRole')}</label>
          <input id="zj-prep-role" className="zj-field" required maxLength={160} value={value.role} placeholder={t('prepRoleHint')} onChange={event => update({ role: event.target.value })}/>
          {value.jobSource === 'paste' ? <>
            <label className="zj-field-label" htmlFor="zj-prep-job">{t('prepJobText')}</label>
            <textarea id="zj-prep-job" className="zj-field" required rows={7} maxLength={200000} value={value.jobText} placeholder={t('prepJobHint')} onChange={event => update({ jobText: event.target.value })}/>
          </> : <>
            <label className="zj-field-label" htmlFor="zj-prep-url">{t('sourceUrl')}</label>
            <input id="zj-prep-url" className="zj-field" required type="url" value={value.jobUrl} placeholder={t('prepJobUrlHint')} onChange={event => update({ jobUrl: event.target.value })}/>
          </>}
          <div className="zj-flow-actions">
            <Button type="submit" primary disabled={busy || !jobInputReady}>{t(value.jobSource === 'paste' ? 'prepConfirmNext' : 'prepReadLink')}</Button>
            <Button quiet disabled={busy} onClick={() => update({ jobSource: value.jobSource === 'paste' ? 'url' : 'paste' })}>{t(value.jobSource === 'paste' ? 'prepUseLink' : 'prepUsePaste')}</Button>
          </div>
        </form>}
      </div></div>
      <div className="zj-side is-r is-quiet"><div className="zj-block">
        <div className="zj-block-title">{t('prepYours')}</div>
        <p className="zj-block-note">{t('prepNextResume')}</p>
      </div></div>
    </section>

    <section className="zj-sec" data-step="resume" aria-label={t('resume')}>
      <div className={`zj-axis${resumeReady ? ' is-lit' : ''}`} aria-hidden="true"/>
      <div className={`zj-node ${resumeReady ? 'is-done' : jobReady ? 'is-current' : ''}`} aria-hidden="true"/>
      <div className="zj-side is-l is-quiet"><div className="zj-block">
        <div className="zj-block-title">{t('prepTheirs')}</div>
        <p className="zj-block-note">{jobReady ? role || job.material.title : t('prepJobMissing')}</p>
        <div className="zj-flow-actions"><Button quiet onClick={() => slide('job')}>{t('prepBackJob')}</Button></div>
      </div></div>
      <div className="zj-side is-r"><div className="zj-block zj-reveal">
        <h2>{t('prepYours')}</h2>
        <p className="zj-block-note">{t('prepYoursNote')}</p>
        {resume ? <SavedDocument entry={resume} t={t} busy={busy} onConfirm={confirmResume} onReplace={() => update({ resumeVersionId: null })} onContinue={() => slide('start')}/> : value.resumeSource === 'file' ? <>
          <label className={`zj-drop${dragging ? ' is-over' : ''}${busy ? ' is-disabled' : ''}`}
            onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)}
            onDrop={event => { event.preventDefault(); setDragging(false); void importResume(event.dataTransfer?.files?.[0]); }}>
            <input type="file" disabled={busy} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void importResume(file); }}/>
            <span>{t('prepDrop')}</span>
          </label>
          <div className="zj-flow-actions">
            <Button quiet disabled={busy} onClick={() => update({ resumeSource: 'paste' })}>{t('prepPasteResume')}</Button>
            {savedResumes.length > 0 && <select className="zj-field" style={{ width: 'auto', padding: '6px 12px' }} aria-label={t('prepExisting')} value="" disabled={busy} onChange={event => { if (event.target.value) update({ resumeVersionId: event.target.value }); }}>
              <option value="">{t('prepExisting')}</option>
              {savedResumes.map(({ material, version }) => <option key={version.id} value={version.id}>{material.title} · {t('version', { number: version.revision })}</option>)}
            </select>}
          </div>
        </> : <form onSubmit={event => { event.preventDefault(); if (!busy && value.resumeText.trim()) void saveResumeText(); }}>
          <label className="zj-field-label" htmlFor="zj-prep-resume">{t('resume')}</label>
          <textarea id="zj-prep-resume" className="zj-field" required rows={8} maxLength={200000} value={value.resumeText} placeholder={t('prepResumeHint')} onChange={event => update({ resumeText: event.target.value })}/>
          <div className="zj-flow-actions">
            <Button type="submit" primary disabled={busy || !value.resumeText.trim()}>{t('prepConfirmNext')}</Button>
            <Button quiet disabled={busy} onClick={() => update({ resumeSource: 'file' })}>{t('prepUseFile')}</Button>
          </div>
        </form>}
      </div></div>
    </section>

    <section className="zj-sec is-start" data-step="start" aria-label={t('prepStart')}>
      <div className={`zj-axis is-short${ready ? ' is-lit' : ''}`} aria-hidden="true"/>
      <div className={`zj-node ${ready ? 'is-current' : ''}`} aria-hidden="true"/>
      <div className="zj-side is-l"><div className="zj-block zj-reveal">
        <span className="zj-block-label">{t('goals')}</span>
        <div className={`zj-block-value${jobReady ? '' : ' is-missing'}`}>{jobReady ? role || job.material.title : t('prepMissing')}</div>
        <div className="zj-flow-actions" style={{ marginTop: 4 }}><Button quiet onClick={() => slide('job')}>{t('prepBackJob')}</Button></div>
      </div></div>
      <div className="zj-side is-r"><div className="zj-block zj-reveal">
        <span className="zj-block-label">{t('resume')}</span>
        <div className={`zj-block-value${resumeReady ? '' : ' is-missing'}`}>{resumeReady ? resume.material.title : t(resume ? 'prepUnconfirmed' : 'prepMissing')}</div>
        <div className="zj-flow-actions" style={{ marginTop: 4 }}><Button quiet onClick={() => slide('resume')}>{t('prepBackResume')}</Button></div>
      </div></div>
      <div className="zj-bar zj-reveal">
        {!ready ? <p>{t('prepNotReady')}</p> : <div className="zj-fade">
          <div className="zj-bar-row">
            <Options label={t('interviewMode')} values={['realtime', 'text']} value={value.mode} disabled={busy} onChange={mode => update({ mode })} render={mode => t(mode === 'realtime' ? 'realtimeCall' : 'textInterview')}/>
            <Options label={t('questions')} values={QUESTION_COUNTS} value={value.questionCount} disabled={busy} onChange={questionCount => update({ questionCount })} render={number => t('prepCount', { number })}/>
            <Options label={t('language')} values={['zh', 'en']} value={value.language} disabled={busy} onChange={language => update({ language })} render={language => t(language === 'en' ? 'enLanguage' : 'zhLanguage')}/>
            <Button primary disabled={busy || voiceBlocked || !workspaceId} onClick={() => { void start(); }}>{t('prepStart')}</Button>
          </div>
          {voiceBlocked && <div className="zj-bar-note" role="status"><span>{t('prepVoiceSetup')}</span>
            <Button small disabled={!openRealtimeSettings} onClick={() => { try { openRealtimeSettings?.(); } catch { /* The note keeps the retry path. */ } }}>{t('realtimeSettings')}</Button>
            <Button small quiet disabled={checking} onClick={() => { void checkVoice(); }}>{t('prepRecheck')}</Button></div>}
          {!workspaceId && <div className="zj-bar-note"><label>{t('dshWorkspace')} <select value="" disabled={busy} onChange={event => onWorkspace?.(event.target.value)}>
            <option value="">{t('selectWorkspace')}</option>{workspaces.map(row => <option key={row.workspaceId} value={row.workspaceId}>{row.title}</option>)}</select></label>
            {!workspaces.length && <span>{t('workspaceRequired')}</span>}
            {onManageWorkspaces && <Button small quiet onClick={onManageWorkspaces}>{t('manageWorkspaces')}</Button>}</div>}
        </div>}
      </div>
    </section>
  </div>;
}

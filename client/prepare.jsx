import React from 'react';
import { Button } from './components.jsx';
import { resumeOptions, versionEntry } from './model.js';
import { realtimeUnavailable } from './voice/realtime-call.js';
import { ScoreStep } from './prepare-score.jsx';
import { goalForJob, openRewrite, previousScore, resumeScore, rewriteInstructions } from './score.js';

/**
 * Prepare flow: job description, resume, score, then start, on one vertical axis.
 *
 * It only sequences actions the Host already has (material.add / fetch /
 * upload / confirm / update, goal.create, goal.linkMaterial, assessment.run,
 * rewrite.run / accept, interview start). Progress is derived from saved
 * facts: a step counts as done when its material version exists and the user
 * confirmed it, never because a button was pressed. The score step passes at
 * 80, or when the user chose to skip it for this resume version.
 */
export const PREPARE_DEFAULTS = Object.freeze({ role: '', jobSource: 'paste', jobText: '', jobUrl: '', jobVersionId: null,
  resumeSource: 'file', resumeText: '', resumeVersionId: null, goalId: null, scoreSkippedFor: null, language: 'zh', questionCount: 5, mode: 'realtime' });
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
  const ready = jobReady && resumeReady && role.length > 0;
  const goal = ready ? goalForJob(state, value.goalId, job.version.id) : null;
  const score = resumeScore(state, { goalId: goal?.id, resumeVersionId: resume?.version.id, jobVersionId: job?.version.id });
  const skipped = ready && value.scoreSkippedFor === resume.version.id;
  const cleared = ready && (score.pass || skipped);
  return { value, job, resume, role, jobReady, resumeReady, ready, goal, score, skipped, cleared,
    current: !jobReady ? 'job' : !resumeReady ? 'resume' : !cleared ? 'score' : 'start' };
}

function failureText(error, t) {
  const code = error?.code || '';
  if (code === 'MODEL_NOT_CONFIGURED') return t('prepFailModel');
  if (code === 'MODEL_TIMEOUT') return t('prepFailTimeout');
  if (code.startsWith('REWRITE_')) return t('prepFailRewrite');
  return t('prepFailGeneric');
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

export function Prepare({ t, state, busy = false, draft, onDraftChange, action, task, upload, startInterview, workspaces = [], workspaceId = '', onWorkspace,
  onManageWorkspaces, realtimeApi, openRealtimeSettings, onSkip }) {
  const progress = prepareProgress(state, draft);
  const { value, job, resume, role, jobReady, resumeReady, ready, goal, score, skipped, cleared } = progress;
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
    if (await action('material.confirm', { versionId: saved.latestVersionId })) toScore(saved.latestVersionId);
  };
  const confirmResume = async () => { if (await action('material.confirm', { versionId: resume.version.id })) toScore(resume.version.id); };
  // The goal is made when scoring starts: the fit assessment reads the job through it.
  // A retry reuses the goal it already made, or one already linked to this job version.
  const ensureGoal = async act => {
    let current = goalForJob(state, latest.current.goalId, job.version.id);
    if (!current) {
      current = await act('goal.create', { title: role });
      if (!current) return null;
    }
    if (current.id !== latest.current.goalId) update({ goalId: current.id });
    const linked = current.materialLinks?.some(link => link.kind === 'job' && link.versionId === job.version.id);
    if (!linked && !await act('goal.linkMaterial', { goalId: current.id, versionId: job.version.id })) return null;
    return current.id;
  };

  // Scoring, revising and editing run as one guarded task each, so the two
  // assessments run side by side and a failure stays in the step.
  const [working, setWorking] = React.useState(null);
  const [failure, setFailure] = React.useState(null);
  const [panel, setPanel] = React.useState(null);
  const runStep = (name, operation) => (task ?? (body => body(action)))(async act => {
    setWorking(name); setFailure(null);
    try { return await operation(act); }
    catch (error) { if (error?.name !== 'AbortError' && alive.current) setFailure(failureText(error, t)); return undefined; }
    finally { if (alive.current) setWorking(null); }
  });
  const assess = async (act, versionId) => {
    const goalId = await ensureGoal(act);
    if (!goalId) return;
    setWorking('score');
    const current = resumeScore(state, { goalId, resumeVersionId: versionId, jobVersionId: job.version.id });
    // Only what this resume version still lacks; a fresh version needs both.
    const kinds = versionId === resume?.version.id ? current.missing : ['fit', 'resume'];
    await Promise.all(kinds.map(kind => act('assessment.run', { kind, versionId, goalId })));
  };
  // Called right after a confirmation too, when this render's state is not refreshed yet,
  // so it takes the version id instead of reading readiness from the closure.
  const scoreNow = versionId => { if (versionId && role && job) void runStep('score', act => assess(act, versionId)); };
  function toScore(versionId) { slide('score'); scoreNow(versionId); }
  React.useEffect(() => { setPanel(null); setFailure(null); }, [resume?.version.id, job?.version.id]);
  const revise = () => {
    if (!goal || busy) return;
    const existing = openRewrite(state, goal.id, resume.version.id);
    if (existing) { setPanel({ kind: 'rewrite', rewrite: existing, selected: existing.items.map(item => item.id) }); return; }
    void runStep('revise', async act => {
      const proposal = await act('rewrite.run', { versionId: resume.version.id, goalId: goal.id, instructions: rewriteInstructions(score, t) });
      if (proposal && alive.current) setPanel({ kind: 'rewrite', rewrite: proposal, selected: proposal.items.map(item => item.id) });
    });
  };
  // Picking the changes and pressing apply is the user's confirmation of the new version.
  const adopt = async (act, versionId) => {
    if (!await act('material.confirm', { versionId })) return;
    update({ resumeVersionId: versionId, scoreSkippedFor: null });
    if (alive.current) setPanel(null);
    await assess(act, versionId);
  };
  const applyRewrite = () => {
    if (panel?.kind !== 'rewrite' || !panel.selected.length || busy) return;
    void runStep('apply', async act => {
      const accepted = await act('rewrite.accept', { rewriteId: panel.rewrite.id, itemIds: panel.selected });
      if (accepted?.version?.id) await adopt(act, accepted.version.id);
    });
  };
  const saveEdit = () => {
    if (panel?.kind !== 'edit' || !panel.text.trim() || busy) return;
    void runStep('edit', async act => {
      const saved = await act('material.update', { materialId: resume.material.id, text: panel.text });
      if (saved?.latestVersionId && saved.latestVersionId !== resume.version.id) await adopt(act, saved.latestVersionId);
    });
  };

  const start = async () => {
    if (!ready || !cleared || busy || voiceBlocked) return;
    let goalId = goal?.id;
    if (!goalId) { goalId = await action('goal.create', { title: role }).then(row => row?.id); if (!goalId) return; update({ goalId }); }
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
        {resume ? <SavedDocument entry={resume} t={t} busy={busy} onConfirm={confirmResume} onReplace={() => update({ resumeVersionId: null })} onContinue={() => { slide('score'); if (score.status === 'none' || score.status === 'partial') scoreNow(resume.version.id); }}/> : value.resumeSource === 'file' ? <>
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

    <ScoreStep t={t} busy={busy} ready={ready} score={score} previous={previousScore(state, { goalId: goal?.id, jobVersionId: job?.version.id, resumeVersionId: resume?.version.id }, resume?.material.id)}
      working={working} failure={failure} panel={panel} skipped={skipped}
      onScore={() => { if (ready && !busy) scoreNow(resume.version.id); }} onRevise={revise} onEdit={() => setPanel({ kind: 'edit', text: resume.version.text })}
      onSkip={() => { update({ scoreSkippedFor: resume.version.id }); slide('start'); }} onContinue={() => slide('start')}
      onPanel={setPanel} onApply={applyRewrite} onSave={saveEdit}/>

    <section className="zj-sec is-start" data-step="start" aria-label={t('prepStart')}>
      <div className={`zj-axis is-short${cleared ? ' is-lit' : ''}`} aria-hidden="true"/>
      <div className={`zj-node ${cleared ? 'is-current' : ''}`} aria-hidden="true"/>
      <div className="zj-side is-l"><div className="zj-block zj-reveal">
        <span className="zj-block-label">{t('goals')}</span>
        <div className={`zj-block-value${jobReady ? '' : ' is-missing'}`}>{jobReady ? role || job.material.title : t('prepMissing')}</div>
        <div className="zj-flow-actions" style={{ marginTop: 4 }}><Button quiet onClick={() => slide('job')}>{t('prepBackJob')}</Button></div>
      </div></div>
      <div className="zj-side is-r"><div className="zj-block zj-reveal">
        <span className="zj-block-label">{t('resume')}</span>
        <div className={`zj-block-value${resumeReady ? '' : ' is-missing'}`}>{resumeReady ? resume.material.title : t(resume ? 'prepUnconfirmed' : 'prepMissing')}</div>
        {resumeReady && typeof score.total === 'number' && <span className="zj-block-label">{t('prepScoreOf', { score: score.total })}{skipped && !score.pass ? ` · ${t('prepSkipped')}` : ''}</span>}
        <div className="zj-flow-actions" style={{ marginTop: 4 }}><Button quiet onClick={() => slide('resume')}>{t('prepBackResume')}</Button></div>
      </div></div>
      <div className="zj-bar zj-reveal">
        {!ready ? <p>{t('prepNotReady')}</p> : !cleared ? <div className="zj-fade">
          <p>{typeof score.total === 'number' ? t('prepGateBelow', { score: score.total }) : t('prepGateNone')}</p>
          <div className="zj-flow-actions" style={{ justifyContent: 'center' }}>
            <Button primary disabled={busy} onClick={() => slide('score')}>{t('prepGateBack')}</Button>
            {score.status !== 'none' && score.status !== 'partial' && <Button quiet disabled={busy} onClick={() => update({ scoreSkippedFor: resume.version.id })}>{t('prepSkipScore')}</Button>}
          </div>
        </div> : <div className="zj-fade">
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

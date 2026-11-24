import React from 'react';
import { Button, hasOriginalFile, OriginalFile, Sheet } from './components.jsx';
import { resumeOptions, versionEntry } from './model.js';
import { ScorePanel } from './prepare-score.jsx';
import { goalForJob, openRewrite, previousScore, resumeScore, rewriteInstructions } from './score.js';

/**
 * The interview page: one screen that shows what this interview still needs
 * (job description, resume, resume score, voice) and the start button.
 *
 * It only sequences actions the Host already has (material.add / fetch /
 * upload / confirm / update, goal.create, goal.linkMaterial, assessment.run,
 * rewrite.run / accept, interview start). A row counts as done when its saved
 * version exists and the user confirmed it, never because a button was
 * pressed. The score passes at 80, or when the user chose to skip it for this
 * resume version. Editing happens in a side sheet; the page never moves.
 */
export const PREPARE_DEFAULTS = Object.freeze({ role: '', jobSource: 'paste', jobText: '', jobUrl: '', jobVersionId: null,
  resumeSource: 'file', resumeText: '', resumeVersionId: null, goalId: null, scoreSkippedFor: null, language: 'zh', questionCount: 5, mode: 'realtime' });
export const QUESTION_COUNTS = [3, 5, 8];

function entryOfKind(state, versionId, kind) {
  const entry = versionId ? versionEntry(state, versionId) : null;
  return entry?.material.kind === kind ? entry : null;
}

const newest = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''));

/** A returning user starts from the newest role with a confirmed job and the newest confirmed resume. */
export function initialPrepareDraft(state) {
  const draft = {};
  for (const goal of [...(state?.goals || [])].filter(row => row.status !== 'archived').sort(newest)) {
    const job = (goal.materialLinks || []).map(link => entryOfKind(state, link.versionId, 'job')).filter(entry => entry?.version.confirmed)
      .sort((a, b) => b.version.revision - a.version.revision)[0];
    if (job) { Object.assign(draft, { role: goal.title || '', goalId: goal.id, jobVersionId: job.version.id }); break; }
  }
  const resume = state ? resumeOptions(state).sort((a, b) => newest(a.material, b.material) || b.version.revision - a.version.revision)[0] : null;
  if (resume) draft.resumeVersionId = resume.version.id;
  return draft;
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
    current: !jobReady || !role ? 'job' : !resumeReady ? 'resume' : !cleared ? 'score' : 'start' };
}

/** The one reason the start button is off, in the order the user meets them. */
export function startBlock(progress, { voiceReady = false, workspaceReady = false } = {}) {
  if (!progress.ready) return 'prep';
  if (!progress.cleared) return 'score';
  if (progress.value.mode === 'realtime' && !voiceReady) return 'voice';
  if (!workspaceReady) return 'workspace';
  return null;
}

const HEADS = { job: 'deskHeadJob', resume: 'deskHeadResume', score: 'deskHeadScore', voice: 'deskHeadVoice', workspace: 'deskHeadWorkspace' };

const EVIDENCE_FAILURES = new Set(['EVIDENCE_QUOTE_MISMATCH', 'EVIDENCE_RANGE_REQUIRED', 'EVIDENCE_REQUIRED', 'EVIDENCE_SOURCE_INVALID',
  'EVIDENCE_HASH_MISMATCH', 'INVALID_EVIDENCE', 'FIT_EVIDENCE_INCOMPLETE']);
const FORMAT_FAILURES = new Set(['MODEL_INVALID_JSON', 'INVALID_MODEL_RESULT', 'RUBRIC_INCOMPLETE', 'INVALID_RATING', 'INVALID_TEXT', 'MODEL_INCOMPLETE', 'MODEL_FAILED']);

/** What went wrong in plain words, with the Host's code so a report can name it. */
export function failureText(error, t) {
  const code = typeof error?.code === 'string' ? error.code : '';
  const words = code === 'MODEL_NOT_CONFIGURED' || code === 'MODEL_SELECTION_INVALID' ? t('prepFailModel')
    : code === 'MODEL_TIMEOUT' ? t('prepFailTimeout')
      : code === 'MODEL_REQUEST_FAILED' ? t('prepFailRequest')
      : code === 'BUSY' || code === 'REQUEST_IN_PROGRESS' ? t('prepFailBusy')
        : EVIDENCE_FAILURES.has(code) ? t('prepFailEvidence')
          : FORMAT_FAILURES.has(code) ? t('prepFailFormat')
            : code.startsWith('REWRITE_') ? t('prepFailRewrite') : t('prepFailGeneric');
  return /^[A-Z][A-Z0-9_]{1,80}$/u.test(code) ? `${words}${t('prepFailCode', { code })}` : words;
}

/** Run every call to the end, then report the first failure: one side failing must not hide the other. */
export async function settleAll(calls) {
  const results = await Promise.allSettled(calls);
  const failed = results.find(result => result.status === 'rejected');
  if (failed) throw failed.reason;
  return results.map(result => result.value);
}

const excerpt = (text, length = 400) => String(text || '').trim().slice(0, length);
const Check = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>;

function Options({ label, values, value, onChange, render, disabled }) {
  return <div className="zj-seg" role="group" aria-label={label}>{values.map(option => <button type="button" key={option}
    aria-pressed={value === option} className={value === option ? 'is-on' : ''} disabled={disabled} onClick={() => onChange(option)}>{render(option)}</button>)}</div>;
}

function SavedDocument({ entry, t, busy, onConfirm, onReplace, onContinue, onPreview }) {
  const { material, version } = entry;
  // An uploaded file is shown as the file, with a preview of the original, never as the text read from it.
  if (hasOriginalFile(version)) return <div className="zj-fade zj-stack">
    <OriginalFile entry={entry} t={t} onPreview={onPreview}>{version.confirmed && <span className="zj-badge">{t('prepConfirmed')}</span>}</OriginalFile>
    <div className="zj-flow-actions">{version.confirmed ? <Button primary onClick={onContinue}>{t('prepContinue')}</Button>
      : <Button primary disabled={busy} onClick={onConfirm}>{t('deskFileUse')}</Button>}<Button quiet disabled={busy} onClick={onReplace}>{t('prepReplace')}</Button></div>
  </div>;
  if (version.confirmed) return <div className="zj-fade zj-stack">
    <div className="zj-doc is-confirmed"><strong>{material.title}</strong><span className="zj-badge">{t('prepConfirmed')}</span><p className="zj-doc-text">{excerpt(version.text, 1200)}</p></div>
    <div className="zj-flow-actions"><Button primary disabled={busy} onClick={onContinue}>{t('prepContinue')}</Button><Button quiet disabled={busy} onClick={onReplace}>{t('prepReplace')}</Button></div>
  </div>;
  return <div className="zj-fade zj-stack">
    <div className="zj-doc"><strong>{material.title}</strong><p className="zj-doc-text">{excerpt(version.text, 4000)}</p></div>
    <p className="zj-hint">{t('prepReviewNote')}</p>
    <div className="zj-flow-actions"><Button primary disabled={busy} onClick={onConfirm}>{t('prepConfirmThis')}</Button><Button quiet disabled={busy} onClick={onReplace}>{t('prepReplace')}</Button></div>
  </div>;
}

export function Prepare({ t, state, busy = false, draft, onDraftChange, action, task, upload, openOriginal, startInterview,
  sheet = null, onSheet = () => {}, voiceReady = false, voiceSaved = false, voiceFailed = false, voiceFailureCode, voiceChecking = false, workspaceReady = false, onOpenSettings, unfinished = null, onContinue }) {
  const progress = prepareProgress(state, draft);
  const { value, job, resume, role, jobReady, resumeReady, ready, goal, score, skipped, cleared } = progress;
  const latest = React.useRef(value); latest.current = value;
  const update = patch => { latest.current = { ...latest.current, ...patch }; onDraftChange?.(latest.current); };
  const alive = React.useRef(true);
  React.useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const block = startBlock(progress, { voiceReady, workspaceReady });
  const savedResumes = resumeOptions(state);
  const otherRoles = (state.goals || []).filter(row => row.status !== 'archived' && row.id !== goal?.id
    && (row.materialLinks || []).some(link => entryOfKind(state, link.versionId, 'job')?.version.confirmed));
  const [dragging, setDragging] = React.useState(false);

  const afterJob = () => onSheet(resumeReady ? null : 'resume');
  const saveJobText = async () => {
    const saved = await action('material.add', { title: t('prepJobTitle', { role }), kind: 'job', text: value.jobText });
    if (!saved) return;
    update({ jobVersionId: saved.latestVersionId });
    if (await action('material.confirm', { versionId: saved.latestVersionId })) afterJob();
  };
  const readJobLink = async () => {
    const saved = await action('material.fetch', { title: t('prepJobTitle', { role }), kind: 'job', url: value.jobUrl });
    if (saved) update({ jobVersionId: saved.latestVersionId });
  };
  const confirmJob = async () => { if (await action('material.confirm', { versionId: job.version.id })) afterJob(); };
  const pickRole = goalId => {
    const row = otherRoles.find(item => item.id === goalId);
    const link = row && (row.materialLinks || []).map(item => entryOfKind(state, item.versionId, 'job')).filter(entry => entry?.version.confirmed)
      .sort((a, b) => b.version.revision - a.version.revision)[0];
    if (link) update({ role: row.title || '', goalId: row.id, jobVersionId: link.version.id, scoreSkippedFor: null });
  };
  // The uploaded file is the user's own resume and stays one click away (preview), so it is used
  // as is. Scoring starts at once when the job is ready; the sheet stays put to show the file.
  const importResume = async file => {
    if (!file || busy) return;
    const saved = await upload(file, { title: file.name, kind: 'resume' });
    if (!saved) return;
    update({ resumeVersionId: saved.latestVersionId });
    if (await action('material.confirm', { versionId: saved.latestVersionId }) && jobReady && role) scoreNow(saved.latestVersionId);
  };
  const saveResumeText = async () => {
    const saved = await action('material.add', { title: t('resume'), kind: 'resume', text: value.resumeText });
    if (!saved) return;
    update({ resumeVersionId: saved.latestVersionId });
    if (await action('material.confirm', { versionId: saved.latestVersionId })) toScore(saved.latestVersionId);
  };
  const confirmResume = async () => {
    if (!await action('material.confirm', { versionId: resume.version.id })) return;
    if (jobReady && role) toScore(resume.version.id); else onSheet('job');
  };
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
  // assessments run side by side and a failure stays in the score sheet.
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
    await settleAll(kinds.map(kind => act('assessment.run', { kind, versionId, goalId })));
  };
  // Called right after a confirmation too, when this render's state is not refreshed yet,
  // so it takes the version id instead of reading readiness from the closure.
  const scoreNow = versionId => { if (versionId && role && job) void runStep('score', act => assess(act, versionId)); };
  function toScore(versionId) { onSheet('score'); scoreNow(versionId); }
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
  const openScore = () => {
    onSheet('score');
    if (ready && !busy && working !== 'score' && (score.status === 'none' || score.status === 'partial')) scoreNow(resume.version.id);
  };
  const skipScore = () => { if (resume) update({ scoreSkippedFor: resume.version.id }); onSheet(null); };

  const start = async () => {
    if (block || busy) return;
    let goalId = goal?.id;
    if (!goalId) { goalId = await action('goal.create', { title: role }).then(row => row?.id); if (!goalId) return; update({ goalId }); }
    if (!await action('goal.linkMaterial', { goalId, versionId: job.version.id })) return;
    await startInterview({ goalId, versionId: resume.version.id, language: value.language, questionCount: value.questionCount, mode: value.mode });
  };

  // The four rows. Each says what is there now and offers the one next action.
  const scoreValue = !ready ? t('deskScoreWait') : working === 'score' ? t('deskScoring') : score.status === 'none' || score.status === 'partial' ? t('deskScoreNone')
    : score.status === 'unknown' ? t('deskScoreUnknown') : score.pass ? t('deskScorePass', { score: score.total }) : skipped ? t('deskScoreSkipped', { score: score.total })
    : t('deskScoreBelow', { score: score.total, gap: score.gap });
  const rows = [
    { id: 'job', title: t('deskRowJob'), done: jobReady && Boolean(role), primary: progress.current === 'job',
      value: job ? `${role || job.material.title} · ${t(job.version.confirmed ? 'deskConfirmedShort' : 'prepUnconfirmed')}` : role || t('prepMissing'),
      action: !job ? 'deskAdd' : !job.version.confirmed || !role ? 'deskConfirmIt' : 'deskView', open: () => onSheet('job') },
    { id: 'resume', title: t('deskRowResume'), done: resumeReady, primary: progress.current === 'resume',
      value: resume ? `${resume.material.title} · ${t('version', { number: resume.version.revision })} · ${t(resume.version.confirmed ? 'deskConfirmedShort' : 'prepUnconfirmed')}` : t('prepMissing'),
      action: !resume ? 'deskAdd' : !resume.version.confirmed ? 'deskConfirmIt' : 'deskView', open: () => onSheet('resume') },
    { id: 'score', title: t('deskRowScore'), done: cleared, warn: ready && !cleared, primary: progress.current === 'score', disabled: !ready, value: scoreValue,
      action: score.status === 'none' || score.status === 'partial' ? 'deskScoreIt' : cleared ? 'deskView' : 'deskRevise', open: openScore },
    { id: 'voice', title: t('deskRowVoice'), done: value.mode === 'text' || voiceReady, warn: value.mode === 'realtime' && !voiceReady && !voiceChecking, primary: block === 'voice',
      value: value.mode === 'text' ? t('deskVoiceText') : voiceChecking && !voiceReady ? t('deskVoiceChecking') : voiceFailed && !voiceReady && voiceFailureCode ? t('deskVoiceFailedCode', { code: voiceFailureCode })
        : t(voiceReady ? 'deskVoiceReady' : voiceFailed ? 'deskVoiceFailed' : voiceSaved ? 'deskVoiceUntested' : 'deskVoiceNone'),
      action: value.mode === 'text' || voiceReady ? 'deskSettingsShort' : voiceSaved ? 'deskTestIt' : 'deskConnect', open: () => onOpenSettings?.() },
  ];
  const head = block === 'prep' ? HEADS[progress.current === 'resume' ? 'resume' : 'job'] : block ? HEADS[block] : 'deskHeadReady';
  const jobInputReady = role.length > 0 && (value.jobSource === 'paste' ? value.jobText.trim().length > 0 : value.jobUrl.trim().length > 0);

  return <div className="zj-page zj-interview-page" data-prepare="">
    <header className="zj-page-head">
      {role ? <><span className="zj-label">{t('deskThisOne')}</span><h1 className="zj-display">{role}</h1></>
        : <><h1 className="zj-display">{t('prepSlogan')}</h1><p className="zj-intro">{t('prepLead')}</p></>}
    </header>
    {unfinished && onContinue && <div className="zj-note" role="status"><span>{t('deskUnfinished', { date: String(unfinished.createdAt || '').slice(0, 10) })}</span>
      <Button small primary onClick={() => onContinue(unfinished.sessionId)}>{t('reviewContinue')}</Button></div>}
    <div className="zj-desk-grid">
      <section className="zj-card zj-checklist" aria-label={t('deskThisOne')}>
        <ol className="zj-rows">{rows.map((row, index) => <li key={row.id} className="zj-row" data-row={row.id}>
          <span className={`zj-step${row.done ? ' is-done' : row.warn ? ' is-warn' : ''}`} aria-hidden="true">{row.done ? <Check/> : index + 1}</span>
          <div className="zj-row-text"><strong>{row.title}</strong><span className="zj-hint">{row.value}</span></div>
          <Button small primary={row.primary && !row.done} disabled={row.disabled} onClick={row.open}>{t(row.action)}</Button>
        </li>)}</ol>
      </section>
      <section className="zj-card zj-start" aria-label={t('deskStartLabel')}>
        <span className="zj-label">{t('deskStartLabel')}</span>
        <h2 className="zj-display is-md">{t(head)}</h2>
        <p className="zj-muted">{t('deskStartSub', { count: value.questionCount, mode: t(value.mode === 'realtime' ? 'deskModeVoice' : 'deskModeText'), language: t(value.language === 'en' ? 'enLanguage' : 'zhLanguage') })}</p>
        <div className="zj-start-opts">
          <Options label={t('interviewMode')} values={['realtime', 'text']} value={value.mode} disabled={busy} onChange={mode => update({ mode })} render={mode => t(mode === 'realtime' ? 'realtimeCall' : 'textInterview')}/>
          <Options label={t('questions')} values={QUESTION_COUNTS} value={value.questionCount} disabled={busy} onChange={questionCount => update({ questionCount })} render={number => t('prepCount', { number })}/>
          <Options label={t('language')} values={['zh', 'en']} value={value.language} disabled={busy} onChange={language => update({ language })} render={language => t(language === 'en' ? 'enLanguage' : 'zhLanguage')}/>
        </div>
        {block === 'prep' && <p className="zj-note">{t('prepNotReady')}</p>}
        {block === 'score' && <div className="zj-note is-warn" role="status"><span>{typeof score.total === 'number' && score.status === 'scored' ? t('prepGateBelow', { score: score.total }) : t('prepGateNone')}</span>
          <Button small onClick={openScore}>{t('prepGateBack')}</Button>
          {score.status === 'scored' && <Button small quiet onClick={skipScore}>{t('prepSkipScore')}</Button>}</div>}
        {block === 'voice' && <div className="zj-note is-warn" role="status"><span>{t(voiceSaved ? 'deskBlockedVoiceTest' : 'deskBlockedVoice')}</span>
          <Button small onClick={() => onOpenSettings?.()}>{t('deskOpenSettings')}</Button><Button small quiet onClick={() => update({ mode: 'text' })}>{t('deskUseText')}</Button></div>}
        {block === 'workspace' && <div className="zj-note is-warn" role="status"><span>{t('deskBlockedWorkspace')}</span>
          <Button small onClick={() => onOpenSettings?.()}>{t('deskOpenSettings')}</Button></div>}
        {skipped && !score.pass && !block && <p className="zj-hint">{t('prepScoreOf', { score: score.total })} · {t('prepSkipped')}</p>}
        <div className="zj-start-go"><Button primary disabled={busy || Boolean(block)} onClick={() => { void start(); }}>{t('prepStart')}</Button></div>
      </section>
    </div>

    {sheet === 'job' && <Sheet title={t('deskRowJob')} t={t} onClose={() => onSheet(null)}>
      <div className="zj-stack">
        <label className="zj-control"><span className="zj-label">{t('prepRole')}</span>
          <input className="zj-input" required maxLength={160} value={value.role} placeholder={t('prepRoleHint')} onChange={event => update({ role: event.target.value })}/></label>
        {otherRoles.length > 0 && <label className="zj-control"><span className="zj-label">{t('deskPickRole')}</span>
          <select className="zj-input" value="" disabled={busy} onChange={event => { if (event.target.value) pickRole(event.target.value); }}>
            <option value="">{t('selectPlaceholder')}</option>{otherRoles.map(row => <option key={row.id} value={row.id}>{row.title}</option>)}</select></label>}
        {job ? <>
          <SavedDocument entry={job} t={t} busy={busy} onConfirm={() => { void confirmJob(); }} onReplace={() => update({ jobVersionId: null })} onContinue={afterJob} onPreview={openOriginal}/>
          <div><Button quiet small disabled={busy} onClick={() => update({ role: '', goalId: null, jobVersionId: null, jobText: '', jobUrl: '', scoreSkippedFor: null })}>{t('deskNewRole')}</Button></div>
        </> : <form className="zj-stack" onSubmit={event => { event.preventDefault(); if (!busy && jobInputReady) void (value.jobSource === 'paste' ? saveJobText() : readJobLink()); }}>
          <p className="zj-hint">{t('prepTheirsNote')}</p>
          {value.jobSource === 'paste' ? <label className="zj-control"><span className="zj-label">{t('prepJobText')}</span>
            <textarea className="zj-input" required rows={9} maxLength={200000} value={value.jobText} placeholder={t('prepJobHint')} onChange={event => update({ jobText: event.target.value })}/></label>
            : <label className="zj-control"><span className="zj-label">{t('sourceUrl')}</span>
              <input className="zj-input" required type="url" value={value.jobUrl} placeholder={t('prepJobUrlHint')} onChange={event => update({ jobUrl: event.target.value })}/></label>}
          <div className="zj-flow-actions">
            <Button type="submit" primary disabled={busy || !jobInputReady}>{t(value.jobSource === 'paste' ? 'prepConfirmNext' : 'prepReadLink')}</Button>
            <Button quiet disabled={busy} onClick={() => update({ jobSource: value.jobSource === 'paste' ? 'url' : 'paste' })}>{t(value.jobSource === 'paste' ? 'prepUseLink' : 'prepUsePaste')}</Button>
          </div>
        </form>}
      </div>
    </Sheet>}

    {sheet === 'resume' && <Sheet title={t('deskRowResume')} t={t} onClose={() => onSheet(null)}>
      <div className="zj-stack">
        {resume ? <SavedDocument entry={resume} t={t} busy={busy} onConfirm={() => { void confirmResume(); }} onReplace={() => update({ resumeVersionId: null })}
          onPreview={openOriginal} onContinue={() => { if (ready) openScore(); else onSheet(jobReady && role ? null : 'job'); }}/>
          : value.resumeSource === 'file' ? <>
            <p className="zj-hint">{t('prepYoursNote')}</p>
            <label className={`zj-drop${dragging ? ' is-over' : ''}${busy ? ' is-disabled' : ''}`}
              onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)}
              onDrop={event => { event.preventDefault(); setDragging(false); void importResume(event.dataTransfer?.files?.[0]); }}>
              <input type="file" disabled={busy} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void importResume(file); }}/>
              <span>{t('prepDrop')}</span>
            </label>
            <div className="zj-flow-actions"><Button quiet disabled={busy} onClick={() => update({ resumeSource: 'paste' })}>{t('prepPasteResume')}</Button></div>
          </> : <form className="zj-stack" onSubmit={event => { event.preventDefault(); if (!busy && value.resumeText.trim()) void saveResumeText(); }}>
            <label className="zj-control"><span className="zj-label">{t('resume')}</span>
              <textarea className="zj-input" required rows={10} maxLength={200000} value={value.resumeText} placeholder={t('prepResumeHint')} onChange={event => update({ resumeText: event.target.value })}/></label>
            <div className="zj-flow-actions"><Button type="submit" primary disabled={busy || !value.resumeText.trim()}>{t('prepConfirmNext')}</Button>
              <Button quiet disabled={busy} onClick={() => update({ resumeSource: 'file' })}>{t('prepUseFile')}</Button></div>
          </form>}
        {savedResumes.length > 0 && <label className="zj-control"><span className="zj-label">{t('prepExisting')}</span>
          <select className="zj-input" value="" disabled={busy} onChange={event => { if (event.target.value) update({ resumeVersionId: event.target.value }); }}>
            <option value="">{t('selectPlaceholder')}</option>
            {savedResumes.map(({ material, version }) => <option key={version.id} value={version.id}>{material.title} · {t('version', { number: version.revision })}</option>)}
          </select></label>}
      </div>
    </Sheet>}

    {sheet === 'score' && <Sheet title={t('deskScoreDrawer')} t={t} wide onClose={() => onSheet(null)}>
      <ScorePanel t={t} busy={busy} ready={ready} score={score}
        previous={previousScore(state, { goalId: goal?.id, jobVersionId: job?.version.id, resumeVersionId: resume?.version.id }, resume?.material.id)}
        working={working} failure={failure} panel={panel} skipped={skipped}
        onScore={() => { if (ready && !busy) scoreNow(resume.version.id); }} onRevise={revise} onEdit={() => setPanel({ kind: 'edit', text: resume.version.text })}
        onSkip={skipScore} onContinue={() => onSheet(null)} onPanel={setPanel} onApply={applyRewrite} onSave={saveEdit}/>
    </Sheet>}
  </div>;
}

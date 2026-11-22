import React from 'react';
import { Button } from './components.jsx';
import { prepareProgress, startBlock } from './prepare.jsx';
import { reviewRows } from './review-page.jsx';
import { resumeScore } from './score.js';
import { versionEntry } from './model.js';

const newest = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
const day = value => String(value || '').slice(0, 10);
const HEADS = { job: 'deskHeadJob', resume: 'deskHeadResume', score: 'deskHeadScore', voice: 'deskHeadVoice', workspace: 'deskHeadWorkspace' };

/**
 * Everything the home page shows, read from saved data and the interview page's
 * draft. Nothing here writes; every button hands off to the page that owns it.
 */
export function homeSummary(state, draft, { voiceReady = false, workspaceReady = false } = {}) {
  const progress = prepareProgress(state, draft || {});
  const block = startBlock(progress, { voiceReady, workspaceReady });
  const goals = (state.goals || []).filter(row => row.status !== 'archived');
  const interviews = [...(state.interviews || [])].sort(newest);
  const fresh = !(state.materials || []).length && !interviews.length && !goals.length;
  const reports = reviewRows(state).map(row => row.report && Number.isFinite(row.report.total) ? { ...row, total: row.report.total } : null).filter(Boolean);
  const resumeVersionId = progress.resume?.version.confirmed ? progress.resume.version.id : undefined;
  const roles = goals.map(goal => {
    const job = (goal.materialLinks || []).map(link => versionEntry(state, link.versionId))
      .filter(entry => entry?.material.kind === 'job' && entry.version.confirmed).sort((a, b) => b.version.revision - a.version.revision)[0];
    if (!job) return null;
    const score = resumeScore(state, { goalId: goal.id, resumeVersionId, jobVersionId: job.version.id });
    return { goal, job, score: score.total, interviews: interviews.filter(row => row.goalId === goal.id).length, current: goal.id === progress.goal?.id || goal.id === progress.value.goalId };
  }).filter(Boolean).sort((a, b) => Number(b.current) - Number(a.current) || newest(a.goal, b.goal));
  const unfinished = interviews.find(row => row.status !== 'completed' && row.sessionId) || null;
  // The sheet for the next step on the interview page, if that step is edited in one.
  const sheet = ['job', 'resume', 'score'].includes(progress.current) ? progress.current : null;
  return { fresh, progress, block, sheet, interviews, done: interviews.filter(row => row.status === 'completed').length, reports, roles, unfinished };
}

const Check = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>;
const Arrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;

/** Report totals, oldest to newest, as a quiet line. Only drawn with two or more. */
function Spark({ values, label }) {
  if (values.length < 2) return null;
  const width = 104, height = 38, low = Math.min(...values) - 8, high = Math.max(...values) + 8;
  const x = index => 3 + index * (width - 6) / (values.length - 1), y = value => height - 4 - (value - low) / Math.max(1, high - low) * (height - 8);
  const points = values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ');
  return <svg className="zj-spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
    <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1"/>
    <circle cx={x(values.length - 1)} cy={y(values.at(-1))} r="3" fill="currentColor"/>
  </svg>;
}

function Steps({ t, summary, voiceReady, voiceChecking }) {
  const { progress, block } = summary, { score, value } = progress;
  const scoreText = !progress.ready ? t('deskScoreNone') : score.status === 'scored' ? `${score.total} / 100` : score.status === 'unknown' ? t('deskScoreUnknown') : t('deskScoreNone');
  const rows = [
    { id: 'job', title: t('deskRowJob'), done: progress.jobReady && Boolean(progress.role), text: progress.job ? progress.role || progress.job.material.title : t('prepMissing') },
    { id: 'resume', title: t('deskRowResume'), done: progress.resumeReady, text: progress.resume ? progress.resume.material.title : t('prepMissing') },
    { id: 'score', title: t('deskRowScore'), done: progress.cleared, warn: progress.ready && !progress.cleared, text: progress.skipped && !score.pass ? `${scoreText} · ${t('prepSkipped')}` : scoreText },
    { id: 'voice', title: t('deskRowVoice'), done: value.mode === 'text' || voiceReady, warn: block === 'voice',
      text: value.mode === 'text' ? t('deskVoiceText') : voiceChecking && !voiceReady ? t('deskVoiceChecking') : t(voiceReady ? 'deskVoiceReady' : 'deskVoiceNone') },
  ];
  return <ol className="zj-home-steps">{rows.map((row, index) => <li key={row.id} className="zj-home-step" data-home-step={row.id}>
    <span className={`zj-step${row.done ? ' is-done' : row.warn ? ' is-warn' : ''}`} aria-hidden="true">{row.done ? <Check/> : index + 1}</span>
    <strong>{row.title}</strong><span className="zj-hint">{row.text}</span>
  </li>)}</ol>;
}

/** The 首页: where the next interview stands, what happened so far, and a way into each page. */
export function HomePage({ t, state, draft, voiceReady = false, voiceChecking = false, workspaceReady = false, nativeTitles = {}, busy = false,
  onPrepare, onUseRole, onEnterRoom, onPage, onOpenSettings }) {
  const summary = homeSummary(state, draft, { voiceReady, workspaceReady });
  const { fresh, progress, block, sheet, interviews, done, reports, roles, unfinished } = summary;
  const order = { '--i': 0 };
  const nth = index => ({ style: { '--i': index } });

  if (fresh) return <div className="zj-page zj-home is-new" data-page="home">
    <header className="zj-page-head zj-home-intro" style={order}>
      <h1 className="zj-display is-xl">{t('prepSlogan')}</h1>
      <p className="zj-intro">{t('prepLead')}</p>
      <div className="zj-flow-actions"><Button primary onClick={() => onPrepare?.('job')}>{t('homeStartFirst')}<Arrow/></Button>
        {!voiceReady && <Button quiet onClick={() => onOpenSettings?.()}>{t('homeSetupVoice')}</Button>}</div>
    </header>
    <section className="zj-section" aria-label={t('homeHowLabel')} {...nth(1)}>
      <h2 className="zj-label">{t('homeHowLabel')}</h2>
      <ol className="zj-home-how">{[1, 2, 3, 4].map(number => <li key={number} className="zj-card zj-how" {...nth(number + 1)}>
        <span className="zj-how-num" aria-hidden="true">{String(number).padStart(2, '0')}</span>
        <strong>{t(`homeStep${number}Title`)}</strong><p className="zj-hint">{t(`homeStep${number}Text`)}</p>
      </li>)}</ol>
    </section>
    <section className={`zj-card zj-home-voice${voiceReady ? ' is-ok' : ''}`} {...nth(6)}>
      <span className="zj-dot" aria-hidden="true"/><div><strong>{t('homeVoiceTitle')}</strong><p className="zj-hint">{t(voiceReady ? 'homeVoiceReady' : 'homeVoiceNone')}</p></div>
      <Button small onClick={() => onOpenSettings?.()}>{t(voiceReady ? 'deskSettingsShort' : 'deskConnect')}</Button>
    </section>
  </div>;

  const head = block === 'prep' ? HEADS[progress.current === 'resume' ? 'resume' : 'job'] : block ? HEADS[block] : 'deskHeadReady';
  const latest = reports[0] || null;
  const trend = reports.slice(0, 8).reverse().map(row => row.total);
  const score = progress.score;
  const scoreSub = !progress.ready ? t('deskScoreWait') : score.status === 'scored' ? score.pass ? t('homeScorePass') : progress.skipped ? t('prepSkipped') : t('homeScoreGap', { gap: score.gap })
    : score.status === 'unknown' ? t('deskScoreUnknown') : t('homeStatScoreNone');
  const titleOf = row => nativeTitles[row.interview.sessionId]?.title || row.goal?.title || t('interview');
  const recent = reviewRows(state).slice(0, 3);

  return <div className="zj-page zj-home" data-page="home">
    {unfinished && <div className="zj-note" role="status" style={order}><span>{t('deskUnfinished', { date: day(unfinished.createdAt) })}</span>
      <Button small primary onClick={() => onEnterRoom?.(unfinished.sessionId)}>{t('reviewContinue')}</Button></div>}

    <section className="zj-card zj-home-hero" aria-label={t('homeNextLabel')} {...nth(1)}>
      <div className="zj-home-hero-text">
        <span className="zj-label">{t('homeNextLabel')}</span>
        <h1 className="zj-display">{progress.role || t('homeNextUntitled')}</h1>
        <p className="zj-intro">{t(head)}</p>
        <div className="zj-flow-actions">
          <Button primary onClick={() => onPrepare?.(block ? sheet : null)}>{t(block ? 'homeContinue' : 'homeGoStart')}<Arrow/></Button>
          {roles.length > 1 && <Button quiet onClick={() => onPrepare?.('job')}>{t('homeSwitchRole')}</Button>}
        </div>
      </div>
      <Steps t={t} summary={summary} voiceReady={voiceReady} voiceChecking={voiceChecking}/>
    </section>

    <div className="zj-stats">
      <section className="zj-card zj-stat" {...nth(2)}><span className="zj-label">{t('homeStatInterviews')}</span>
        <span className="zj-display is-num">{interviews.length ? t('homeStatCount', { count: interviews.length }) : '—'}</span>
        <span className="zj-hint">{interviews.length ? t('homeStatDone', { done }) : t('homeStatNoneYet')}</span></section>
      <section className="zj-card zj-stat" {...nth(3)}><span className="zj-label">{t('homeStatLatest')}</span>
        <span className="zj-display is-num">{latest ? latest.total : '—'}{latest && <small>/ 100</small>}</span>
        <span className="zj-hint">{latest ? t('homeStatLatestSub', { date: day(latest.interview.createdAt), role: titleOf(latest) }) : t('homeStatNoReport')}</span>
        <Spark values={trend} label={t('homeTrend', { count: trend.length })}/></section>
      <section className="zj-card zj-stat" {...nth(4)}><span className="zj-label">{t('homeStatScore')}</span>
        <span className={`zj-display is-num${typeof score.total === 'number' && !score.pass ? ' is-below' : ''}`}>{typeof score.total === 'number' ? score.total : '—'}{typeof score.total === 'number' && <small>/ 100</small>}</span>
        <span className="zj-hint">{scoreSub}</span></section>
    </div>

    {recent.length > 0 && <section className="zj-section" aria-label={t('homeRecent')} {...nth(5)}>
      <div className="zj-section-head"><h2 className="zj-section-title">{t('homeRecent')}</h2>
        <Button small quiet onClick={() => onPage?.('review')}>{t('homeAllReview')}<Arrow/></Button></div>
      <div className="zj-cards">{recent.map(row => <article className="zj-card zj-tile" key={row.interview.id}>
        <div className="zj-tile-meta"><span className="zj-badge is-gray">{t(row.interview.mode === 'realtime' ? 'realtimeCall' : 'textInterview')}</span>
          <span className="zj-hint">{day(row.interview.createdAt)}</span>
          <span className="zj-hint">{t(row.interview.status === 'completed' ? 'reviewDone' : 'reviewActive')}</span></div>
        <div className="zj-tile-score"><span className="zj-display is-num">{typeof row.report?.total === 'number' ? row.report.total : '—'}</span><span className="zj-muted">{titleOf(row)}</span></div>
        {row.report?.summary && <p className="zj-hint zj-clamp">{row.report.summary}</p>}
        <div className="zj-tile-actions"><Button small primary={row.interview.status !== 'completed'} disabled={!row.interview.sessionId} onClick={() => onEnterRoom?.(row.interview.sessionId)}>
          {t(row.interview.status === 'completed' ? 'reviewOpenReport' : 'reviewContinue')}</Button></div>
      </article>)}</div>
    </section>}

    {roles.length > 0 && <section className="zj-section" aria-label={t('homeRoles')} {...nth(6)}>
      <div className="zj-section-head"><h2 className="zj-section-title">{t('homeRoles')}</h2>
        <Button small quiet onClick={() => onPage?.('library')}>{t('homeAllLibrary')}<Arrow/></Button></div>
      <ul className="zj-list-rows zj-home-roles">{roles.slice(0, 6).map(row => <li key={row.goal.id} className="zj-home-role">
        <strong>{row.goal.title}</strong>
        <span className="zj-hint">{[typeof row.score === 'number' ? t('homeRoleScore', { score: row.score }) : t('homeStatScoreNone'),
          row.interviews ? t('homeRoleInterviews', { count: row.interviews }) : t('homeRoleNever')].join(' · ')}</span>
        {row.current ? <span className="zj-badge is-gray">{t('homeRoleCurrent')}</span>
          : <Button small disabled={busy} onClick={() => onUseRole?.(row.goal)}>{t('homeRolePrepare')}</Button>}
      </li>)}</ul>
    </section>}

    {!voiceReady && progress.value.mode === 'realtime' && <section className="zj-card zj-home-voice" {...nth(7)}>
      <span className="zj-dot" aria-hidden="true"/><div><strong>{t('homeVoiceTitle')}</strong><p className="zj-hint">{t('homeVoiceNone')}</p></div>
      <Button small onClick={() => onOpenSettings?.()}>{t('deskConnect')}</Button>
    </section>}
  </div>;
}

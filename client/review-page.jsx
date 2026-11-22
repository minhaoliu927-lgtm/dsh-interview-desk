import React from 'react';
import { Button } from './components.jsx';
import { ReportTrend, ResultStudio } from './desk-views.jsx';
import { collectionRows } from './desk-collections.js';

const newest = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
const day = value => String(value || '').slice(0, 10);

/** Interviews newest first, each with its report if there is one. */
export function reviewRows(state) {
  return [...(state.interviews || [])].sort(newest).map(interview => ({ interview,
    report: (state.reports || []).find(row => row.id === interview.reportId || row.interviewId === interview.id) || null,
    goal: (state.goals || []).find(row => row.id === interview.goalId) || null }));
}

/** The 复盘 page: how interviews went, and the resume scores and revisions made along the way. */
export function ReviewPage({ t, state, nativeTitles = {}, open, onOpen, onClose, onEnterRoom, busy, onExport, onEvidence, onAction, onReviewVersion, drafts = {}, onDraft }) {
  if (open) {
    const row = collectionRows(state, 'reports').find(item => item.kind === open.kind && item.id === open.id);
    return <div className="zj-page" data-page="review">
      <div><Button quiet small onClick={onClose}>{t('reviewBack')}</Button></div>
      <ResultStudio key={open.id} row={row} state={state} t={t} busy={busy} onExport={onExport} onEvidence={onEvidence} onAction={onAction} onReviewVersion={onReviewVersion}
        draft={drafts[`result:${open.id}`]} onDraftChange={value => onDraft?.(`result:${open.id}`, value)}/>
    </div>;
  }
  const rows = reviewRows(state);
  const scored = rows.filter(row => typeof row.report?.total === 'number');
  const work = collectionRows(state, 'reports', nativeTitles).filter(row => row.kind !== 'report').sort(newest);
  return <div className="zj-page" data-page="review">
    <header className="zj-page-head">
      <span className="zj-label">{t('navReview')}</span>
      <h1 className="zj-display">{!rows.length ? t('reviewTitleNone') : scored.length ? t('reviewTitle', { count: rows.length, score: scored[0].report.total }) : t('reviewTitleNoScore', { count: rows.length })}</h1>
      <p className="zj-intro">{t(rows.length ? 'reviewLead' : 'reviewLeadNone')}</p>
    </header>
    {scored.length > 1 && <ReportTrend rows={scored.map(row => row.report)} t={t}/>}
    {rows.length > 0 && <section className="zj-section" aria-label={t('reviewInterviews')}>
      <h2 className="zj-section-title">{t('reviewInterviews')}</h2>
      <div className="zj-cards">{rows.map(({ interview, report, goal }) => <article className="zj-card zj-tile" key={interview.id}>
        <div className="zj-tile-meta"><span className="zj-badge is-gray">{t(interview.mode === 'realtime' ? 'realtimeCall' : 'textInterview')}</span>
          <span className="zj-hint">{day(interview.createdAt)}</span>
          <span className="zj-hint">{t(interview.status === 'completed' ? 'reviewDone' : 'reviewActive')}</span></div>
        <div className="zj-tile-score"><span className="zj-display is-num">{typeof report?.total === 'number' ? report.total : '—'}</span>
          <span className="zj-muted">{nativeTitles[interview.sessionId]?.title || goal?.title || t('interview')}</span></div>
        {report?.summary ? <p className="zj-hint zj-clamp">{report.summary}</p> : interview.status === 'completed' ? <p className="zj-hint">{t('reviewNoReport')}</p> : null}
        <div className="zj-tile-actions"><Button small primary={interview.status !== 'completed'} disabled={!interview.sessionId} onClick={() => onEnterRoom(interview.sessionId)}>
          {t(interview.status === 'completed' ? 'reviewOpenReport' : 'reviewContinue')}</Button>
          {report && <Button small quiet disabled={busy} onClick={() => onExport('report', report.id, 'pdf')}>{t('exportPdf')}</Button>}</div>
      </article>)}</div>
    </section>}
    {work.length > 0 && <section className="zj-section" aria-label={t('reviewResumeWork')}>
      <h2 className="zj-section-title">{t('reviewResumeWork')}</h2>
      <ul className="zj-list-rows">{work.map(row => <li key={`${row.kind}:${row.id}`}><button type="button" className="zj-list-row" onClick={() => onOpen({ kind: row.kind, id: row.id })}>
        <span className="zj-badge is-gray">{t(row.category)}</span><strong>{row.title || t('resume')}</strong>
        <span className="zj-hint">{typeof row.total === 'number' ? `${row.total} / 100 · ` : ''}{day(row.createdAt)}</span></button></li>)}</ul>
    </section>}
  </div>;
}

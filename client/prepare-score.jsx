import React from 'react';
import { Button } from './components.jsx';
import { PASS_SCORE, scoreSuggestions } from './score.js';

const calm = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/** The score rides the axis. The ring fills and the number counts up once per new total. */
function Dial({ total, busy, t }) {
  const ring = React.useRef(null), number = React.useRef(null);
  React.useEffect(() => {
    const node = ring.current, label = number.current;
    if (!node || !label || typeof total !== 'number') return undefined;
    if (calm() || typeof requestAnimationFrame !== 'function') { node.style.setProperty('--zj-p', String(total)); label.textContent = String(total); return undefined; }
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => node.style.setProperty('--zj-p', String(total))); });
    const begin = performance.now();
    let count = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - begin) / 1400);
      label.textContent = String(Math.round(total * (1 - (1 - progress) ** 3)));
      if (progress < 1) count = requestAnimationFrame(tick);
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(count); };
  }, [total]);
  if (busy) return <div className="zj-dial is-busy" aria-hidden="true"><span className="zj-dial-num">{t('score')}</span></div>;
  if (typeof total !== 'number') return <div className="zj-dial is-below" aria-hidden="true"><span className="zj-dial-num">—<small>/ 100</small></span></div>;
  return <div ref={ring} className={`zj-dial${total >= PASS_SCORE ? '' : ' is-below'}`} role="img" aria-label={t('prepScoreOf', { score: total })}>
    <span className="zj-dial-num" aria-hidden="true"><span ref={number}>{total}</span><small>/ 100</small></span>
  </div>;
}

function Criteria({ kind, assessment, busy, t }) {
  if (busy) return <div className="zj-crits" aria-hidden="true">{(kind === 'fit' ? [1, 2, 3] : [1, 2, 3, 4]).map(key => <div className="zj-skel" key={key}/>)}</div>;
  if (!assessment) return null;
  return <ul className="zj-crits">{assessment.criteria.map(row => {
    const name = t(`crit_${kind}_${row.id}`) === `crit_${kind}_${row.id}` ? row.name : t(`crit_${kind}_${row.id}`);
    const rating = typeof row.rating === 'number' ? row.rating : null;
    return <li key={row.id}><details className="zj-crit"><summary>
      <span className="zj-crit-name">{name}</span>
      {rating === null ? <span className="zj-crit-unknown">{t('prepUnknownCrit')}</span>
        : <span className="zj-pips" role="img" aria-label={`${rating} / 4`}>{[0, 1, 2, 3].map(index => <i key={index} className={`zj-pip${index < rating ? ' is-on' : ''}`} style={{ '--zj-i': index }}/>)}</span>}
      <span className="zj-crit-pts">{typeof row.score === 'number' ? `${Math.round(row.score)}/${row.weight}` : `—/${row.weight}`}</span>
    </summary>{row.reason && <p>{row.reason}</p>}</details></li>;
  })}</ul>;
}

function RewritePanel({ rewrite, selected, onToggle, onApply, onClose, busy, t }) {
  return <div className="zj-revise zj-fade" data-panel="">
    <p className="zj-revise-head">{t('prepReviseNote')}</p>
    <ul className="zj-revise-list">{rewrite.items.map(item => <li key={item.id}><label className="zj-change">
      <input type="checkbox" disabled={busy} checked={selected.includes(item.id)} onChange={event => onToggle(item.id, event.target.checked)}/>
      <span className="zj-change-pair"><span className="zj-change-before">{item.before}</span><span className="zj-change-after">{item.after}</span></span>
      {item.reason && <p className="zj-change-why">{item.reason}</p>}
    </label></li>)}</ul>
    <div className="zj-flow-actions">
      <Button quiet disabled={busy} onClick={onClose}>{t('prepReviseDrop')}</Button>
      <Button primary disabled={busy || !selected.length} onClick={onApply}>{t('prepReviseApply', { count: selected.length })}</Button>
    </div>
  </div>;
}

function EditPanel({ text, onChange, onSave, onClose, busy, t }) {
  return <form className="zj-revise zj-fade" data-panel="" onSubmit={event => { event.preventDefault(); if (!busy && text.trim()) onSave(); }}>
    <p className="zj-revise-head">{t('prepEditNote')}</p>
    <label className="zj-field-label" htmlFor="zj-prep-edit">{t('resume')}</label>
    <textarea id="zj-prep-edit" className="zj-field" rows={14} maxLength={200000} value={text} disabled={busy} onChange={event => onChange(event.target.value)}/>
    <div className="zj-flow-actions">
      <Button quiet disabled={busy} onClick={onClose}>{t('prepReviseDrop')}</Button>
      <Button type="submit" primary disabled={busy || !text.trim()}>{t('prepEditSave')}</Button>
    </div>
  </form>;
}

/**
 * The score step. It only shows saved assessments and rewrites; the parent
 * runs the Host actions. `working` names the action in flight, if any.
 */
export function ScoreStep({ t, busy, ready, score, previous, working, failure, panel, skipped,
  onScore, onRevise, onEdit, onSkip, onContinue, onPanel, onApply, onSave }) {
  const scoring = working === 'score';
  const { total, status, pass } = score;
  const hints = status === 'scored' && !pass ? scoreSuggestions(score) : [];
  const delta = typeof total === 'number' && typeof previous === 'number' && previous !== total ? total - previous : null;
  const open = Boolean(panel) || working === 'revise';
  const section = React.useRef(null);
  // Bring a newly opened panel into view; it sits under the verdict.
  React.useEffect(() => {
    const node = section.current?.querySelector('[data-panel]');
    node?.scrollIntoView?.({ behavior: calm() ? 'auto' : 'smooth', block: 'nearest' });
  }, [panel?.kind]);

  let verdict;
  if (!ready) verdict = <p>{t('prepScoreWait')}</p>;
  else if (scoring) verdict = <p role="status">{t('prepScoring')}</p>;
  else if (status === 'none' || status === 'partial') verdict = <>
    <p>{t('prepScoreIdle')}</p>
    <div className="zj-flow-actions"><Button primary disabled={busy} onClick={onScore}>{t('prepScoreRun')}</Button>
      {failure && <Button quiet disabled={busy} onClick={onSkip}>{t('prepSkipScore')}</Button>}</div>
  </>;
  else verdict = <>
    <p className="zj-verdict">{status === 'unknown' ? t('prepScoreUnknown') : t(pass ? 'prepScorePass' : 'prepScoreBelow', { score: total, gap: score.gap })}
      {delta !== null && <span className={`zj-delta${delta > 0 ? ' is-up' : ''}`}>{t('prepScoreDelta', { delta: delta > 0 ? `+${delta}` : String(delta) })}</span>}</p>
    {status === 'unknown' && (score.fit?.missing || []).concat(score.resume?.missing || []).length > 0
      && <ul className="zj-hints">{[...new Set([...(score.fit?.missing || []), ...(score.resume?.missing || [])])].slice(0, 3).map(text => <li key={text}>{text}</li>)}</ul>}
    {hints.length > 0 && <ul className="zj-hints">{hints.map(text => <li key={text}>{text}</li>)}</ul>}
    <div className="zj-weights">{t('prepScoreWeights')}{skipped && !pass ? ` · ${t('prepSkipped')}` : ''}</div>
    <div className="zj-flow-actions">{pass ? <>
      <Button primary disabled={busy} onClick={onContinue}>{t('prepContinue')}</Button>
      <Button quiet disabled={busy || open} onClick={onRevise}>{t('prepReviseAgain')}</Button>
    </> : <>
      <Button primary disabled={busy || open} onClick={onRevise}>{t('prepRevise')}</Button>
      <Button disabled={busy || open} onClick={onEdit}>{t('prepEditSelf')}</Button>
      <Button quiet disabled={busy} onClick={skipped ? onContinue : onSkip}>{t(skipped ? 'prepContinue' : 'prepSkipScore')}</Button>
    </>}</div>
  </>;

  return <section className="zj-sec is-score" data-step="score" aria-label={t('prepScoreStep')} ref={section}>
    <div className={`zj-axis${pass || skipped ? ' is-lit' : ''}`} aria-hidden="true"/>
    <Dial total={scoring ? null : total} busy={scoring} t={t}/>
    <div className={`zj-side is-l${ready ? '' : ' is-quiet'}`}><div className="zj-block zj-reveal">
      <h2>{t('prepFitTitle')}</h2><p className="zj-block-note">{t('prepFitNote')}</p>
      <Criteria kind="fit" assessment={score.fit} busy={scoring && !score.fit} t={t}/>
    </div></div>
    <div className={`zj-side is-r${ready ? '' : ' is-quiet'}`}><div className="zj-block zj-reveal">
      <h2>{t('prepResumeTitle')}</h2><p className="zj-block-note">{t('prepResumeNote')}</p>
      <Criteria kind="resume" assessment={score.resume} busy={scoring && !score.resume} t={t}/>
    </div></div>
    <div className="zj-bar zj-reveal">
      <div className="zj-fade" key={`${status}:${total}:${scoring}`}>{verdict}</div>
      {failure && !scoring && <div className="zj-bar-note" role="alert"><span>{failure}</span></div>}
    </div>
    {working === 'revise' && !panel && <div className="zj-revise zj-fade" data-panel="" role="status"><p className="zj-revise-head" style={{ margin: 0 }}>{t('prepRevising')}</p></div>}
    {panel?.kind === 'rewrite' && <RewritePanel rewrite={panel.rewrite} selected={panel.selected} busy={busy}
      onToggle={(id, on) => onPanel({ ...panel, selected: on ? [...new Set([...panel.selected, id])] : panel.selected.filter(item => item !== id) })}
      onApply={onApply} onClose={() => onPanel(null)} t={t}/>}
    {panel?.kind === 'edit' && <EditPanel text={panel.text} busy={busy} onChange={text => onPanel({ ...panel, text })} onSave={onSave} onClose={() => onPanel(null)} t={t}/>}
  </section>;
}

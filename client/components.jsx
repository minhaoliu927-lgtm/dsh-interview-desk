import React from 'react';
export const TaskCancelContext = React.createContext(null);

export function Mark({ size = 22 }) {
  const plane = 'M22 6H38C42.8 6 45.8 7.4 48 10L10 48C7.4 45.8 6 42.8 6 38V22C6 11.8 11.8 6 22 6Z';
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor" style={{ color: 'var(--dsw-alias-label-primary, #212523)', flexShrink: 0 }} aria-hidden="true" focusable="false"><path d={plane}/><path d={plane} transform="rotate(180 32 32)"/></svg>;
}

export function Button({ children, primary, small, quiet, ...props }) {
  return <button type="button" className={`zj-btn${primary ? ' primary' : ''}${small ? ' small' : ''}${quiet ? ' quiet' : ''}`} {...props}>{children}</button>;
}

export function Modal({ title, children, onClose, t, busy = false }) {
  const task = React.useContext(TaskCancelContext);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const previous = document.activeElement;
    (ref.current?.querySelector('input,textarea,select') || ref.current?.querySelector('button'))?.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  const keydown = event => {
    if (event.key === 'Escape') { event.preventDefault(); if (!busy) onClose(); }
    if (event.key !== 'Tab') return;
    const controls = [...ref.current.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const titleId = React.useId();
  return <div className="zj-modal" onKeyDown={keydown}><section ref={ref} className="zj-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
    <div className="zj-dialog-head"><h2 id={titleId}>{title}</h2>{busy && task?.canCancel && <Button small onClick={() => { void task.cancel?.(); }}>{t('cancelTask')}</Button>}<Button quiet disabled={busy} onClick={onClose}>{t('close')}</Button></div>{children}
  </section></div>;
}

/** Keyboard behaviour shared by dialogs and side sheets: Escape closes, Tab stays inside. */
function useTrap(ref, onClose, busy) {
  React.useEffect(() => {
    const previous = document.activeElement;
    (ref.current?.querySelector('[data-autofocus]') || ref.current?.querySelector('input,textarea,select') || ref.current?.querySelector('button'))?.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  return event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (!busy) onClose(); }
    if (event.key !== 'Tab') return;
    const controls = [...ref.current.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
}

const CloseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>;

/** A panel that slides in from the right over the page. Clicking outside closes it. */
export function Sheet({ title, children, onClose, t, busy = false, wide = false }) {
  const ref = React.useRef(null);
  const keydown = useTrap(ref, onClose, busy);
  const titleId = React.useId();
  return <div className="zj-scrim is-side" onKeyDown={keydown} onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={ref} className={`zj-sheet${wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="zj-sheet-head"><h2 id={titleId}>{title}</h2><button type="button" className="zj-icon-btn" aria-label={t('close')} disabled={busy} onClick={onClose}><CloseIcon/></button></header>
      <div className="zj-sheet-body">{children}</div>
    </section>
  </div>;
}

/** A centred window, used for settings. */
export function Window({ title, children, onClose, t, busy = false, footer = null }) {
  const ref = React.useRef(null);
  const keydown = useTrap(ref, onClose, busy);
  const titleId = React.useId();
  return <div className="zj-scrim" onKeyDown={keydown} onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={ref} className="zj-window" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="zj-window-head"><h2 id={titleId}>{title}</h2><button type="button" className="zj-icon-btn" aria-label={t('close')} onClick={onClose}><CloseIcon/></button></header>
      <div className="zj-window-body">{children}</div>
      {footer && <footer className="zj-window-foot">{footer}</footer>}
    </section>
  </div>;
}

export function Tabs({ values, active, onChange, t }) {
  const navigate = event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const current = values.indexOf(active);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? values.length - 1 : (current + (event.key === 'ArrowLeft' ? -1 : 1) + values.length) % values.length;
    onChange(values[index]);
    event.currentTarget.querySelectorAll('[role="tab"]')[index]?.focus();
  };
  return <div className="zj-tabs" role="tablist" onKeyDown={navigate}>{values.map(value => <button type="button" key={value} role="tab" aria-selected={active === value} tabIndex={active === value ? 0 : -1} className={active === value ? 'is-active' : ''} onClick={() => onChange(value)}>{t(value)}</button>)}</div>;
}

export function FormFooter({ t, busy, disabled = false, onClose, submit = 'save', saving = false }) {
  return <div className="zj-dialog-foot"><Button disabled={saving} onClick={onClose}>{t('cancel')}</Button><Button type="submit" primary disabled={busy || disabled}>{t(busy ? 'processing' : submit)}</Button></div>;
}

/** A version imported from a file the user uploaded (not pasted, edited or rewritten text). */
export function hasOriginalFile(version) {
  const source = version?.source;
  return Boolean(source?.originalFileId && source?.metadataFileId && String(source.inputKind || '').startsWith('uploaded-'));
}

const FILE_KINDS = { 'application/pdf': ['PDF', 'deskFileKindPdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['DOCX', 'deskFileKindDocx'],
  'image/png': ['PNG', 'deskFileKindImage'], 'image/jpeg': ['JPG', 'deskFileKindImage'], 'text/plain': ['TXT', 'deskFileKindText'] };

/**
 * The uploaded file itself, not the text read from it. Preview opens the
 * original; it is a read, so it stays available while other work runs.
 */
export function OriginalFile({ entry, t, onPreview, children }) {
  const { material, version } = entry;
  const [state, setState] = React.useState('idle');
  const alive = React.useRef(true);
  React.useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const [badge, kind] = FILE_KINDS[version.source?.mime] || ['FILE', 'deskFileKindOther'];
  const pages = Number.isInteger(version.source?.pageCount) && version.source.pageCount > 0 ? t('deskFilePages', { count: version.source.pageCount }) : null;
  const preview = async () => {
    if (!onPreview || state === 'opening') return;
    setState('opening');
    try { await onPreview(version.id); if (alive.current) setState('idle'); }
    catch { if (alive.current) setState('failed'); }
  };
  return <div className={`zj-doc zj-file${version.confirmed ? ' is-confirmed' : ''}`} data-original-file="">
    <div className="zj-file-row"><span className="zj-file-badge" aria-hidden="true">{badge}</span>
      <div className="zj-file-name"><strong>{material.title}</strong><span className="zj-hint">{pages || t(kind)}</span></div>
      {onPreview && <Button small onClick={() => { void preview(); }} disabled={state === 'opening'}>{t(state === 'opening' ? 'deskFileOpening' : 'deskFilePreview')}</Button>}</div>
    {state === 'failed' && <p className="zj-hint is-warn" role="status">{t('deskFileOpenFailed')}</p>}
    {children}
  </div>;
}

// Lock synchronously: two clicks can arrive before React renders disabled controls.
export function createSubmissionGuard() {
  let pending = false;
  return async operation => {
    if (pending) return undefined;
    pending = true;
    try { return await operation(); } finally { pending = false; }
  };
}

export function useFormDraft(initialValue, draft, onDraftChange) {
  const [local, setLocal] = React.useState(() => draft || initialValue);
  const value = draft || local;
  return [value, patch => { const next = { ...value, ...patch }; setLocal(next); onDraftChange?.(next); }];
}

export function MaterialForm({ t, busy, onClose, onSave, onUpload, material, version, initialKind = 'resume', draft, onDraftChange, saving = false }) {
  const [{ mode, kind, title, text, url, file }, update] = useFormDraft({ mode: 'paste', kind: material?.kind || initialKind,
    title: material?.title || '', text: version?.text || '', url: '', file: null }, draft, onDraftChange);
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    if (material) await onSave('material.update', { materialId: material.id, title, text });
    else if (mode === 'paste') await onSave('material.add', { title, kind, text });
    else if (mode === 'url') await onSave('material.fetch', { title, kind, url });
    else if (file) await onUpload(file, { title, kind });
  };
  return <Modal title={t(material ? 'newVersion' : 'addMaterial')} onClose={onClose} t={t} busy={saving}>
    {!material && <Tabs values={['paste', 'file', 'url']} active={mode} onChange={mode => { if (!saving) update({ mode }); }} t={t}/>}
    <form className="zj-form" onSubmit={submit}>
      <div className="zj-inline-fields"><label>{t('title')}<input required disabled={saving} maxLength={160} value={title} onChange={e => update({ title: e.target.value })}/></label>
        <label>{t('kind')}<select value={kind} onChange={e => update({ kind: e.target.value })} disabled={saving || Boolean(material)}>{['resume','job','company','experience'].map(value => <option key={value} value={value}>{t(value === 'company' ? 'companyMaterial' : value)}</option>)}</select></label></div>
      {mode === 'paste' && <label>{t('content')}<textarea required disabled={saving} rows={12} maxLength={200000} value={text} onChange={e => update({ text: e.target.value })}/></label>}
      {mode === 'url' && <label>{t('sourceUrl')}<input required disabled={saving} type="url" value={url} onChange={e => update({ url: e.target.value })}/></label>}
      {mode === 'file' && <label>{t('chooseFile')}<input required={!file} disabled={saving} type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" onChange={e => { const selected = e.target.files?.[0]; if (selected) update({ file: selected }); }}/>{file && <span>{file.name}</span>}<span>{t('fileHelp')}</span></label>}
      <FormFooter t={t} busy={busy} saving={saving} onClose={onClose} submit={material ? 'newVersion' : mode === 'url' ? 'fetch' : mode === 'file' ? 'import' : 'save'}/>
    </form>
  </Modal>;
}

export function GoalForm({ t, busy, onClose, onSave, draft, onDraftChange, saving = false, editing = false }) {
  const [{ title, company, description }, update] = useFormDraft({ title: '', company: '', description: '' }, draft, onDraftChange);
  return <Modal title={t(editing ? 'deskEditGoal' : 'newGoal')} onClose={onClose} t={t} busy={saving}><form className="zj-form" onSubmit={event => { event.preventDefault(); if (!busy) void onSave({ title, company, description }); }}>
    <label>{t('title')}<input required disabled={saving} maxLength={160} value={title} onChange={e => update({ title: e.target.value })}/></label>
    <label>{t('company')}<input disabled={saving} maxLength={160} value={company} onChange={e => update({ company: e.target.value })}/></label>
    <label>{t('description')}<textarea disabled={saving} value={description} onChange={e => update({ description: e.target.value })} rows={4}/></label>
    <FormFooter t={t} busy={busy} saving={saving} onClose={onClose} submit={editing ? 'save' : 'create'}/>
  </form></Modal>;
}

export function MaterialPicker({ t, state, busy, onClose, onSelect, resumesOnly = false }) {
  const entries = state.materials.filter(row => !resumesOnly || row.kind === 'resume').flatMap(material => material.versions.filter(version => version.confirmed).map(version => ({ material, version })));
  return <Modal title={t('selectMaterial')} onClose={onClose} t={t}>{entries.length ? entries.map(({ material, version }) => <div className="zj-attach" key={version.id}>
    <div><strong>{material.title}</strong><span className="zj-subtle">{t(material.kind === 'company' ? 'companyMaterial' : material.kind)} · {t('version', { number: version.revision })}</span></div>
    <Button small disabled={busy} onClick={() => onSelect(version.id)}>{t('link')}</Button>
  </div>) : <p className="zj-subtle">{t('noConfirmed')}</p>}</Modal>;
}

export function textOf(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (!value) return '';
  return value.text || value.quote || value.reason || value.message || value.suggestion || value.label || value.name || '';
}

export function Lines({ values = [] }) {
  const lines = values.map(textOf).filter(Boolean);
  return lines.length ? <ul className="zj-list">{lines.map((line, i) => <li key={`${i}-${line}`}>{line}</li>)}</ul> : null;
}

export function EvidenceList({ values = [], onEvidence, t }) {
  return <div className="zj-evidence">{values.map((citation, index) => <button type="button" key={`${citation.sourceId}-${index}`} onClick={() => onEvidence(citation)}><span>{t('evidence')}</span>{citation.quote}</button>)}</div>;
}

export function Evaluation({ result, t, onEvidence }) {
  if (!result) return <p className="zj-subtle">{t('noAssessment')}</p>;
  return <section className="zj-card">
    {typeof result.total === 'number' ? <span className="zj-score">{result.total}<small>/ 100</small></span> : <p className="zj-status-line">{t('insufficient')}</p>}
    {result.summary && <p>{result.summary}</p>}
    {(result.criteria || []).map((item, i) => <div className="zj-criterion" key={item.id || i}>
      <div className="zj-criterion-head"><span>{item.name || item.label || item.dimension || item.id}</span><span>{typeof item.score === 'number' ? item.score : ''}</span></div>
      {item.reason && <p>{item.reason}</p>}{onEvidence ? <EvidenceList values={item.evidence || []} onEvidence={onEvidence} t={t}/> : <Lines values={item.evidence || []}/>}
    </div>)}
    {result.suggestions?.length > 0 && <><h3>{t('suggestions')}</h3>{result.suggestions.map((item, i) => <div key={i}><p>{textOf(item)}</p>{onEvidence && <EvidenceList values={item.evidence || []} onEvidence={onEvidence} t={t}/>}</div>)}</>}
  </section>;
}

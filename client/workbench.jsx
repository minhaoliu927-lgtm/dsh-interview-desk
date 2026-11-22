import React from 'react';
import css from './styles.css';
import deskCss from './desk-styles.css';
import shellCss from './css/shell.css';
import flowCss from './css/flow.css';
import roomCss from './css/room.css';
import scoreCss from './css/score.css';
import desk10Css from './css/desk.css';
import { Prepare, initialPrepareDraft } from './prepare.jsx';
import { Button, GoalForm, Mark, MaterialForm, MaterialPicker, Modal, TaskCancelContext, createSubmissionGuard } from './components.jsx';
import { Interview } from './interview.jsx';
import { NativeChat } from './native-chat.jsx';
import { citationSource, quoteSegments, versionEntry } from './model.js';
import { SourceDialog } from './source.jsx';
import { TaskCard, ReceiptList, receiptLabel } from './task-card.jsx';
import { materialChatContext, contextDraft } from './desk-context.js';
import { SettingsDialog } from './settings-dialog.jsx';
import { ReviewPage } from './review-page.jsx';
import { LibraryPage } from './library-page.jsx';
import { HomePage } from './home-page.jsx';
import { DESK_PAGES, deskNavigation, initialDesk } from './desk-nav.js';
import { realtimeUnavailable } from './voice/realtime-call.js';

export { deskNavigation, initialDesk } from './desk-nav.js';

const PAGE_LABELS = { home: 'navHome', interview: 'navInterview', review: 'navReview', library: 'navLibrary' };
const ERRORS = new Set(['NATIVE_DRAFT_UNAVAILABLE', 'NATIVE_DRAFT_BLOCKED', 'CONTEXT_UNAVAILABLE', 'NETWORK', 'FILE_TOO_LARGE', 'JOB_MATERIAL_REQUIRED', 'INVALID_RESPONSE', 'REQUEST_FAILED', 'EXPORT_FAILED', 'WORKSPACE_REQUIRED']);
const newest = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''));

const Gear = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
const Bubble = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>;
const Close = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>;

/** Whether the voice interview service is configured. Rechecked when the panel becomes visible again. */
export function useVoiceStatus(realtimeApi) {
  const [catalog, setCatalog] = React.useState(null), [checking, setChecking] = React.useState(false);
  const alive = React.useRef(true);
  const check = React.useCallback(async () => {
    if (typeof realtimeApi?.catalog !== 'function') return;
    setChecking(true);
    try { const result = await realtimeApi.catalog(); if (alive.current) setCatalog(result); }
    catch { if (alive.current) setCatalog(null); }
    finally { if (alive.current) setChecking(false); }
  }, [realtimeApi]);
  React.useEffect(() => { alive.current = true; void check(); return () => { alive.current = false; }; }, [check]);
  React.useEffect(() => {
    const view = globalThis.document;
    if (!view?.addEventListener) return undefined;
    const onVisible = () => { if (!view.hidden) void check(); };
    view.addEventListener('visibilitychange', onVisible);
    return () => view.removeEventListener('visibilitychange', onVisible);
  }, [check]);
  return { catalog, checking, check, ready: Boolean(catalog) && !realtimeUnavailable(catalog) };
}

export function App({ t, useCareer, useNativeSessions, useWorkspaceChoices, action, upload, refresh, cancelCurrent, retryCurrent, createConversation, startInterview, interviewAction, download,
  voiceApi, realtimeApi, prepareChatDraft, enableVoiceInput, openVoiceSettings, openWorkspaceManager, readSource, loadOriginal, downloadOriginal, useResource, SessionProvider, renderSlot,
  useRealtimeSettings, settingsActions = {}, initialPage }) {
  const snapshot = useCareer(value => value);
  const state = snapshot.data;
  const [nav, navigate] = React.useReducer(deskNavigation, initialPage, initialDesk);
  const navRef = React.useRef(nav); navRef.current = nav;
  const drafts = nav.drafts;
  const saveDraft = (key, value) => navigate({ type: 'draft', key, value });
  const voice = useVoiceStatus(realtimeApi);
  const [narrow, setNarrow] = React.useState(false);
  const [modal, setModal] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [localPending, setLocalPending] = React.useState(0);
  const [context, setContext] = React.useState(null);
  const [contextNotice, setContextNotice] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const rootRef = React.useRef(null), toastTimer = React.useRef(null);
  const submissionGuard = React.useRef(null);
  if (!submissionGuard.current) submissionGuard.current = createSubmissionGuard();
  const currentModal = React.useRef(modal); currentModal.current = modal;

  React.useEffect(() => {
    if (!rootRef.current || typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 1100));
    observer.observe(rootRef.current); return () => observer.disconnect();
  }, []);
  React.useEffect(() => { if (narrow) navigate({ type: 'dock', open: false }); }, [narrow]);
  React.useEffect(() => () => clearTimeout(toastTimer.current), []);
  const say = (text, receipt = null) => {
    clearTimeout(toastTimer.current);
    setToast({ text, receipt, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), receipt ? 6500 : 3800);
  };

  // Workspaces: chosen in settings; one workspace (or the one the main view already uses) is chosen for the user.
  const nativeSessions = useNativeSessions(value => value);
  const workspaceChoices = useWorkspaceChoices(value => value);
  const [workspaceId, setWorkspaceId] = React.useState('');
  const mainSessions = nativeSessions.ids.filter(id => nativeSessions.byId[id]?.retainedBy?.mainView > 0);
  const inheritedWorkspace = mainSessions.length === 1 ? workspaceChoices.items.find(row => row.sessionIds.includes(mainSessions[0])) : undefined;
  const selectedWorkspace = workspaceChoices.items.find(row => row.workspaceId === workspaceId)
    || (!workspaceId ? inheritedWorkspace || (workspaceChoices.items.length === 1 ? workspaceChoices.items[0] : undefined) : undefined);
  const restoreWorkspace = id => { const workspace = workspaceChoices.items.find(row => row.sessionIds.includes(id)); if (workspace) setWorkspaceId(workspace.workspaceId); };

  // The interview page keeps its own draft; until the user edits it, it starts from the newest role and resume.
  const prepareDraft = drafts.prepare ?? (snapshot.ready ? initialPrepareDraft(state) : undefined);
  const conversations = state.conversations || state.goals.flatMap(row => row.conversations);
  const chats = conversations.filter(row => row.kind !== 'interview').sort(newest);
  const unfinished = [...state.interviews].filter(row => row.status !== 'completed' && row.sessionId && row.goalId && row.goalId === prepareDraft?.goalId).sort(newest)[0] || null;
  const roomInterview = nav.room ? state.interviews.find(row => row.sessionId === nav.room) : null;
  const dockSession = nav.room ? (roomInterview?.mode === 'text' ? nav.room : null)
    : nav.sessionId || chats.find(row => row.goalId && row.goalId === prepareDraft?.goalId)?.sessionId || chats[0]?.sessionId || null;
  const dockConversation = conversations.find(row => row.sessionId === dockSession);
  const conversationTitle = row => nativeSessions.byId[row.sessionId]?.title || row.title;
  const sessionWorkspace = workspaceChoices.items.find(row => row.sessionIds.includes(dockSession));
  const nativeRunning = Boolean(nativeSessions.byId[dockSession]?.running);
  const busy = localPending > 0 || snapshot.pending > 0 || nativeRunning;
  const currentError = error || snapshot.error;
  React.useEffect(() => { setContext(value => value?.sessionId === dockSession ? value : null); setContextNotice(null); }, [dockSession]);

  const run = (operation, success) => submissionGuard.current(async () => {
    setError(null);
    setLocalPending(count => count + 1);
    try { const result = await operation(); success?.(result); return result; }
    catch (reason) { if (reason?.name !== 'AbortError' && !['CANCELLED', 'ABORT_ERR'].includes(reason?.code)) setError(reason); return undefined; }
    finally { setLocalPending(count => Math.max(0, count - 1)); }
  });
  const perform = (name, input) => run(() => action(name, input));
  const performInterview = (name, input) => run(() => interviewAction(name, input));
  const exportFile = (kind, id, format) => run(() => download(kind, id, format));
  const openSettings = () => { navigate({ type: 'settings', open: true }); return true; };
  const manageWorkspaces = () => run(async () => { if (!openWorkspaceManager?.()) throw new Error(t('unavailable')); });
  const needWorkspace = () => { setError({ code: 'WORKSPACE_REQUIRED' }); openSettings(); };

  // New undoable saves announce themselves once, with the undo next to the message.
  const undoReceipt = receipt => run(() => action('receipt.undo', { receiptId: receipt.id }));
  const newestUndo = (state.receipts || []).find(row => row.undo?.available);
  const seenUndo = React.useRef(undefined);
  React.useEffect(() => {
    if (!snapshot.ready) return;
    if (seenUndo.current === undefined) { seenUndo.current = newestUndo?.id ?? null; return; }
    if (newestUndo && newestUndo.id !== seenUndo.current) say(t(receiptLabel(newestUndo.action)), newestUndo);
    seenUndo.current = newestUndo?.id ?? null;
  }, [snapshot.ready, newestUndo?.id]);
  React.useEffect(() => {
    const onKey = event => {
      if (!rootRef.current?.contains(event.target) || modal || nav.settings) return;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey && !typing && newestUndo && !busy) { event.preventDefault(); void undoReceipt(newestUndo); }
    };
    const root = rootRef.current; root?.addEventListener('keydown', onKey); return () => root?.removeEventListener('keydown', onKey);
  }, [modal, nav.settings, newestUndo?.id, busy]);

  const enterRoom = sessionId => { if (!sessionId) return; restoreWorkspace(sessionId); navigate({ type: 'room', sessionId }); };
  const startPrepared = input => {
    if (!selectedWorkspace) { needWorkspace(); return Promise.resolve(undefined); }
    return run(() => startInterview({ ...input, workspaceId: selectedWorkspace.workspaceId }), result => { if (result?.sessionId) enterRoom(result.sessionId); void refresh?.(); });
  };
  const leaveRoom = () => { navigate({ type: 'leaveRoom' }); void refresh?.(); };

  const newChat = goalId => {
    if (!selectedWorkspace) { needWorkspace(); return; }
    const resumeVersion = versionEntry(state, prepareDraft?.resumeVersionId);
    const versionId = resumeVersion?.material.kind === 'resume' && resumeVersion.version.confirmed ? resumeVersion.version.id : undefined;
    return run(() => createConversation(goalId || null, t('untitledChat'), versionId, selectedWorkspace.workspaceId), row => navigate({ type: 'session', sessionId: row.sessionId }));
  };
  const askContext = (id, passage) => {
    const selected = materialChatContext(state, id, passage);
    if (!selected) { setError({ code: 'CONTEXT_UNAVAILABLE' }); return; }
    if (!dockSession && !selectedWorkspace) { needWorkspace(); return; }
    const scope = navRef.current;
    return run(async () => {
      let target = nav.room ? null : dockSession;
      if (!target) {
        const row = await createConversation(prepareDraft?.goalId || null, t('untitledChat'), selected.kind === 'resume' ? id : undefined, selectedWorkspace.workspaceId);
        target = row.sessionId;
      }
      if (navRef.current.page !== scope.page || navRef.current.room !== scope.room) return;
      navigate({ type: 'session', sessionId: target });
      setContextNotice(null); setContext({ ...selected, sessionId: target });
    });
  };
  const addContextDraft = () => {
    const selected = context;
    if (!selected || selected.sessionId !== dockSession) return;
    return run(async () => {
      if (!prepareChatDraft) throw Object.assign(new Error(t('unavailable')), { code: 'NATIVE_DRAFT_UNAVAILABLE' });
      await prepareChatDraft(selected.sessionId, contextDraft(selected, t));
      setContext(value => value === selected ? null : value);
      setContextNotice(t('contextAdded'));
    });
  };
  const prepareSuggestion = key => {
    if (!dockSession && !selectedWorkspace) { needWorkspace(); return; }
    return run(async () => {
      let target = dockSession;
      if (!target) target = (await createConversation(prepareDraft?.goalId || null, t('untitledChat'), undefined, selectedWorkspace.workspaceId)).sessionId;
      if (!prepareChatDraft) throw Object.assign(new Error(t('unavailable')), { code: 'NATIVE_DRAFT_UNAVAILABLE' });
      await prepareChatDraft(target, t(key));
      navigate({ type: 'session', sessionId: target }); setContextNotice(t('contextAdded'));
    });
  };

  const addMaterial = (kind = 'resume', goalId = null) => setModal({ kind: 'material', initialKind: kind, goalId });
  const materialSaved = material => {
    const opened = currentModal.current;
    saveDraft(materialKey(opened), undefined);
    if (opened?.goalId && material?.latestVersionId) void perform('goal.linkMaterial', { goalId: opened.goalId, versionId: material.latestVersionId });
    if (currentModal.current === opened) { setModal(null); navigate({ type: 'open', page: 'library', target: { kind: 'material', id: material.id, versionId: material.latestVersionId } }); }
  };
  const confirmVersion = versionId => perform('material.confirm', { versionId });
  const reviewVersion = versionId => { const entry = versionEntry(state, versionId); if (entry) navigate({ type: 'open', page: 'library', target: { kind: 'material', id: entry.material.id, versionId } }); };
  const showEvidence = citation => setModal({ kind: 'citation', citation });
  const useRole = goal => {
    const job = (goal.materialLinks || []).map(link => versionEntry(state, link.versionId)).filter(entry => entry?.material.kind === 'job' && entry.version.confirmed)
      .sort((a, b) => b.version.revision - a.version.revision)[0];
    saveDraft('prepare', { ...(prepareDraft || {}), role: goal.title || '', goalId: goal.id, jobVersionId: job?.version.id || null, scoreSkippedFor: null });
    navigate({ type: 'page', page: 'interview' });
  };
  // Receipts and finished tasks point at what they made; open it where it lives.
  const openTarget = target => {
    if (!target) return;
    if (target.kind === 'material') navigate({ type: 'open', page: 'library', target: { kind: 'material', id: target.id, versionId: target.versionId } });
    else if (target.kind === 'goal') navigate({ type: 'open', page: 'library', target: { kind: 'goal', id: target.id } });
    else if (target.kind === 'interview') enterRoom(state.interviews.find(row => row.id === target.id)?.sessionId);
    else if (['report', 'assessment', 'rewrite'].includes(target.kind)) navigate({ type: 'open', page: 'review', target: { kind: target.kind, id: target.id } });
  };
  const source = modal?.kind === 'citation' ? citationSource(state, modal.citation.sourceId) : null;
  const segments = source ? quoteSegments(source.text, modal.citation) : null;
  const linkGoal = modal?.kind === 'linkMaterial' ? state.goals.find(row => row.id === modal.goalId) : null;

  const inRoom = Boolean(nav.room);
  const showDock = nav.dock && (!inRoom || roomInterview?.mode === 'text');
  const nativeChat = dockSession ? (sessionWorkspace ? <NativeChat key={dockSession} sessionId={dockSession} t={t} useResource={useResource} SessionProvider={SessionProvider} renderSlot={renderSlot}/>
    : <p className="zj-hint zj-dock-note">{workspaceChoices.phase === 'ready' ? t('floatingConversation') : t('loading')}</p>) : null;

  const topbar = <header className="zj-top">
    <span className="zj-wordmark"><Mark size={18}/><span>{t('panel')}</span></span>
    {inRoom ? <div className="zj-top-space"/> : <><nav className="zj-tabs-nav" aria-label={t('navLabel')}>{DESK_PAGES.map(page => <button type="button" key={page} aria-current={nav.page === page ? 'page' : undefined}
      className={nav.page === page ? 'is-on' : ''} onClick={() => navigate({ type: 'page', page })}>{t(PAGE_LABELS[page])}</button>)}</nav><div className="zj-top-space"/></>}
    <button type="button" className={`zj-chip${voice.ready ? ' is-ok' : ''}`} title={t('voiceChipTitle')} onClick={openSettings}><span className="zj-dot" aria-hidden="true"/>
      {t(voice.ready ? 'voiceChipReady' : voice.checking && !voice.catalog ? 'voiceChipChecking' : 'voiceChipNone')}</button>
    <button type="button" className="zj-icon-btn is-glass" aria-label={t('openSettings')} title={t('openSettings')} onClick={openSettings}><Gear/></button>
    {(!inRoom || roomInterview?.mode === 'text') && <button type="button" className="zj-chip" aria-pressed={showDock} onClick={() => navigate({ type: 'dock' })}><Bubble/>{t('assistantToggle')}</button>}
    {inRoom && <Button small onClick={leaveRoom} title={t('roomBackTitle')}>{t('roomBack')}</Button>}
  </header>;

  let page;
  if (!snapshot.ready) page = <div className="zj-page"><p className="zj-hint">{t('loading')}</p></div>;
  else if (inRoom) page = roomInterview ? <Interview key={roomInterview.id} state={state} interview={roomInterview} t={t} busy={busy} onAction={performInterview} onExport={exportFile} voiceApi={voiceApi} realtimeApi={realtimeApi}
    openRealtimeSettings={openSettings} onChanged={refresh} nativeChat={null} onEvidence={showEvidence}
    answerDraft={drafts[`answer:${roomInterview.id}:${roomInterview.currentQuestionId}`]} onAnswerDraftChange={value => saveDraft(`answer:${roomInterview.id}:${roomInterview.currentQuestionId}`, value)}/>
    : <div className="zj-page"><p className="zj-hint" role="status">{t('interviewWaiting')}</p></div>;
  else if (nav.page === 'home') page = <HomePage t={t} state={state} draft={prepareDraft} busy={busy} voiceReady={voice.ready} voiceChecking={voice.checking}
    workspaceReady={Boolean(selectedWorkspace)} nativeTitles={nativeSessions.byId} onPrepare={sheet => navigate({ type: 'page', page: 'interview', sheet })}
    onUseRole={useRole} onEnterRoom={enterRoom} onPage={target => navigate({ type: 'page', page: target })} onOpenSettings={openSettings}/>;
  else if (nav.page === 'review') page = <ReviewPage t={t} state={state} nativeTitles={nativeSessions.byId} open={nav.open} onOpen={target => navigate({ type: 'open', target })} onClose={() => navigate({ type: 'close' })}
    onEnterRoom={enterRoom} busy={busy} onExport={exportFile} onEvidence={showEvidence} onAction={perform} onReviewVersion={reviewVersion} drafts={drafts} onDraft={saveDraft}/>;
  else if (nav.page === 'library') page = <LibraryPage t={t} state={state} open={nav.open} onOpen={target => navigate({ type: 'open', target })} onClose={() => navigate({ type: 'close' })} busy={busy}
    onAddMaterial={addMaterial} onEditMaterial={(material, version) => setModal({ kind: 'material', material, version })} onConfirm={confirmVersion} onExport={exportFile}
    onAssess={id => perform('assessment.run', { kind: 'resume', versionId: id })} onEvidence={showEvidence} onSource={id => run(() => readSource(id), data => setModal({ kind: 'source', data }))}
    onChatContext={askContext} onAction={perform} onReviewVersion={reviewVersion} onEditGoal={goal => setModal({ kind: 'editGoal', goal })} onLinkMaterial={goal => setModal({ kind: 'linkMaterial', goalId: goal.id })}
    onUseRole={useRole} drafts={drafts} onDraft={saveDraft}/>;
  else page = <Prepare t={t} state={state} busy={busy} draft={prepareDraft} onDraftChange={value => saveDraft('prepare', value)}
    action={perform} task={operation => run(() => operation(action))} upload={(file, metadata) => run(() => upload(file, metadata))} startInterview={startPrepared}
    unfinished={unfinished} onContinue={enterRoom}
    sheet={nav.sheet} onSheet={sheet => navigate({ type: 'sheet', sheet })} voiceReady={voice.ready} voiceChecking={voice.checking} workspaceReady={Boolean(selectedWorkspace)} onOpenSettings={openSettings}/>;

  return <TaskCancelContext.Provider value={{ canCancel: Boolean(snapshot.operation?.canCancel), cancel: () => cancelCurrent?.(snapshot.operation?.requestId) }}>
    <div className={`zj zj-desk${narrow ? ' zj-narrow' : ''}${inRoom ? ' is-room' : ''}`} ref={rootRef} data-zhijing-workbench="" data-screen={inRoom ? 'room' : nav.page}>
      <style>{css + deskCss + shellCss + flowCss + scoreCss + roomCss + desk10Css}</style>
      <div className="zj-ambient" aria-hidden="true"><i/><i/><i/></div>
      <section className="zj-main">
        {topbar}
        {(busy || snapshot.loading) && <div className="zj-progress" role="progressbar" aria-label={t('processing')}/>}
        {!inRoom && snapshot.operation?.status !== 'succeeded' && <TaskCard operation={snapshot.operation} onCancel={cancelCurrent} onRetry={() => run(() => retryCurrent?.())} onOpen={openTarget} t={t}/>}
        {currentError && <div className="zj-error" role="alert"><strong>{t('errorTitle')}</strong><span>{ERRORS.has(currentError.code) ? t(`error_${currentError.code}`) : currentError.message || t('error_REQUEST_FAILED')}</span>
          <Button quiet small onClick={() => { setError(null); void refresh(); }}>{t('retry')}</Button></div>}
        <div className={`zj-scroll${inRoom ? ' is-room' : ''}`} key={inRoom ? `room:${nav.room}` : nav.page}>{page}</div>
      </section>
      {showDock && <aside className="zj-dock" aria-label={t('assistant')}>
        <header className="zj-dock-head"><strong>{t('assistant')}</strong><span className="zj-hint">{t('assistantSame')}</span><div className="zj-top-space"/>
          <button type="button" className="zj-icon-btn" aria-label={t('hideAssistant')} onClick={() => navigate({ type: 'dock', open: false })}><Close/></button></header>
        {!inRoom && <div className="zj-dock-bar">{chats.length > 1 && <select className="zj-input is-small" aria-label={t('assistantPick')} value={dockSession || ''} onChange={event => { restoreWorkspace(event.target.value); navigate({ type: 'session', sessionId: event.target.value }); }}>
          {chats.map(row => <option key={row.sessionId} value={row.sessionId}>{conversationTitle(row)}</option>)}</select>}
          {chats.length === 1 && dockConversation && <span className="zj-hint">{conversationTitle(dockConversation)}</span>}
          {chats.length > 0 && <Button small quiet disabled={busy} onClick={() => newChat(prepareDraft?.goalId)}>{t('newChat')}</Button>}</div>}
        {context && context.sessionId === dockSession && <section className="zj-context-preview" aria-label={t('selectedContext')}><div className="zj-page-heading"><strong>{context.title} · {t('version', { number: context.revision })}</strong>
          <Button small quiet disabled={busy} onClick={() => setContext(null)}>{t('cancelContext')}</Button></div><details><summary>{t('previewContext')}</summary><pre>{context.text}</pre></details>
          <p className="zj-hint">{t('contextPreviewNote')}</p><Button small primary disabled={busy} onClick={addContextDraft}>{t('addToChatDraft')}</Button></section>}
        {contextNotice && <p className="zj-context-notice" role="status">{contextNotice}</p>}
        {!inRoom && <ReceiptList receipts={state.receipts} onOpen={openTarget} onUndo={undoReceipt} busy={busy} t={t}/>}
        <div className="zj-dock-chat">{nativeChat || <div className="zj-assistant-empty"><p>{t('assistantEmpty')}</p><Button primary disabled={busy} onClick={() => newChat(prepareDraft?.goalId)}>{t('newChat')}</Button></div>}</div>
        {!inRoom && <div className="zj-suggestions">{['deskSuggestReview', 'deskSuggestPrepare'].map(key => <Button small quiet key={key} disabled={busy} onClick={() => prepareSuggestion(key)}>{t(key)}</Button>)}</div>}
      </aside>}

      {nav.settings && <SettingsDialog t={t} onClose={() => navigate({ type: 'settings', open: false })} onSaved={options => { void voice.check(); if (!options?.quiet) say(t('setSaved')); }}
        voiceReady={voice.ready} useRealtimeSettings={useRealtimeSettings} {...settingsActions}
        workspaces={workspaceChoices.items} workspaceId={selectedWorkspace?.workspaceId || ''} onWorkspace={id => { setWorkspaceId(id); setError(null); }} onManageWorkspaces={manageWorkspaces}
        enableVoiceInput={enableVoiceInput} openVoiceSettings={openVoiceSettings}/>}
      {toast && <div className="zj-toast" role="status" key={toast.key}><span>{toast.text}</span>
        {toast.receipt && <button type="button" disabled={busy} onClick={() => { const receipt = toast.receipt; setToast(null); void undoReceipt(receipt); }}>{t('deskUndo')}</button>}</div>}

      {modal?.kind === 'editGoal' && <GoalForm t={t} busy={busy} saving={localPending > 0} editing draft={drafts[`goal:${modal.goal.id}`] || modal.goal} onDraftChange={value => saveDraft(`goal:${modal.goal.id}`, value)}
        onClose={() => setModal(null)} onSave={input => run(() => action('goal.update', { goalId: modal.goal.id, ...input }), () => { saveDraft(`goal:${modal.goal.id}`, undefined); setModal(null); })}/>}
      {modal?.kind === 'material' && <MaterialForm key={materialKey(modal)} t={t} busy={busy} saving={localPending > 0} {...modal} draft={drafts[materialKey(modal)]} onDraftChange={value => saveDraft(materialKey(modal), value)}
        onClose={() => setModal(null)} onSave={(name, input) => run(() => action(name, input), materialSaved)} onUpload={(file, metadata) => run(() => upload(file, metadata), materialSaved)}/>}
      {modal?.kind === 'linkMaterial' && linkGoal && <MaterialPicker t={t} state={state} busy={busy} onClose={() => setModal(null)} onSelect={id => run(() => action('goal.linkMaterial', { goalId: linkGoal.id, versionId: id }), () => setModal(null))}/>}
      {modal?.kind === 'citation' && <Modal title={source?.title || t('evidence')} t={t} onClose={() => setModal(null)}>{source ? <>{source.revision && <p className="zj-subtle">{t('version', { number: source.revision })}</p>}
        <div className="zj-paper-content">{segments.before}{segments.quote && <mark>{segments.quote}</mark>}{segments.after}</div></> : <p className="zj-subtle">{t('unavailable')}</p>}</Modal>}
      {modal?.kind === 'source' && <SourceDialog key={modal.data.versionId} data={modal.data} t={t} onClose={() => setModal(null)} loadOriginal={loadOriginal} onDownload={id => run(() => downloadOriginal(id))}/>}
    </div>
  </TaskCancelContext.Provider>;
}

export function materialKey(modal) {
  return modal?.material ? `material:${modal.material.id}:${modal.version?.id || ''}` : `material:new:${modal?.goalId || ''}:${modal?.initialKind || 'resume'}`;
}
export const materialDraftKey = materialKey;

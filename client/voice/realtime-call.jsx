import React from 'react';
import { Button } from '../components.jsx';
import { createRealtimeCall, realtimeUnavailable } from './realtime-call.js';

export function realtimeErrorKey(state) {
  if (state.capabilityMissing) return 'realtimeConfigure';
  if (/microphone|permission|device|worklet/i.test(state.errorCode || '')) return 'realtimeMicrophoneError';
  if (state.errorCode === 'transcription-failed') return 'realtimeTranscriptError';
  if (/audio|playback|backpressure/i.test(state.errorCode || '')) return 'realtimeAudioError';
  return 'realtimeConnectionError';
}

const ACTIVE = ['listening', 'speaking', 'thinking'];
const CONNECTING = ['requesting', 'connecting'];
const PHASE_KEYS = { idle: 'realtimeIdle', requesting: 'realtimeRequesting', connecting: 'realtimeConnecting',
  listening: 'realtimeListening', speaking: 'realtimeSpeaking', thinking: 'realtimeThinking', paused: 'realtimePaused', ended: 'realtimeEnded', error: 'realtimeEnded' };

export function formatElapsed(seconds) {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const prefersCalm = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * Drives the two lights beside the axis from the call's real loudness.
 * Values go straight to CSS variables on the stage element: sixty updates a
 * second must not pass through React state.
 */
function useLevelLight(stageRef, controller, live) {
  React.useEffect(() => {
    const node = stageRef.current;
    if (!live || !node || typeof globalThis.requestAnimationFrame !== 'function') return undefined;
    let frame = 0, input = 0, output = 0;
    const ease = (from, to) => from + (to - from) * (to > from ? 0.5 : 0.1);
    const tick = () => {
      const levels = controller.current?.levels?.();
      if (levels?.available) {
        // A small floor keeps room noise from lighting the candidate's side.
        const floor = value => Math.max(0, ((value || 0) - 0.08) / 0.92);
        input = ease(input, floor(levels.input)); output = ease(output, floor(levels.output));
        node.dataset.levels = 'on';
        node.style.setProperty('--zj-level-in', input.toFixed(3));
        node.style.setProperty('--zj-level-out', output.toFixed(3));
      } else delete node.dataset.levels;
      frame = globalThis.requestAnimationFrame(tick);
    };
    frame = globalThis.requestAnimationFrame(tick);
    return () => {
      globalThis.cancelAnimationFrame(frame);
      delete node.dataset.levels;
      node.style.removeProperty('--zj-level-in'); node.style.removeProperty('--zj-level-out');
    };
  }, [stageRef, controller, live]);
}

/** A single continuous call; review and durable evidence belong to the Host. */
export function RealtimeCall({ interview, api, t, onChanged, openSettings }) {
  const [state, setState] = React.useState({ phase: 'idle', muted: false, stopping: false, checking: false,
    inputTranscript: '', outputTranscript: '', errorCode: null, capabilityMissing: false, catalog: null });
  const controller = React.useRef(null), changed = React.useRef(onChanged), stageRef = React.useRef(null);
  changed.current = onChanged;
  React.useEffect(() => {
    const owned = createRealtimeCall({ interviewId: interview.id, api, onChange: setState, onChanged: () => changed.current?.() });
    controller.current = owned;
    void owned.refreshCatalog();
    return () => { controller.current = null; void owned.dispose(); };
  }, [api, interview.id]);
  React.useEffect(() => { if (interview.status === 'completed') void controller.current?.end(); }, [interview.status]);

  const active = ACTIVE.includes(state.phase), connecting = CONNECTING.includes(state.phase);
  useLevelLight(stageRef, controller, active);

  // The countdown fills the time the microphone and connection really take.
  // It never delays the call: when it ends first, the connecting state shows.
  const [countdown, setCountdown] = React.useState(null);
  const countdownTimers = React.useRef([]);
  const clearCountdown = () => { countdownTimers.current.forEach(clearTimeout); countdownTimers.current = []; setCountdown(null); };
  React.useEffect(() => () => countdownTimers.current.forEach(clearTimeout), []);
  React.useEffect(() => { if (!active && !connecting) clearCountdown(); }, [active, connecting]);

  // Seconds spent in the live call, for the clock beside the status.
  const [elapsed, setElapsed] = React.useState(null);
  React.useEffect(() => { setElapsed(null); }, [interview.id]);
  React.useEffect(() => {
    if (!active) return undefined;
    setElapsed(value => value ?? 0);
    const timer = setInterval(() => setElapsed(value => (value ?? 0) + 1), 1000);
    return () => clearInterval(timer);
  }, [active]);

  const actions = Object.fromEntries(['setMuted', 'interrupt', 'pause', 'end', 'refreshCatalog'].map(name => [name, (...args) => controller.current?.[name](...args)]));
  actions.start = () => {
    const started = controller.current?.start();
    if (!prefersCalm()) {
      clearCountdown(); setCountdown(3);
      countdownTimers.current = [setTimeout(() => setCountdown(2), 800), setTimeout(() => setCountdown(1), 1600), setTimeout(() => setCountdown(null), 2400)];
    }
    return started;
  };
  return <RealtimeCallView interview={interview} state={state} t={t} actions={actions} openSettings={openSettings}
    stageRef={stageRef} countdown={countdown} elapsed={elapsed}/>;
}

export function RealtimeCallView({ interview, state, t, actions = {}, openSettings, stageRef, countdown = null, elapsed = null }) {
  const active = ACTIVE.includes(state.phase);
  const connecting = CONNECTING.includes(state.phase);
  const question = interview.questions?.find(row => row.id === interview.currentQuestionId)?.text || '';
  const output = state.outputTranscript || question;
  const light = active ? state.phase : connecting ? 'thinking' : 'idle';
  const settings = () => { try { openSettings?.(); } catch { /* Existing status retains the retry path. */ } };

  return <section className="zj-room zj-call" aria-label={t('realtimeCall')} aria-busy={state.stopping || connecting}>
    <header className="zj-room-bar">
      <div className="zj-room-status">
        <span className={`zj-tally${active ? ' is-live' : ''}`} aria-hidden="true"/>
        <h2 className="zj-room-phase" role="status" aria-live="polite">{t(PHASE_KEYS[state.phase] || 'realtimeIdle')}</h2>
        {elapsed !== null && <time className="zj-room-clock">{formatElapsed(elapsed)}</time>}
      </div>
      <div className="zj-actions">
        {active && <>
          <Button small onClick={() => { void actions.pause?.(); }}>{t('pause')}</Button>
          <Button small quiet onClick={() => { void actions.end?.(); }}>{t('realtimeEnd')}</Button>
        </>}
        {connecting && <Button small onClick={() => { void actions.end?.(); }}>{t('cancel')}</Button>}
      </div>
    </header>
    <div className={`zj-dip is-${light}`} ref={stageRef}>
      <div className="zj-glow is-l" aria-hidden="true"/>
      <div className="zj-glow is-r" aria-hidden="true"/>
      <div className="zj-dip-axis" aria-hidden="true"/>
      {countdown !== null && (active || connecting) && <div className="zj-count" aria-hidden="true"><span key={countdown}>{countdown}</span></div>}
      <div className="zj-pane is-l"><div className="zj-pane-block">
        <span className="zj-who">{t('realtimeInterviewer')}</span>
        {output ? <p className="zj-ask">{output}</p> : <p className="zj-ask is-quiet">{t('realtimeTranscriptHere')}</p>}
      </div></div>
      <div className="zj-pane is-r"><div className="zj-pane-block">
        <span className="zj-who">{t('realtimeYou')}</span>
        {state.inputTranscript && <p className="zj-say">{state.inputTranscript}</p>}
        {active && <div className="zj-actions">
          <Button aria-pressed={state.muted} onClick={() => actions.setMuted?.(!state.muted)}>{t(state.muted ? 'realtimeUnmute' : 'realtimeMute')}</Button>
          <Button onClick={() => { void actions.interrupt?.(); }}>{t('realtimeInterrupt')}</Button>
        </div>}
        {!active && !connecting && <>
          <p className="zj-subtle">{t('realtimeAudioNotice')}</p>
          <div className="zj-actions">
            <Button primary disabled={state.stopping || state.checking || realtimeUnavailable(state.catalog) || interview.status === 'completed'} onClick={() => { void actions.start?.(); }}>{t(state.phase === 'idle' ? 'realtimeStart' : 'realtimeReconnect')}</Button>
            <Button quiet disabled={state.stopping || !openSettings} onClick={settings}>{t('realtimeSettings')}</Button>
            <Button quiet disabled={state.stopping || state.checking} onClick={() => { void actions.refreshCatalog?.(); }}>{t('refreshVoice')}</Button>
          </div>
        </>}
        {state.muted && <p className="zj-status-line">{t('realtimeMute')}</p>}
        {(state.errorCode || state.capabilityMissing) && <p className="zj-error" role="alert">{t(realtimeErrorKey(state))}</p>}
        {(output || state.inputTranscript) && <p className="zj-subtle">{t('realtimeTranscriptNote')}</p>}
      </div></div>
    </div>
  </section>;
}

/**
 * The one place that decides what the workbench shows.
 *
 * `page` is one of four tabs; home is where the panel opens. `room` (a native session id) is the interview
 * room, the only full-screen state; it covers the page and remembers where it
 * was opened from. `open` is a single object opened inside the current page,
 * `sheet` a side sheet on the interview page, `settings` the settings window.
 * Nothing here is derived from career data, so saving data never moves the
 * user to another screen.
 */
export const DESK_PAGES = Object.freeze(['home', 'interview', 'review', 'library']);
export const SHEETS = Object.freeze(['job', 'resume', 'score']);

export function initialDesk(page = 'home') {
  return { page: DESK_PAGES.includes(page) ? page : 'home', room: null, open: null, sheet: null, settings: false, dock: true, sessionId: null, drafts: {} };
}

export function deskNavigation(state, event) {
  switch (event.type) {
    case 'page':
      if (!DESK_PAGES.includes(event.page)) return state;
      // The home page can open the interview page at the sheet for its next step.
      return { ...state, page: event.page, open: null, sheet: event.page === 'interview' && SHEETS.includes(event.sheet) ? event.sheet : null, room: null };
    case 'open':
      if (event.page && !DESK_PAGES.includes(event.page)) return state;
      return { ...state, page: event.page || state.page, open: event.target, sheet: null, room: null };
    case 'close':
      return { ...state, open: null };
    case 'sheet':
      return { ...state, sheet: SHEETS.includes(event.sheet) ? event.sheet : null };
    case 'room':
      return event.sessionId ? { ...state, room: event.sessionId, sheet: null, settings: false } : state;
    case 'leaveRoom':
      return { ...state, room: null };
    case 'settings':
      return { ...state, settings: Boolean(event.open) };
    case 'dock':
      return { ...state, dock: typeof event.open === 'boolean' ? event.open : !state.dock };
    case 'session':
      return { ...state, sessionId: event.sessionId || null, dock: event.sessionId ? true : state.dock };
    case 'draft': {
      const drafts = { ...state.drafts };
      if (event.value === undefined) delete drafts[event.key]; else drafts[event.key] = event.value;
      return { ...state, drafts };
    }
    default:
      return state;
  }
}

/** What fills the panel: the room covers everything, otherwise the page (or an object opened in it). */
export function deskScreen(state) {
  if (state.room) return 'room';
  return state.open ? `${state.page}:${state.open.kind}` : state.page;
}

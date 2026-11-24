import type { PdfBoundingBox } from '../contracts/documents.ts';
import { DocumentParseError, type RawPdfBlock } from './normalize.ts';

/*
 * Reading order for one PDF page's positioned text runs. No PDF library is
 * imported here, so the layout rules can be tested on plain run lists.
 */

/**
 * A running header or footer (same words, page numbers aside, in the top or
 * bottom tenth of two or more pages) is kept once, where it first appears.
 */
export function dropRunningFurniture(pages: Array<{ blocks: RawPdfBlock[]; bottom: number; top: number }>): RawPdfBlock[] {
  if (pages.length < 2) return pages.flatMap(page => page.blocks);
  const band = (page: { bottom: number; top: number }, block: RawPdfBlock): boolean => {
    const height = page.top - page.bottom;
    if (!block.bbox || !(height > 0)) return false;
    const margin = height * 0.1;
    return block.bbox.y >= page.top - margin || block.bbox.y + block.bbox.height <= page.bottom + margin;
  };
  const signature = (block: RawPdfBlock) => block.text.replace(/\d+/gu, '#').replace(/\s+/gu, '');
  const pagesWith = new Map<string, Set<number>>();
  for (const [index, page] of pages.entries()) {
    for (const block of page.blocks) if (band(page, block)) {
      const key = signature(block);
      pagesWith.set(key, (pagesWith.get(key) ?? new Set()).add(index));
    }
  }
  const seen = new Set<string>();
  return pages.flatMap(page => page.blocks.filter(block => {
    if (!band(page, block)) return true;
    const key = signature(block);
    if ((pagesWith.get(key)?.size ?? 0) < 2) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }));
}

/**
 * Page text in reading order, one block per paragraph.
 *
 * 1. Positioned runs, without rotated runs (watermarks, vertical labels) and
 *    without the second copy of text drawn twice at almost the same spot
 *    (simulated bold, shadows).
 * 2. Visual lines, split into fragments at wide horizontal gaps.
 * 3. Recursive whitespace cuts: a vertical gutter that no fragment crosses
 *    splits columns (left column first), unless the two sides line up row by
 *    row (a title with its right-aligned date, a label with its value), which
 *    stays one line. Otherwise the widest horizontal gap splits top from bottom.
 * 4. Consecutive lines that are a wrapped continuation of one paragraph join.
 */
export function buildPageBlocks(items: unknown[], pageNumber: number): { blocks: RawPdfBlock[]; readingOrderReview: boolean; columnCandidate: boolean } {
  const horizontal = items.filter(isTextItem).filter(item => item.str.length > 0 && isHorizontal(item.transform));
  const positioned = dedupeRuns(horizontal
    .filter((item) => item.str.trim().length > 0)
    .map((item) => {
      const size = runSize(item);
      const width = Math.max(0, finiteCoordinate(item.width));
      return {
        text: item.str,
        x: finiteCoordinate(item.transform[4]),
        y: finiteCoordinate(item.transform[5]),
        width: width > 0 ? width : item.str.length * size * 0.5,
        height: size,
        hasEOL: item.hasEOL === true,
        spaceAfter: false,
      };
    })
    .sort((left, right) => right.y - left.y || left.x - right.x));
  if (positioned.length > 100_000) throw new DocumentParseError('DOCUMENT_UNSAFE');
  if (positioned.length === 0) return { blocks: [], readingOrderReview: false, columnCandidate: false };
  markDrawnSpaces(positioned, horizontal.filter(item => item.str.trim().length === 0));

  const fragments = groupLines(positioned).flatMap(splitLine);
  const page: Column = { left: Math.min(...fragments.map(fragment => fragment.x0)), right: Math.max(...fragments.map(fragment => fragment.x1)) };
  const layout = { columns: false, rows: false };
  const lines = readingOrder(fragments, page, layout, 0);
  const paragraphs: OrderedLine[][] = [];
  for (const line of lines) {
    const current = paragraphs.at(-1);
    if (current && continuesParagraph(current.at(-1)!, line)) current.push(line);
    else paragraphs.push([line]);
  }
  const blocks = paragraphs
    .map((paragraph) => ({
      kind: 'pdf' as const,
      pageNumber,
      text: joinParagraph(paragraph),
      bbox: boundingBox(paragraph.flatMap(line => line.fragments.flatMap(fragment => fragment.items))),
    }))
    .filter((block) => block.text.trim().length > 0);
  return { blocks, readingOrderReview: layout.columns, columnCandidate: layout.columns };
}

interface PositionedText {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasEOL: boolean;
  /** A space glyph is drawn right after this run. Spaces never take part in layout geometry. */
  spaceAfter: boolean;
}
interface Fragment { items: PositionedText[]; text: string; x0: number; x1: number; y: number; top: number; bottom: number; size: number }
interface Column { left: number; right: number }
interface OrderedLine { fragments: Fragment[]; column: Column; text: string; x0: number; x1: number; y: number; size: number }

const CJK = /[\u2E80-\u2FFF\u3000-\u303F\u3040-\u30FF\u3100-\u31FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/u;
const BULLET_START = /^(?:[\u2022\u00B7\u25CF\u25CB\u25E6\u25C6\u25C7\u25A0\u25A1\u25AA\u25AB\u25BA\u25B6\u25B8\u27A2\u27A4\u2713\u2714\u2605\u2606\u203B\-\u2013\u2014*+]|\d{1,2}[.\u3001)\uFF09](?!\d)|[\uFF08(]\d{1,2}[)\uFF09]|[\u2460-\u2473\u2474-\u2487])/u;
const SENTENCE_END = /[。！？!?；;：:]$/u;

/** Rotated runs are watermarks or decorative labels, not resume text. Synthetic italics only skew (c), so they stay. */
function isHorizontal(transform: unknown[]): boolean {
  const a = finiteCoordinate(transform[0]), b = finiteCoordinate(transform[1]);
  return a > 0 && Math.abs(b) <= a * 0.15;
}

function runSize(item: TextItem): number {
  const height = finiteCoordinate(item.height);
  if (height > 0) return height;
  const fromMatrix = Math.hypot(finiteCoordinate(item.transform[2]), finiteCoordinate(item.transform[3]));
  return fromMatrix > 0 ? fromMatrix : 10;
}

/** Marks the run each drawn space follows: the nearest run on its baseline that ends where the space starts. */
function markDrawnSpaces(runs: PositionedText[], spaces: TextItem[]): void {
  if (spaces.length === 0 || spaces.length > 100_000) return;
  const byBaseline = new Map<number, PositionedText[]>();
  for (const run of runs) {
    const key = Math.round(run.y);
    const bucket = byBaseline.get(key);
    if (bucket) bucket.push(run); else byBaseline.set(key, [run]);
  }
  for (const space of spaces) {
    const x = finiteCoordinate(space.transform[4]), y = finiteCoordinate(space.transform[5]);
    let best: PositionedText | undefined, distance = Infinity;
    for (const key of [Math.round(y) - 1, Math.round(y), Math.round(y) + 1]) {
      for (const run of byBaseline.get(key) ?? []) {
        if (Math.abs(run.y - y) > Math.max(1.5, run.height * 0.35)) continue;
        const gap = x - (run.x + run.width);
        if (gap >= -run.height * 0.3 && gap <= run.height * 0.5 && gap < distance) { best = run; distance = gap; }
      }
    }
    if (best) best.spaceAfter = true;
  }
}

/** Text drawn twice within a fraction of its size (simulated bold, shadow) is one run. */
function dedupeRuns(runs: PositionedText[]): PositionedText[] {
  const kept: PositionedText[] = [];
  const byText = new Map<string, PositionedText[]>();
  for (const run of runs) {
    const key = run.text.trim();
    const near = Math.max(1, run.height * 0.25);
    const twins = byText.get(key);
    if (twins?.some(other => Math.abs(other.x - run.x) <= near && Math.abs(other.y - run.y) <= near)) continue;
    if (twins) twins.push(run); else byText.set(key, [run]);
    kept.push(run);
  }
  return kept;
}

/** Runs sorted top-down whose baselines sit within a third of the smaller size share a line. */
function groupLines(runs: PositionedText[]): PositionedText[][] {
  const lines: PositionedText[][] = [];
  for (const run of [...runs].sort((left, right) => right.y - left.y || left.x - right.x)) {
    const line = lines.at(-1);
    const anchor = line?.[0];
    if (line && anchor && Math.abs(anchor.y - run.y) <= Math.max(1.5, Math.min(anchor.height, run.height) * 0.35)) line.push(run);
    else lines.push([run]);
  }
  return lines;
}

function makeFragment(items: PositionedText[]): Fragment {
  const size = Math.max(...items.map(item => item.height));
  const y = items.reduce((sum, item) => sum + item.y, 0) / items.length;
  return { items, text: joinRuns(items), x0: Math.min(...items.map(item => item.x)), x1: Math.max(...items.map(item => item.x + item.width)),
    y, top: Math.max(...items.map(item => item.y + item.height)), bottom: Math.min(...items.map(item => item.y - item.height * 0.2)), size };
}

/** A visual line breaks into fragments at gaps much wider than a word space. */
function splitLine(line: PositionedText[]): Fragment[] {
  const ordered = [...line].sort((left, right) => left.x - right.x);
  const groups: PositionedText[][] = [[]];
  for (const item of ordered) {
    const previous = groups.at(-1)!.at(-1);
    if (previous && item.x - (previous.x + previous.width) > Math.max(18, Math.max(previous.height, item.height) * 2.5)) groups.push([]);
    groups.at(-1)!.push(item);
  }
  return groups.filter(group => group.length > 0).map(makeFragment);
}

function sameBaseline(left: Fragment, right: Fragment): boolean {
  return Math.abs(left.y - right.y) <= Math.max(1.5, Math.min(left.size, right.size) * 0.35);
}

/** Whether the ascending list holds a value within tolerance of target. */
function hasNear(sorted: number[], target: number, tolerance: number): boolean {
  let low = 0, high = sorted.length;
  while (low < high) { const middle = (low + high) >> 1; if (sorted[middle]! < target - tolerance) low = middle + 1; else high = middle; }
  return low < sorted.length && sorted[low]! <= target + tolerance;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 10;
}

/** Widest empty interval between the merged spans [start, end]; null when the spans leave no gap. */
function widestGap(spans: Array<[number, number]>): { from: number; to: number } | null {
  const sorted = [...spans].sort((a, b) => a[0] - b[0]);
  let reach = sorted[0]![1], best: { from: number; to: number } | null = null;
  for (const [start, end] of sorted.slice(1)) {
    if (start > reach && (!best || start - reach > best.to - best.from)) best = { from: reach, to: start };
    reach = Math.max(reach, end);
  }
  return best;
}

function columnOf(fragments: Fragment[]): Column {
  return { left: Math.min(...fragments.map(fragment => fragment.x0)), right: Math.max(...fragments.map(fragment => fragment.x1)) };
}

function toLine(fragments: Fragment[], column: Column): OrderedLine {
  const ordered = [...fragments].sort((left, right) => left.x0 - right.x0);
  return { fragments: ordered, column, text: ordered.map(fragment => fragment.text).join(' '),
    x0: ordered[0]!.x0, x1: ordered.at(-1)!.x1, y: Math.max(...ordered.map(fragment => fragment.y)), size: Math.max(...ordered.map(fragment => fragment.size)) };
}

/** Lines of a region without any whitespace cut left: group by baseline, top-down. */
function regionLines(fragments: Fragment[], column: Column): OrderedLine[] {
  const lines: Fragment[][] = [];
  for (const fragment of [...fragments].sort((left, right) => right.y - left.y || left.x0 - right.x0)) {
    const line = lines.find(candidate => sameBaseline(candidate[0]!, fragment));
    if (line) line.push(fragment); else lines.push([fragment]);
  }
  return lines.map(line => toLine(line, column)).sort((left, right) => right.y - left.y);
}

function readingOrder(fragments: Fragment[], column: Column, layout: { columns: boolean; rows: boolean }, depth: number): OrderedLine[] {
  if (fragments.length === 0) return [];
  if (fragments.every(fragment => sameBaseline(fragments[0]!, fragment))) return [toLine(fragments, column)];
  if (depth > 400) return regionLines(fragments, column);
  const gutter = widestGap(fragments.map(fragment => [fragment.x0, fragment.x1]));
  if (gutter && gutter.to - gutter.from >= Math.max(12, median(fragments.map(fragment => fragment.size)) * 1.5)) {
    const left = fragments.filter(fragment => fragment.x1 <= gutter.from), right = fragments.filter(fragment => fragment.x0 >= gutter.to);
    // A centered header or footer can sit on one side of the gutter without belonging to that column.
    const spanners = outsideBody(left, right);
    if (spanners.above.length + spanners.below.length > 0) {
      const middle = fragments.filter(fragment => !spanners.above.includes(fragment) && !spanners.below.includes(fragment));
      return [...readingOrder(spanners.above, column, layout, depth + 1), ...readingOrder(middle, column, layout, depth + 1),
        ...readingOrder(spanners.below, column, layout, depth + 1)];
    }
    const [fewer, more] = left.length <= right.length ? [left, right] : [right, left];
    const baselines = more.map(fragment => fragment.y).sort((a, b) => a - b);
    const paired = fewer.filter(fragment => hasNear(baselines, fragment.y, Math.max(1.5, fragment.size * 0.35))).length;
    // Sides that line up are still columns when each carries its own headings or a wrapped paragraph.
    if (paired < fewer.length * 0.8 || (hasHeading(left) && hasHeading(right)) || hasWrap(left) || hasWrap(right)) {
      if (left.length > 1 && right.length > 1) layout.columns = true;
      return [...readingOrder(left, columnOf(left), layout, depth + 1), ...readingOrder(right, columnOf(right), layout, depth + 1)];
    }
    layout.rows = true;
  }
  const band = widestGap(fragments.map(fragment => [fragment.bottom, fragment.top]));
  if (band) {
    const above = fragments.filter(fragment => fragment.bottom >= band.to), below = fragments.filter(fragment => fragment.top <= band.from);
    return [...readingOrder(above, column, layout, depth + 1), ...readingOrder(below, column, layout, depth + 1)];
  }
  return regionLines(fragments, column);
}

/**
 * Fragments wholly above (or below) the height both sides share, which also
 * reach past the horizontal extent of their side's column body.
 */
function outsideBody(left: Fragment[], right: Fragment[]): { above: Fragment[]; below: Fragment[] } {
  const top = Math.min(Math.max(...left.map(fragment => fragment.top)), Math.max(...right.map(fragment => fragment.top)));
  const bottom = Math.max(Math.min(...left.map(fragment => fragment.bottom)), Math.min(...right.map(fragment => fragment.bottom)));
  const above: Fragment[] = [], below: Fragment[] = [];
  for (const side of [left, right]) {
    const body = side.filter(fragment => fragment.bottom < top && fragment.top > bottom);
    const extent = body.length ? columnOf(body) : null;
    const outside = (fragment: Fragment) => !extent || fragment.x0 < extent.left - 2 || fragment.x1 > extent.right + 2;
    for (const fragment of side) {
      if (fragment.bottom >= top && outside(fragment)) above.push(fragment);
      else if (fragment.top <= bottom && outside(fragment)) below.push(fragment);
    }
  }
  return { above, below };
}

function hasHeading(side: Fragment[]): boolean {
  if (side.length < 2) return false;
  const typical = median(side.map(fragment => fragment.size));
  return side.some(fragment => fragment.size >= typical * 1.15);
}

/** Flowing text: at least two lines run to this side's edge, and one of them wraps into the next. */
function hasWrap(side: Fragment[]): boolean {
  const lines = regionLines(side, columnOf(side));
  if (lines.filter(line => reachesEdge(line)).length < 2) return false;
  return lines.some((line, index) => index > 0 && continuesParagraph(lines[index - 1]!, line));
}

function reachesEdge(line: OrderedLine): boolean {
  const width = line.column.right - line.column.left;
  return line.x1 >= line.column.right - Math.max(line.size * 2, width * 0.05);
}

/** The next line continues this one when this one runs to the column edge and both look alike. */
function continuesParagraph(previous: OrderedLine, next: OrderedLine): boolean {
  if (previous.fragments.length !== 1 || next.fragments.length !== 1 || previous.column !== next.column) return false;
  const size = previous.size;
  // Wrapped lines share one style; a title over its first bullet differs by a point or more.
  if (Math.abs(next.size - size) > size * 0.08) return false;
  const pitch = previous.y - next.y;
  if (pitch < size * 0.8 || pitch > size * 2.1) return false;
  // Narrow cells, grids and sidebars keep their line breaks.
  if (previous.column.right - previous.column.left < size * 12) return false;
  // A wrap leaves less room at the end of the line than the next line's first word needs.
  const following = next.fragments[0]!;
  const word = /^[A-Za-z0-9'’.,@/+#-]+/u.exec(next.text.trim())?.[0] ?? next.text.trim().slice(0, 1);
  const wordWidth = (following.x1 - following.x0) * word.length / Math.max(1, following.text.length);
  if (previous.column.right - previous.x1 > wordWidth + size * 0.6) return false;
  if (Math.abs(next.x0 - previous.x0) > size * 2.5) return false;
  return !SENTENCE_END.test(previous.text.trim()) && !BULLET_START.test(next.text.trim());
}

function joinParagraph(lines: OrderedLine[]): string {
  let text = '';
  for (const line of lines) {
    const part = line.text.trim();
    if (!text) { text = part; continue; }
    const last = text.at(-1) ?? '', first = part[0] ?? '';
    if (/[A-Za-z]-$/u.test(text) && /^[a-z]/u.test(part)) text += part;
    else text += CJK.test(last) || CJK.test(first) ? part : ` ${part}`;
  }
  return text;
}

function joinRuns(line: PositionedText[]): string {
  let text = '';
  let previous: PositionedText | undefined;
  for (const item of line) {
    if (previous && shouldInsertSpace(previous, item, text)) text += ' ';
    text += item.text;
    previous = item;
  }
  return text.trim();
}

/** Letter-spaced CJK never gains spaces; Latin words keep the space their gap implies. */
function shouldInsertSpace(
  previous: PositionedText,
  current: PositionedText,
  text: string,
): boolean {
  if (/\s$/u.test(text) || /^\s/u.test(current.text)) return false;
  const gap = current.x - (previous.x + previous.width);
  const size = Math.min(previous.height, current.height);
  if (previous.spaceAfter && gap > -size * 0.3) return true;
  const before = text.at(-1) ?? '', after = current.text[0] ?? '';
  if (CJK.test(before) && CJK.test(after)) return gap > size * 0.45;
  if (CJK.test(before) || CJK.test(after)) return gap > size * 0.2;
  return gap > size * 0.12 || (previous.hasEOL && gap >= 0);
}

function boundingBox(line: PositionedText[]): PdfBoundingBox {
  const minX = Math.min(...line.map((item) => item.x));
  const minY = Math.min(...line.map((item) => item.y));
  const maxX = Math.max(...line.map((item) => item.x + item.width));
  const maxY = Math.max(...line.map((item) => item.y + item.height));
  return {
    x: roundCoordinate(minX),
    y: roundCoordinate(minY),
    width: roundCoordinate(Math.max(0, maxX - minX)),
    height: roundCoordinate(Math.max(0, maxY - minY)),
  };
}

function isTextItem(value: unknown): value is TextItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'str' in value &&
    typeof value.str === 'string' &&
    'transform' in value &&
    Array.isArray(value.transform)
  );
}

export interface TextItem {
  str: string;
  transform: unknown[];
  width: number;
  height: number;
  hasEOL: boolean;
}

export function finiteCoordinate(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function roundCoordinate(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}

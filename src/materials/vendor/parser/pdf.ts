import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { DocumentParseResult } from '../contracts/documents.ts';
import {
  DOCUMENT_MAX_BLOCKS,
  MAX_PDF_PAGES,
  PDF_OCR_MIN_NON_WHITESPACE_CHARS,
  PDF_OCR_MIN_PAGE_CHARS,
} from '../domain/document-limits.ts';
import { AnnotationType, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { DocumentParseError, normalizeDocument, type RawPdfBlock } from './normalize.ts';
import { buildPageBlocks, dropRunningFurniture, finiteCoordinate } from './pdf-layout.ts';
import { isFileSystemError } from './file-errors.ts';

// URI is not itself executable. Only a narrowly classified passive Link is accepted below.
// Decode PDF name escapes before this conservative guard, so /Java#53cript cannot evade it.
// /Next is not listed: bookmarks chain with it, and every action type it could reach that does
// anything is listed by name. /OpenAction passes only as a plain destination array (open at page 1).
// Object streams are inflated and scanned with the same list, so names cannot hide in them.
const ACTIVE_PDF_NAMES = new Set(['JavaScript', 'JS', 'OpenAction', 'AA', 'EmbeddedFiles', 'Filespec', 'Launch',
  'GoToR', 'GoToE', 'Named', 'SubmitForm', 'ImportData', 'ResetForm', 'Hide', 'SetOCGState',
  'Rendition', 'Sound', 'Movie', 'RichMedia', 'Encrypt']);
const OBJECT_STREAM_MAX_BYTES = 16 * 1024 * 1024, OBJECT_STREAMS_MAX_BYTES = 64 * 1024 * 1024, OBJECT_STREAMS_MAX = 2_000;
const require = createRequire(import.meta.url);
const PDFJS_ROOT = resolve(dirname(require.resolve('pdfjs-dist/legacy/build/pdf.mjs')), '../..');
const PDFJS_CMAP_URL = `${resolve(PDFJS_ROOT, 'cmaps').replaceAll('\\', '/')}/`;
const PDFJS_STANDARD_FONT_URL = `${resolve(PDFJS_ROOT, 'standard_fonts').replaceAll('\\', '/')}/`;

export type PdfParseOutcome =
  | { status: 'PARSED'; result: DocumentParseResult }
  | { status: 'OCR_REQUIRED'; reason: 'insufficient-text' };

export async function parsePdf(path: string): Promise<PdfParseOutcome> {
  const file = await readFile(path);
  assertNoActivePdfNames(file);

  const loadingTask = getDocument({
    data: new Uint8Array(file),
    verbosity: 0,
    stopAtErrors: true,
    disableFontFace: true,
    useSystemFonts: false,
    useWorkerFetch: false,
    useWasm: false,
    cMapUrl: PDFJS_CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: PDFJS_STANDARD_FONT_URL,
    disableStream: true,
    disableAutoFetch: true,
  });
  let document: Awaited<typeof loadingTask.promise> | undefined;
  try {
    document = await loadingTask.promise;
    if (document.numPages > MAX_PDF_PAGES) {
      throw new DocumentParseError('PDF_TOO_MANY_PAGES');
    }
    await assertSafeDocument(document);

    const pages: Array<{ blocks: RawPdfBlock[]; bottom: number; top: number }> = [];
    let blockCount = 0;
    let readingOrderReview = false, columnCandidate = false;
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      await assertSafePage(page);
      const textContent = await page.getTextContent({ disableNormalization: false });
      const pageResult = buildPageBlocks(textContent.items, pageNumber);
      readingOrderReview ||= pageResult.readingOrderReview; columnCandidate ||= pageResult.columnCandidate;
      const view = Array.isArray(page.view) ? page.view.map(finiteCoordinate) : [0, 0, 0, 0];
      pages.push({ blocks: pageResult.blocks, bottom: Math.min(view[1]!, view[3]!), top: Math.max(view[1]!, view[3]!) });
      blockCount += pageResult.blocks.length;
      if (blockCount > DOCUMENT_MAX_BLOCKS) throw new DocumentParseError('DOCUMENT_UNSAFE');
      page.cleanup();
    }
    const blocks = dropRunningFurniture(pages);
    const pageCharacterCounts = pages.map(({ blocks: pageBlocks }) => nonWhitespaceLength(pageBlocks.map((block) => block.text).join('')));

    const totalCharacters = pageCharacterCounts.reduce((total, count) => total + count, 0);
    const textPoorPages = pageCharacterCounts.filter(
      (count) => count < PDF_OCR_MIN_PAGE_CHARS,
    ).length;
    if (
      totalCharacters < PDF_OCR_MIN_NON_WHITESPACE_CHARS ||
      (document.numPages > 1 && textPoorPages > document.numPages / 2)
    ) {
      return { status: 'OCR_REQUIRED', reason: 'insufficient-text' };
    }

    const qualityReasons = textPoorPages > 0 ? ['partial-text-layer'] : ['native-text-layer'];
    if (readingOrderReview) qualityReasons.push('reading-order-review-required',
      columnCandidate ? 'two-column-order-candidate' : 'layout-fragments-preserved');
    return {
      status: 'PARSED',
      result: normalizeDocument({
        documentKind: 'pdf',
        blocks,
        pageCount: document.numPages,
        qualityScore: readingOrderReview ? 0.8 : textPoorPages > 0 ? 0.9 : 1,
        qualityReasons,
      }),
    };
  } catch (error) {
    if (error instanceof DocumentParseError || isFileSystemError(error)) throw error;
    throw new DocumentParseError('DOCUMENT_UNSAFE');
  } finally {
    await loadingTask.destroy();
  }
}

async function assertSafeDocument(
  document: Awaited<ReturnType<typeof getDocument>['promise']>,
): Promise<void> {
  const [javaScriptActions, openAction, attachments] = await Promise.all([
    document.getJSActions(),
    document.getOpenAction(),
    document.getAttachments(),
  ]);
  // A plain destination ("open at page 1") is the only open action accepted.
  // pdf.js reports it as a Map with "dest" (a destination) or "action" (a named action).
  const openTarget: Record<string, unknown> | null = openAction instanceof Map ? Object.fromEntries(openAction)
    : openAction !== null && typeof openAction === 'object' ? openAction as Record<string, unknown> : null;
  const plainDestination = openTarget !== null && Array.isArray(openTarget.dest)
    && Object.entries(openTarget).every(([key, value]) => key === 'dest' || value === null || value === undefined);
  if (hasActionValues(javaScriptActions) || (openAction !== null && !plainDestination) || hasActionValues(attachments)) {
    throw new DocumentParseError('DOCUMENT_UNSAFE');
  }
}

async function assertSafePage(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof getDocument>['promise']>['getPage']>>,
): Promise<void> {
  const [javaScriptActions, annotations] = await Promise.all([
    page.getJSActions(),
    page.getAnnotations({ intent: 'any' }),
  ]);
  if (hasActionValues(javaScriptActions)) throw new DocumentParseError('DOCUMENT_UNSAFE');
  for (const annotation of annotations as Array<Record<string, unknown>>) {
    if (classifyAnnotation(annotation) === 'unsafe') throw new DocumentParseError('DOCUMENT_UNSAFE');
  }
}

export function assertNoActivePdfNames(bytes: Buffer): void {
  const text = bytes.toString('latin1');
  assertNoActiveNames(text);
  let total = 0, count = 0;
  for (const objectStream of objectStreams(text, bytes)) {
    count += 1; total += objectStream.length;
    if (count > OBJECT_STREAMS_MAX || total > OBJECT_STREAMS_MAX_BYTES) throw new DocumentParseError('DOCUMENT_UNSAFE');
    assertNoActiveNames(objectStream.toString('latin1'));
  }
}

function assertNoActiveNames(text: string): void {
  for (const match of text.matchAll(/\/([^\s\x00()[\]<>/%{}]+)/gu)) {
    const name = match[1]!.replace(/#([a-f0-9]{2})/giu, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
    if (!ACTIVE_PDF_NAMES.has(name)) continue;
    if (name === 'OpenAction' && /^\s*\[/u.test(text.slice(match.index! + match[0].length, match.index! + match[0].length + 64))) continue;
    throw new DocumentParseError('DOCUMENT_UNSAFE');
  }
}

/**
 * The inflated bodies of every object stream. A stream that is not plain
 * Flate (another filter, a predictor, or data that does not inflate within
 * the limit) cannot be checked, so the document is refused.
 */
function* objectStreams(text: string, bytes: Buffer): Generator<Buffer> {
  for (const match of text.matchAll(/\/Type\s*\/ObjStm(?![A-Za-z0-9])/gu)) {
    const objectStart = text.lastIndexOf('obj', match.index!);
    const streamAt = text.indexOf('stream', match.index!);
    if (objectStart < 0 || streamAt < 0 || streamAt - objectStart > 4096) throw new DocumentParseError('DOCUMENT_UNSAFE');
    const header = text.slice(objectStart, streamAt);
    const filters = [...header.matchAll(/\/Filter\s*(?:\[([^\]]*)\]|(\/[A-Za-z0-9]+))/gu)].map(found => (found[1] ?? found[2]!).trim().split(/\s+/u));
    if (filters.length !== 1 || filters[0]!.length !== 1 || filters[0]![0] !== '/FlateDecode' || /\/DecodeParms|\/Predictor/u.test(header)) throw new DocumentParseError('DOCUMENT_UNSAFE');
    let start = streamAt + 'stream'.length;
    if (text[start] === '\r') start += 1;
    if (text[start] === '\n') start += 1;
    const end = text.indexOf('endstream', start);
    if (end < 0) throw new DocumentParseError('DOCUMENT_UNSAFE');
    try {
      // Strict: a stream cut short (for instance by a forged "endstream" inside its data) throws.
      yield inflateSync(bytes.subarray(start, end), { maxOutputLength: OBJECT_STREAM_MAX_BYTES });
    } catch (error) {
      if (error instanceof DocumentParseError) throw error;
      throw new DocumentParseError('DOCUMENT_UNSAFE');
    }
  }
}

function safePassiveUri(value: unknown): value is string {
  if (typeof value !== 'string' || !value || value.length > 8192 || value.trim() !== value || /[\u0000-\u0020\u007f\\]/u.test(value)) return false;
  try {
    const target = new URL(value);
    return (target.protocol === 'http:' || target.protocol === 'https:') ? !!target.hostname && !target.username && !target.password
      : target.protocol === 'mailto:' && !!target.pathname && !target.hash;
  } catch { return false; }
}

/** No link target is returned or visited. Only the already extracted visible page text is retained. */
function classifyAnnotation(annotation: Record<string, unknown>): 'passive-link' | 'inert' | 'unsafe' {
  if (annotation.annotationType === AnnotationType.FILEATTACHMENT || annotation.file !== undefined
    || annotation.action !== undefined || annotation.dest !== undefined || annotation.hasJSActions === true
    || hasActionValues(annotation.jsActions) || annotation.resetForm !== undefined || annotation.setOCGState !== undefined
    || annotation.submitForm !== undefined || annotation.attachment !== undefined || hasActionValues(annotation.actions)) return 'unsafe';
  if (annotation.annotationType === AnnotationType.LINK) {
    // Validate the unfiltered original URL too: pdf.js deliberately drops unsafe schemes from .url.
    return safePassiveUri(annotation.unsafeUrl) && safePassiveUri(annotation.url) ? 'passive-link' : 'unsafe';
  }
  return annotation.url !== undefined || annotation.unsafeUrl !== undefined ? 'unsafe' : 'inert';
}



function hasActionValues(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Map) return value.size > 0;
  return Object.values(value).some((item) =>
    Array.isArray(item) ? item.length > 0 : item !== undefined && item !== null,
  );
}

function nonWhitespaceLength(value: string): number {
  return value.replace(/\s/gu, '').length;
}



import test from 'node:test';
import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ParserSupervisor, DOCUMENT_PARSER_VERSION, parserChildEnvironment, parserEnvironment } from '../src/materials/runtime/index.mjs';

// DSH desktop hosts plugins in Electron. Its executable is Node only with ELECTRON_RUN_AS_NODE=1;
// otherwise it starts a second app instance, which loses the single-instance lock and exits 0 silently.
Object.defineProperty(process.versions, 'electron', { value: '44.7.0', configurable: true });

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function docx(text) {
  const entries = [['[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ['word/document.xml', `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`]];
  const local = [], central = []; let offset = 0;
  for (const [path, value] of entries) {
    const name = Buffer.from(path), body = Buffer.from(value), crc = crc32(body);
    const head = Buffer.alloc(30); head.writeUInt32LE(0x04034b50); head.writeUInt16LE(20, 4); head.writeUInt32LE(crc, 14); head.writeUInt32LE(body.length, 18); head.writeUInt32LE(body.length, 22); head.writeUInt16LE(name.length, 26);
    local.push(head, name, body);
    const item = Buffer.alloc(46); item.writeUInt32LE(0x02014b50); item.writeUInt16LE(20, 4); item.writeUInt16LE(20, 6); item.writeUInt32LE(crc, 16); item.writeUInt32LE(body.length, 20); item.writeUInt32LE(body.length, 24); item.writeUInt16LE(name.length, 28); item.writeUInt32LE(offset, 42);
    central.push(item, name); offset += head.length + name.length + body.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

test('the Electron Node-mode flag survives the parser child environment filter', () => {
  const env = parserEnvironment('/tmp/job');
  assert.equal(env.ELECTRON_RUN_AS_NODE, '1');
  const child = parserChildEnvironment(env, '/tmp/job');
  assert.equal(child.ELECTRON_RUN_AS_NODE, '1');
  assert.equal(child.HOME, '/tmp/job');
  assert.equal(parserChildEnvironment({ ELECTRON_RUN_AS_NODE: 'yes', PATH: '/bin' }, '/tmp/job').ELECTRON_RUN_AS_NODE, undefined);
  assert.equal(parserChildEnvironment({ SECRET_TOKEN: 'x' }, '/tmp/job').SECRET_TOKEN, undefined);
}, { skip: process.platform === 'win32' });

test('an Electron-like host executable parses documents instead of returning an empty reply', { skip: process.platform === 'win32' }, async t => {
  const base = resolve('.runtime/zhijing/tests/plugin-electron'); await mkdir(base, { recursive: true });
  const directory = await mkdtemp(join(base, 'case-'));
  const host = join(directory, 'electron-host');
  const node = process.execPath;
  await writeFile(host, `#!/bin/sh\n[ "$ELECTRON_RUN_AS_NODE" = "1" ] || exit 0\nexec "${node}" "$@"\n`);
  await chmod(host, 0o755);
  // The supervisor only admits the current host executable, as DSH does in production.
  process.execPath = host; t.after(() => { process.execPath = node; });
  const supervisor = new ParserSupervisor({ root: join(directory, 'parser'),
    childEntry: fileURLToPath(new URL('../src/materials/runtime/parser-child.mjs', import.meta.url)), nodeExecutable: host });
  t.after(() => supervisor.close?.());
  const result = await supervisor.submit({ taskId: randomUUID(), generation: 1, bytes: docx('合成简历：负责接口测试和文档维护。'),
    documentKind: 'docx', parserVersion: DOCUMENT_PARSER_VERSION });
  assert.equal(result.errorCode, undefined);
  assert.equal(result.outcome.status, 'PARSED');
  assert.match(result.outcome.result.plainText, /接口测试/);
});

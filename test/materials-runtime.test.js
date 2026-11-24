import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));

// dev.9 fixed the parser child environment in src/materials/vendor, but the
// generated runtime was never rebuilt, so dev.9 and dev.10 shipped without the
// fix. The committed runtime must be exactly what its source builds to.
test('the generated parser runtime is built from the current parser source', async () => {
  const fresh = await build({ absWorkingDir: root, entryPoints: ['src/materials/vendor/runtime.ts'], bundle: true, platform: 'node', format: 'esm',
    target: 'node24', packages: 'external', write: false, logLevel: 'silent' });
  const committed = await readFile(new URL('../src/materials/runtime/index.mjs', import.meta.url), 'utf8');
  assert.ok(fresh.outputFiles[0].text === committed, 'src/materials/runtime is stale: run `node scripts/build.mjs` before packing');
});

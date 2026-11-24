import assert from 'node:assert/strict';
import test from 'node:test';
import { createIndex } from '../scripts/update-index.mjs';

const pkg = { name: 'dsh-interview-desk', version: '0.2.0', description: '职镜AI', engines: { dsh: '>=0.2.2-rc.1 <0.3.0' } };
const timestamp = Math.floor(Date.UTC(2026, 10, 23) / 1000);

test('index lists the npm release and keeps the declared Host range', () => {
  const index = createIndex(pkg, timestamp);
  assert.equal(index.format, 1);
  assert.equal(index.plugins.length, 1);
  const plugin = index.plugins[0];
  assert.equal(plugin.name, pkg.name);
  assert.equal(plugin.title.zh, '职镜AI');
  assert.equal(plugin.description.zh, pkg.description);
  assert.deepEqual(plugin.versions, [{ version: pkg.version, publishTimestamp: timestamp, source: { type: 'npm' }, engines: { dsh: pkg.engines.dsh } }]);
});

test('publication time rejects milliseconds, fractions and values outside the format-1 seconds range', () => {
  for (const value of [undefined, String(timestamp), NaN, Infinity, -1, 0, timestamp + 0.5, timestamp * 1000, 1e11, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => createIndex(pkg, value), /timestamp|publication|seconds/i, String(value));
  }
});

test('renamed and malformed package identities cannot silently replace the indexed plugin', () => {
  for (const name of ['dsh-zhijing', 'dsh-interview', 'other-package', '', undefined]) {
    assert.throws(() => createIndex({ ...pkg, name }, timestamp), /identity/i);
  }
  for (const version of ['latest', '^0.1.0', '01.2.3', '1.02.3', '1.2.03', '0.1.0-', '0.1.0-dev..6', '0.1.0-dev.06']) {
    assert.throws(() => createIndex({ ...pkg, version }, timestamp), /identity|version/i, version);
  }
  for (const engines of [undefined, {}, { dsh: '' }, { dsh: 1 }]) {
    assert.throws(() => createIndex({ ...pkg, engines }, timestamp), /identity/i);
  }
});

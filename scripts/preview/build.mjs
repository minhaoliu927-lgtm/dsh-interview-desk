// Builds the dev preview: `node scripts/preview/build.mjs [outDir]`, then open index.html.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '../../.preview'));
await fs.mkdir(out, { recursive: true });
await build({ absWorkingDir: path.resolve(here, '../..'), entryPoints: ['scripts/preview/main.jsx'], outfile: path.join(out, 'preview.js'), bundle: true,
  format: 'iife', platform: 'browser', target: 'chrome120', loader: { '.css': 'text' }, define: { 'process.env.NODE_ENV': '"development"' }, logLevel: 'warning' });
await fs.writeFile(path.join(out, 'index.html'), `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>职镜预览</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body,#root{height:100%;margin:0}body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei UI','Noto Sans SC','Noto Sans CJK SC',sans-serif;background:var(--dsw-alias-bg-base,#fbfcfd)}</style>
</head><body><div id="root"></div><script src="./preview.js"></script></body></html>`);
console.log(`Preview written to ${out}`);

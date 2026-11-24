import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/**
 * The plugin index lists the version already published on npm. DSH installs it
 * from npm, the same package as 「添加插件」 with the package name. Run after
 * npm publish (the Release workflow does), never before: an index entry for a
 * version npm does not have yet would fail to install.
 */
export function createIndex(pkg, publishTimestamp) {
  const version = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
  if (pkg.name !== 'dsh-interview-desk' || !version.test(pkg.version) || typeof pkg.engines?.dsh !== 'string' || !pkg.engines.dsh) throw new Error('Unexpected package identity');
  if (!Number.isSafeInteger(publishTimestamp) || publishTimestamp <= 0 || publishTimestamp >= 1e11) throw new Error('Pass a Unix publication timestamp in seconds');
  const repository = 'https://github.com/minhaoliu927-lgtm/dsh-interview-desk';
  return {
    format: 1,
    title: { zh: '职镜AI', en: 'Interview Desk' },
    description: { zh: '职镜AI 的插件索引：加一次，在「发现」里安装和更新。', en: 'The Interview Desk plugin index: add it once, then install and update from Discover.' },
    metadata: { categories: { career: { title: { zh: '求职与面试', en: 'Career and interviews' } } } },
    plugins: [{
      name: pkg.name,
      title: { zh: '职镜AI', en: 'Interview Desk' },
      description: { zh: pkg.description, en: 'Add the job description and your resume, score the resume, practise a voice or text interview, then review it. A job-hunting plugin for DeepSeek Harness.' },
      author: 'minhaoliu927-lgtm', homepage: `${repository}#readme`, repository: { url: repository },
      metadata: { category: 'career', keywords: ['dsh-plugin', 'dsh-interview-desk', '职镜AI', '简历', '求职', '面试', 'resume', 'interview'] },
      versions: [{ version: pkg.version, publishTimestamp, source: { type: 'npm' }, engines: { dsh: pkg.engines.dsh } }],
    }],
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [timestamp, ...rest] = process.argv.slice(2);
  if (rest.length || !timestamp) throw new Error('Usage: node scripts/update-index.mjs UNIX_SECONDS (the npm publication time)');
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const index = createIndex(pkg, Number(timestamp));
  await writeFile(new URL('../index.json', import.meta.url), JSON.stringify(index, null, 2) + '\n');
  console.log(JSON.stringify({ name: pkg.name, version: pkg.version, source: 'npm', publishTimestamp: Number(timestamp) }));
}

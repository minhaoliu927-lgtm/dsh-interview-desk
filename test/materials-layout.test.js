import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Reading-order rules for PDF text runs, tested on synthetic pdf.js-like items.
// Each case reproduces a resume layout that used to come out with skipped,
// interleaved or doubled lines.
const root = fileURLToPath(new URL('../', import.meta.url));
const bundle = await build({ absWorkingDir: root, entryPoints: ['src/materials/vendor/parser/pdf-layout.ts'], bundle: true, platform: 'node',
  format: 'esm', target: 'node22', write: false, logLevel: 'silent' });
const { buildPageBlocks, dropRunningFurniture } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

const CJK = /[　-〿一-鿿＀-￯]/u;
const widthOf = (text, size) => [...text].reduce((sum, character) => sum + (CJK.test(character) ? size : size * 0.5), 0);
/** One pdf.js text item. */
const run = (str, x, y, size = 10, extra = {}) => ({ str, transform: [size, 0, 0, size, x, y], width: widthOf(str, size), height: size, hasEOL: false, ...extra });
const rightAligned = (str, right, y, size = 10) => run(str, right - widthOf(str, size), y, size);
/** Greedy wrap into lines of at most `width`, like a word processor. */
function wrap(text, x, y, width, size = 10, pitch = 15) {
  const items = []; let line = '';
  for (const character of text) {
    if (widthOf(line + character, size) > width) { items.push(run(line, x, y, size)); y -= pitch; line = character; } else line += character;
  }
  if (line) items.push(run(line, x, y, size));
  return items;
}
const text = items => buildPageBlocks(items, 1).blocks.map(block => block.text);
const PARAGRAPH = '负责公司核心产品的规划与迭代，主导用户增长项目，带领六人团队完成从需求调研到上线的全流程，季度活跃用户提升百分之三十五，并推动建立数据驱动的决策机制。';

test('text drawn twice for simulated bold is read once', () => {
  assert.deepEqual(text([run('张三', 50, 780, 20), run('张三', 50.4, 780, 20), run('工作经历', 50, 740, 13), run('工作经历', 50.4, 740.3, 13)]), ['张三', '工作经历']);
});

test('a title keeps its right-aligned date on the same line, and a wrapped paragraph is one line', () => {
  const lines = text([run('工作经历', 50, 760, 13), run('某科技有限公司 高级产品经理', 50, 740, 11), rightAligned('2021.03 - 至今', 545, 740),
    ...wrap(PARAGRAPH, 50, 722, 495), run('另一家公司 产品经理', 50, 680, 11), rightAligned('2018.07 - 2021.02', 545, 680)]);
  assert.deepEqual(lines, ['工作经历', '某科技有限公司 高级产品经理 2021.03 - 至今', PARAGRAPH, '另一家公司 产品经理 2018.07 - 2021.02']);
});

test('a sidebar is read before the main column instead of line by line across both', () => {
  const sidebar = ['联系方式', '电话 139-0000-0000', 'lisi@example.com', '技能', 'Python / SQL', '数据分析'].map((value, index) => run(value, 40, 740 - index * 18, index % 3 === 0 ? 12 : 10));
  const main = [run('工作经历', 200, 740, 13), run('某互联网公司 数据分析师', 200, 720, 11), rightAligned('2020.01 - 至今', 555, 720),
    ...wrap('搭建业务指标体系与自动化报表，支持运营决策；建立用户分群模型，使营销触达成本下降。', 200, 702, 355),
    run('教育背景', 200, 650, 13), run('某某大学 统计学 硕士', 200, 630, 11), rightAligned('2016.09 - 2018.06', 555, 630)];
  const lines = text([run('李四', 40, 790, 18), ...sidebar, ...main]);
  assert.deepEqual(lines, ['李四', '联系方式', '电话 139-0000-0000', 'lisi@example.com', '技能', 'Python / SQL', '数据分析', '工作经历',
    '某互联网公司 数据分析师 2020.01 - 至今', '搭建业务指标体系与自动化报表，支持运营决策；建立用户分群模型，使营销触达成本下降。', '教育背景', '某某大学 统计学 硕士 2016.09 - 2018.06']);
  assert.equal(buildPageBlocks([run('李四', 40, 790, 18), ...sidebar, ...main], 1).columnCandidate, true);
});

test('a centered header stays first above two equal columns whose lines happen to align', () => {
  const column = (x, title, rows, next, more) => [run(title, x, 720, 13), ...rows.map((value, index) => run(value, x, 700 - index * 15)),
    run(next, x, 640, 13), ...more.flatMap((value, index) => wrap(value, x, 620 - index * 15, 230))];
  const lines = text([run('陈七', 277, 780, 20), run('电话 136-0000-0000 · chenqi@example.com', 190, 760),
    ...column(50, '教育背景', ['某某大学 软件工程 本科', '2015.09 - 2019.06', 'GPA 3.7/4.0'], '技能', ['Java、Go、MySQL', 'Kubernetes、Docker']),
    ...column(310, '工作经历', ['某云计算公司 后端工程师', '2019.07 - 至今', '负责计费系统的设计与开发。'], '项目', ['分布式任务调度平台', '设计并实现基于 etcd 的任务调度，使任务延迟降低一半。'])]);
  assert.deepEqual(lines.slice(0, 2), ['陈七', '电话 136-0000-0000 · chenqi@example.com']);
  assert.deepEqual(lines.slice(2, 8), ['教育背景', '某某大学 软件工程 本科', '2015.09 - 2019.06', 'GPA 3.7/4.0', '技能', 'Java、Go、MySQL']);
  assert.ok(lines.indexOf('工作经历') > lines.indexOf('Kubernetes、Docker'));
  assert.ok(lines.includes('设计并实现基于 etcd 的任务调度，使任务延迟降低一半。'));
});

test('label and value pairs in a grid stay row by row', () => {
  const grid = [['姓名：周八', '性别：男'], ['出生年月：1996.05', '政治面貌：群众'], ['电话：135-0000-0000', '邮箱：zhouba@example.com']]
    .flatMap(([left, right], index) => [run(left, 50, 740 - index * 18), run(right, 300, 740 - index * 18)]);
  assert.deepEqual(text([run('个人信息', 50, 770, 16), ...grid]), ['个人信息', '姓名：周八 性别：男', '出生年月：1996.05 政治面貌：群众', '电话：135-0000-0000 邮箱：zhouba@example.com']);
});

test('letter-spaced Chinese gains no spaces, Latin words keep theirs, and watermarks are dropped', () => {
  const glyphs = []; let x = 50;
  for (const character of '负责前端架构升级') { glyphs.push(run(character, x, 700)); x += 10.8; }
  const words = []; x = 50;
  for (const word of ['React', '/', 'TypeScript']) { words.push(run(word, x, 680)); x += widthOf(word, 10) + 2.8; }
  const watermark = { str: '简历模板网', transform: [28, 28, -28, 28, 200, 400], width: 200, height: 40, hasEOL: false };
  assert.deepEqual(text([...glyphs, ...words, watermark]), ['负责前端架构升级', 'React / TypeScript']);
});

test('separate bullets and sentence ends keep their line breaks', () => {
  const lines = text([run('• 负责移动端交易流程优化，设计并落地实验平台，转化率提升百分之十二，复购率提升百分之八，客诉', 50, 700),
    run('• 搭建数据看板。', 50, 685), run('主导内部知识库系统重构，引入全文检索与权限分级，检索时间从两秒降至两百毫秒以内。', 50, 660),
    run('获得年度最佳项目奖', 50, 645)]);
  assert.equal(lines.length, 4);
});

test('a running header and page number repeated on every page are kept once', () => {
  const page = number => ({ bottom: 0, top: 842, blocks: [
    { kind: 'pdf', pageNumber: number, text: '孙九 | 个人简历', bbox: { x: 50, y: 812, width: 80, height: 9 } },
    { kind: 'pdf', pageNumber: number, text: number === 1 ? '项目经历' : '获奖情况', bbox: { x: 50, y: 772, width: 52, height: 13 } },
    { kind: 'pdf', pageNumber: number, text: `${number}/2`, bbox: { x: 530, y: 30, width: 15, height: 9 } }] });
  assert.deepEqual(dropRunningFurniture([page(1), page(2)]).map(block => block.text), ['孙九 | 个人简历', '项目经历', '1/2', '获奖情况']);
  assert.deepEqual(dropRunningFurniture([page(1)]).map(block => block.text), ['孙九 | 个人简历', '项目经历', '1/2']);
});

test('pathological input stays bounded', () => {
  const many = Array.from({ length: 3000 }, (_, index) => run(`第${index}行`, 50 + (index % 3) * 180, 800 - Math.floor(index / 3) * 0.8, 6));
  const started = Date.now();
  const blocks = buildPageBlocks(many, 1).blocks;
  assert.ok(blocks.length > 0);
  assert.ok(Date.now() - started < 5000);
});

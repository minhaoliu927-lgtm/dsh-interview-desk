<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/brand/logo-white.svg">
    <img src="assets/brand/logo-black.svg" alt="职镜AI" width="330" height="96">
  </picture>
</p>

<h1 align="center">职镜AI</h1>

<p align="center"><b>真实而优秀的人，永远值得被世界看见</b></p>

<p align="center">DeepSeek Harness 的一个求职插件。贴上岗位要求，放进简历，评个分，面一场，再看复盘。</p>

<p align="center">
  <a href="#三步上手">安装</a> ·
  <a href="#语音面试">接语音</a> ·
  <a href="#要花钱吗">要花钱吗</a> ·
  <a href="#问答">问答</a> ·
  <a href="#开发">开发</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-interview-desk"><img alt="npm" src="https://img.shields.io/npm/v/dsh-interview-desk?style=flat-square&color=202724&label=npm"></a>
  <img alt="DeepSeek Harness 0.2.x" src="https://img.shields.io/badge/DeepSeek%20Harness-0.2.x-202724?style=flat-square">
  <img alt="Mac 与 Windows 桌面版" src="https://img.shields.io/badge/Mac%20%C2%B7%20Windows-%E6%A1%8C%E9%9D%A2%E7%89%88-202724?style=flat-square">
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/MIT-%E5%BC%80%E6%BA%90-202724?style=flat-square"></a>
</p>

<br>

## 它是什么

装在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 侧栏里的「职镜」。你想面哪个岗位，就把那份岗位要求贴进来，再放一份简历。先给简历打个分，再跟面试官练一场。默认是语音面试，5 道题，题目从你的简历和这个岗位里来。

四个页面：**首页 · 面试 · 复盘 · 资料**。界面有中文和英文，跟着 DeepSeek Harness 的语言走。

AI 只会让真实的个体更加珍贵。职镜改简历只动措辞和顺序，不替你编经历；面试报告只看你自己确认过的回答。

<br>

## 怎么用

**1. 岗位和简历。** 岗位要求直接粘贴，或者读一个公开的招聘链接。简历拖进 PDF 或 Word，显示成一张文件卡，点「预览」用系统自带的应用打开原件。

**2. 简历评分。** 对照岗位占 65%，简历本身占 35%，80 分过关。每一项都附上原文里的依据。不到 80，可以照建议改一版：勾选要的改动，存成新版本再评一次；也可以自己改，或者看过分数直接去面。评一次一般要半分钟到一分半，看你在 DeepSeek Harness 里选的模型。

**3. 模拟面试。** 面试官在左，你在右，中间那道光跟着谁在说话变亮。可以插话、打断，也可以换成文字面试。

**4. 复盘。** 每场面试一张卡片：继续、看报告、导出 PDF。首页能看到最近几场的分数走向，和当前简历离 80 还差多少。

<br>

## 三步上手

要求 DeepSeek Harness `0.2.2-rc.1` 及以上的 `0.2.x`。在 Mac 桌面版 `0.2.2-rc.3` 和 Windows 桌面版上用过。

**1. 安装。** 打开 DeepSeek Harness 的「插件」→「添加插件」，输入包名 `dsh-interview-desk`，点安装，再点「立即启用」。

也可以用命令行。桌面版先完全退出再装，装好重新打开；网页版装好后重启 `dsh web`。

```bash
dsh plugin --profile desktop add dsh-interview-desk
```

```bash
dsh plugin --profile web add dsh-interview-desk
```

用过职镜自己的插件索引的，地址不变，装的是同一个 npm 包：

```
https://raw.githubusercontent.com/minhaoliu927-lgtm/dsh-interview-desk/main/index.json
```

**2. 打开。** 侧栏出现「职镜」，点开是首页。点「准备第一场面试」，从岗位要求开始。

**3. 接语音（可选）。** 想用语音面，点右上角的「语音未接入」，照下一节填好。不接也能用文字面试。

有新版本时，插件页会显示可更新，点一下就行；用命令行装的，重跑一次上面的命令。离线安装可以到 [Releases](https://github.com/minhaoliu927-lgtm/dsh-interview-desk/releases/latest) 下载 `.tgz`，在「添加插件」里填它的完整路径。

<br>

## 语音面试

文字部分用你在 DeepSeek Harness 里配好的模型。实时语音要一个能同时听和说的服务，现在接的是阿里云百炼的 Qwen-Omni-Realtime。

点右上角的语音状态或「设置」，在设置窗里：

1. **地域**：北京或新加坡，和 API Key 在同一个地域。
2. **业务空间 ID**：百炼控制台左上角 →「业务空间详情」。只填 Key 连不上。
3. **API Key**：只存在这台电脑的 DeepSeek Harness 凭据里，保存后不再显示。
4. **测试连接**：面试官会说一句固定的话，通过后可以「试听」。

右上角有四种状态：已接入、测试未通过、待测试、未接入。测试通过才算接入。没通过时，设置窗和面试页都会写出原因和代码，比如 `provider-error`，提 Issue 时带上它就行。

麦克风在开始面试时才打开。一场通话最长 30 分钟。录音不长期保存，留下的是转写和你改过的回答。

<br>

## 要花钱吗

插件免费开源，不带任何密钥。用到模型的地方，走你自己的账号。

| | 用什么 | 不接会怎样 |
| --- | --- | --- |
| **简历评分、改写、报告、文字面试** | DeepSeek Harness 里已经配好的文字模型 | 这些都用不了 |
| **语音面试** | 你自己的百炼业务空间和 API Key，按百炼的价格计费 | 换成文字面试 |

「测试连接」会真的生成一句语音，可能产生一点费用。

<br>

## 问答

<details>
<summary><b>上传后为什么看不到识别出的文字？</b></summary>
<br>

你看到的是文件本身，点「预览」就能对着原件看。评分和面试用的是从文件里读出的文字，收在资料页的「识别出的文字（评分和面试用）」里，需要时再展开。

</details>

<details>
<summary><b>图片和扫描件能导入吗？</b></summary>
<br>

文字型的 PDF 和 Word 都可以。图片和扫描件要先做文字识别：Windows 用系统自带的识别，Mac 上暂时还不行，可以先粘贴正文。单个文件最多 25 MB。

</details>

<details>
<summary><b>改简历会不会替我编经历？</b></summary>
<br>

不会。改写只动措辞、顺序和格式；改出了原文没有的事实、数字或技能，这一版就不用。评分里的每条依据，都要能在你的原文里找到。

</details>

<details>
<summary><b>评分报错怎么办？</b></summary>
<br>

提示里会带一个代码，比如 `MODEL_FAILED`。多数时候再评一次就好。一直不行，换个模型试试；推理型模型会先想一会儿，明显更慢。

</details>

<details>
<summary><b>我的东西存在哪？</b></summary>
<br>

都在本机 DeepSeek Harness 的数据目录里（默认 `~/.dsh/zhijing/`）。API Key 由 DeepSeek Harness 的凭据保管，不进插件的数据库，也不进安装包。没有云端，没有账号系统。

分析时，选定的资料会发给你在 DeepSeek Harness 里配的模型；语音面试时，这一场的资料和你的声音会发给百炼。

</details>

<details>
<summary><b>版本号怎么变成 0.2.0 了？</b></summary>
<br>

以前的 `0.1.0-dev.N` 是开发预览，npm 上只发过 `0.1.0-dev.11`。从 `0.2.0` 起，GitHub 上的版本和 npm 上的一一对应，往后是 `0.2.1`、`0.3.0` 这样往上走。

</details>

<details>
<summary><b>以前装过 dsh-interview 或 dsh-zhijing？</b></summary>
<br>

先在插件页卸载旧名的插件，再装 `dsh-interview-desk`。资料还在原来的数据目录，语音设置要在设置窗里重新保存一次。不要同时启用两个名字的插件。

</details>

<details>
<summary><b>这是 DeepSeek 做的吗？</b></summary>
<br>

不是，是社区插件。文字部分用你在 DeepSeek Harness 里配置的模型，语音用你自己的百炼账号，各自按自己的条款计费。

</details>

<br>

## 开发

需要 Node.js 24.9 及以上和 pnpm。

```bash
pnpm install --frozen-lockfile
pnpm test                        # 全部测试
pnpm run build                   # 打包界面，生成文档解析模块
node scripts/audit-package.mjs   # 检查安装包里只有该有的文件
node scripts/preview/build.mjs   # 不开 DeepSeek Harness 也能看界面
```

预览打包到 `.preview/`，用本地静态服务打开 `index.html`（麦克风需要 http，不能直接双击）。地址参数：`theme=dark` 深色，`lang=en` 英文，`seed=history` 有面试记录的老用户，`voice=off` / `voice=fail` 语音未接入 / 测试没通过，`page=interview` 直接打开某一页。预览里的宿主是假的，不随插件发布。Windows 上装依赖遇到硬链接报错，加 `--package-import-method=copy`。

**发版。** 改 `package.json` 里的版本号，合进 `main`。GitHub Actions 会构建、跑测试、检查安装包，然后发到 npm，打 `v版本号` 标签、建 Release（附 `.tgz` 和 `.sha256`），最后把 `index.json` 改成新版本。npm 上已经有的版本不会再发一次；中途失败，在 Actions 里重跑「Release」就会接着做没做完的步骤。Release 的说明取自改版本号的那次提交。带 `-` 的预发布版本（如 `0.3.0-rc.1`）发到 npm 的 `next` 标签，不影响 `latest`。

发包用 npm 的 Trusted Publishing，仓库里不存 npm token。维护者只需要在 npmjs.com 的包设置里加一次：Trusted Publisher → GitHub Actions，填 `minhaoliu927-lgtm`、`dsh-interview-desk`、`release.yml`，Environment 留空。

| 目录 | 内容 |
| --- | --- |
| `client/` | 界面：首页、面试、复盘、资料、面试间、语音、设置窗 |
| `src/` | Host 接口、资料存储、模型调用、文档解析、实时语音 |
| `skills/` | 随插件提供的求职 skill |
| `locale/` | 中文和英文文案 |
| `scripts/` | 打包、安装包审计、公开源码导出、插件索引 |
| `test/` | 测试 |
| `assets/` | 标志和 Noto 中文字体（保留原许可） |
| `.github/workflows/` | CI 和自动发版 |

`src/materials/runtime/` 是从 `src/materials/vendor/` 生成的，改了 vendor 要重新构建。改了 `src/` 要重启 DeepSeek Harness。

<br>

## 反馈

有问题欢迎提 [Issue](https://github.com/minhaoliu927-lgtm/dsh-interview-desk/issues)，写上 DeepSeek Harness 版本、系统、怎么操作的和看到的提示。别贴 API Key、完整简历和没检查过的日志。

## 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)：开放的插件系统，职镜才装得进去。
- [dsh-media-desk](https://github.com/woniuniuniu/dsh-media-desk)：设置窗、助手栏和插件索引的做法参考了它。
- [dsh-Go](https://github.com/ccch1mneyyy/dsh-Go)：这份 README 的写法参考了它和 dsh-media-desk。
- [Noto CJK](https://github.com/notofonts/noto-cjk)：导出 PDF 用的中文字体，保留 SIL Open Font License 1.1。

第三方代码和字体的许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

<br>

<p align="center"><sub><a href="LICENSE">MIT</a> · 社区插件，与 DeepSeek 无关。DeepSeek Harness 的名称和标识归其所有者所有。</sub></p>

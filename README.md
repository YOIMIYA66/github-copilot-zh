<div align="center">

# GitHub Copilot Desktop 中文汉化层
### GitHub Copilot Desktop UI in Chinese

[![Platform](https://img.shields.io/badge/Platform-Windows%20(WebView2)-0078D4?logo=windows)](https://learn.microsoft.com/microsoft-edge/webview2/)
[![Target](https://img.shields.io/badge/Copilot%20Desktop-1.4.2-24292F?logo=githubcopilot)](https://github.com/features/copilot)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2022-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PowerShell](https://img.shields.io/badge/PowerShell-%E2%89%A5%207-5391FE?logo=powershell&logoColor=white)](https://github.com/PowerShell/PowerShell)
[![Dependencies](https://img.shields.io/badge/Runtime%20Deps-0-success)](#环境要求)
[![Status](https://img.shields.io/badge/Status-Source%20Preview-orange)](#中文)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

**[中文文档](#中文) | [English Documentation](#english)**

</div>

---

## 中文

> [!IMPORTANT]
> **源码预览版（Source Preview）：** 汉化层已在运行中的应用上进行部分验证，但普通启动器的完整启动流程尚未端到端测试，翻译覆盖也尚不完整。开发目标为 Windows 上使用 WebView2 的 **GitHub Copilot desktop 1.4.2**（这不代表该版本完全兼容；桌面应用、WebView2 DOM 和调试接口均可能随时变化，其他版本尚未测试）。

本项目通过精细的 DOM 结构白名单与**纯手工编写的中文词典**，为 GitHub Copilot 桌面端提供非侵入式的设置与固定界面内存汉化层。

### ✨ 核心特性

- **纯人工词典，零外部服务**：不使用机器翻译、不下载模型、不需要 API 密钥，运行时**零 npm 生产依赖**。
- **非侵入式内存覆盖**：不修改应用程序可执行文件（`github.exe`）或安装目录文件；按 `Ctrl+C` 或正常重启应用即可完全还原。
- **严格的翻译边界**：翻译已确认归属的设置文案、静态导航与 Composer 标签，以及通过触发器和菜单 ID 双向关联确认的固定菜单项与说明。聊天正文、工具输出、思考状态、代码、个人输入/资料、计数和动态模式/模型名称保持原文。
- **多重安全校验**：启动与连接前后验证 `github.exe`（GitHub, Inc.）与 `msedgewebview2.exe`（Microsoft Corporation）的 Authenticode 数字签名、进程树归属、页面 Origin（`http://tauri.localhost`）及 `127.0.0.1` 回环绑定。
- **按需监听与分批处理**：观察窄范围固定控件根、主容器的直接子节点，以及已验证关联的打开菜单；不观察对话正文子树。设置和菜单变化按有限批次（每批最多 150 节点 / 4 毫秒时间片）处理。

### 🎯 翻译范围与性能样本

| 类别 | 处理策略 | 具体内容 |
| :--- | :--- | :--- |
| **✅ 翻译内容** | 结构白名单 + 人工词典精确匹配 | 设置导航、分类标题、选项标签、说明、受支持的跨节点段落；侧栏 Automations/Customize、Composer 的 Background/Artifacts 标签；以及双向 ID 关联验证的模式、模型、上下文和账户菜单固定文案 |
| **🛡️ 保留原样** | 显式排除，绝不触碰或修改 | 聊天正文、Thinking（思考）和其他状态标签、工具输出、工作区内容、代码块（`code`/`pre`）、键盘按键（`kbd`）、用户输入、项目/仓库/个人资料、计数，以及 Interactive/Plan/Autopilot、模型和级别名称 |

部分归属无法确认的工具提示保留英文；例如 Max 级别的独立详情提示暂不翻译，因为无法验证它与具体菜单选项之间的可访问名称关联。

**性能设计说明：** 这种设计不保证零开销，也不保证所有设备上都流畅。使用 `npm run benchmark` 可以检查合成聊天正文更新是否触发设置/固定界面扫描，并报告 JSDOM 合成 DOM 的批次耗时；这不是 WebView2 实测或 CPU 基准，也不代表实际使用延迟。

| 合成基准场景 | 采样指标 | 结果数据 |
| :--- | :--- | :--- |
| **5,000 个合成聊天节点、1,000 次聊天更新（设置关闭）** | 设置扫描 / 固定界面扫描；本次耗时 | `0` / `0`；约 `197.76 ms` |
| **5,000 个合成聊天节点、1,000 次聊天更新（设置打开）** | 设置扫描 / 固定界面扫描；本次耗时 | `0` / `0`；约 `199.97 ms` |
| **1,201 个合成设置元素（300 行），首次翻译至末项完成** | 加入设置窗口至末项翻译完成 | 约 `179.04 ms` |
| **1,201 个合成设置元素、1,000 次设置标签更新** | 处理批次 p95/最大值；观察器回调 p95/最大值 | `4.02/4.28 ms`；`0.09/4.05 ms` |

以上是单次 Node/JSDOM 合成运行样本；耗时会随机器和负载变化，不能与真实 WebView2 或页面渲染耗时等同。

---

### 📋 环境要求

- **操作系统与应用**：Windows，以及使用 WebView2 的 **GitHub Copilot desktop**（目标开发版本 `1.4.2`）。
- **PowerShell**：PowerShell 7 或更高版本（`pwsh`）。
- **Node.js**：Node.js 22 或更高版本（运行时无任何 npm 生产依赖）。
- **Git**：用于克隆本项目仓库。

---

### 🚀 安装与使用

> [!NOTE]
> 以下步骤使用源码预览版。正常启动器通过新启动应用完成整个流程尚未端到端验证。**运行前请先保存工作并正常退出 Copilot**；不要强制结束 Copilot，也不要关闭操作系统安全防护。

#### 1. 克隆并启动

```powershell
git clone https://github.com/YOIMIYA66/github-copilot-zh.git
Set-Location .\github-copilot-zh
# 执行启动器前请先审阅下载的源代码与许可证 (LICENSE)
pwsh -NoProfile -File .\start.ps1
```

- **自定义安装路径**：默认可执行文件路径为 `%LOCALAPPDATA%\Programs\GitHub Copilot\github.exe`。如果安装在其他位置，请使用 `-AppPath` 参数传入实际路径：
  ```powershell
  pwsh -NoProfile -File .\start.ps1 -AppPath "D:\CustomPath\GitHub Copilot\github.exe"
  ```
- **运行机制**：启动器会验证已安装可执行文件的 Authenticode 签名，以回环地址（`127.0.0.1`）WebView2 调试端口启动新的应用进程，并在连接前后验证监听进程的父子归属和签名。**它不会附加到已运行的应用**。使用 Copilot 时请保持终端窗口打开。

#### 2. 停止与还原

- 在终端按 **`Ctrl+C`** 即可卸载汉化层并自动还原已翻译的页面文本。
- 正常退出 Copilot 并从常用快捷方式重新启动，即可彻底移除调试端口。
- 如果启动器或连接意外退出，正常退出并重新启动应用即可清除内存中的汉化层。此工具不会更改任何设置值。

---

### 🔒 安全与故障排除

> [!WARNING]
> **本地调试端口安全提示：** WebView2 调试端口不进行身份验证。当调试启用时，以当前系统用户身份运行的其他本地进程可能查看或修改应用。请仅在可信设备上使用，并在使用完毕后正常关闭应用。CDP 和 WebView2 调试参数并非稳定的 Copilot 官方 API。

- **提示已有 `github.exe` 进程**：请先保存工作并正常退出已打开的 Copilot 应用，然后再重试（启动器不会强制终止已有进程）。
- **校验失败退出**：如果签名、监听进程、页面身份或连接检查失败，启动器会立即停止，不会连接未知目标，也不会终止应用。
- **界面仍为英文或控件异常**：请停止汉化层并正常重启应用；目标应用版本或页面 DOM 结构可能已发生变化。

---

### 🤖 让 AI 助手协助安装

你可以将以下提示词复制给能够访问你电脑的本地 AI 助手（如 Claude Code、Copilot CLI、Cursor 等）：

```text
请帮我从以下仓库安装 GitHub Copilot 桌面端界面汉化：
https://github.com/YOIMIYA66/github-copilot-zh。
首先检查 Windows、GitHub Copilot desktop 版本、WebView2、PowerShell 和 Node.js。
阅读该仓库的 README，检查源代码和许可证，并在执行任何操作前确认安装说明和项目 URL。
如实说明未验证或预览版的状态，并告知我应用版本是否尚未验证。请保存我的工作，
不要强制关闭 Copilot、关闭安全防护、泄露凭据或执行未经检查的远程脚本。
只有在我同意安全风险后，才使用仓库中记录的安装入口。
验证设置和已支持的静态界面标签/说明已翻译；聊天正文、工具输出、Thinking 等状态标签以及模式/模型专有名称仍保持原样。
报告任何失败或不确定之处，并说明如何停止和还原应用。
```

---

### 🛠️ 开发与诊断

#### 运行测试与基准

`npm install` 仅安装开发阶段测试所需的 `jsdom` 及其传递依赖（许可证信息记录在 `package-lock.json` 中）：

```powershell
npm install
npm test           # 运行隔离单元测试
npm run benchmark  # 运行合成 DOM 基准测试（非 WebView2 实测结果，不代表实际使用延迟）
```

#### 诊断附加模式（Diagnostic Attachment）

仅在用户明确同意且没有其他汉化层运行时，开发者可以附加到现有**已启用调试**的 Copilot 进程，而无需重启或刷新应用（此操作不测试普通启动器）。请提供实际回环调试端口和已签名 Copilot 进程的 PID：

```powershell
$port = 12345 # 替换为已验证的回环调试端口
$appPid = 1234 # 替换为已验证的 GitHub Copilot 进程 ID
$app = Get-CimInstance Win32_Process -Filter "ProcessId=$appPid"
node .\src\diagnose.js install $port $appPid $app.ExecutablePath
node .\src\diagnose.js status $port $appPid $app.ExecutablePath
node .\src\diagnose.js stop $port $appPid $app.ExecutablePath
```

- **安全校验**：每条命令在附加前都会验证回环监听、WebView2 签名和进程归属、已签名应用进程以及页面目标。安装仅影响当前页面，不会为后续导航注册脚本。`stop` 会还原诊断汉化层的修改，不关闭应用，也不停止其他汉化层。
- **隐私保护指标**：`status` 仅返回 `settingsScans`、`portalScans`、`chromeScans`、`callbacks`、未匹配翻译的不同合格固定文本节点累计数，以及最多最近 512 个 `batchMs` 和 `callbackMs` 样本（毫秒）。**它不返回任何页面文本、账号详情、路径或输入值**。未匹配数仅涵盖支持的结构白名单（可能包含文本片段），**不是**所有未翻译界面的数量；数值为零不代表翻译覆盖完整。

---

## English

> [!IMPORTANT]
> **Source preview:** The overlay has been partially checked in a running application, but the normal launcher has not been tested end to end. Translation coverage is incomplete. The development target is **GitHub Copilot desktop 1.4.2** on Windows using WebView2 (this is not a claim of full version compatibility; the desktop app, WebView2 DOM, and debugging interface may change without notice, and other versions have not been tested).

This project translates selected fixed Settings text and verified static desktop UI in GitHub Copilot desktop using a strict structural allowlist and a **hand-written Chinese dictionary**.

### ✨ Key Features

- **Hand-Written Dictionary, Zero External Calls**: Does not use machine translation, download a model, or require an API key. Zero npm production dependencies at runtime.
- **Non-Invasive In-Memory Overlay**: Never modifies the application executable (`github.exe`) or installation files. Press `Ctrl+C` or restart the app normally to restore everything cleanly.
- **Strict Translation Boundaries**: Translates fixed Settings text, static sidebar and Composer labels, and fixed copy in menus whose triggers and menu IDs are bidirectionally verified. Chat messages, tool output, Thinking/status labels, code, personal input/profile data, counts, and dynamic mode/model names stay unchanged.
- **Multi-Layer Security Verification**: Verifies Authenticode signatures for both `github.exe` (`GitHub, Inc.`) and `msedgewebview2.exe` (`Microsoft Corporation`), process ancestry, page origin (`http://tauri.localhost`), and `127.0.0.1` loopback binding before and after connecting.
- **Scoped Observation & Bounded Batching**: Observes narrow fixed-control roots, direct children of the main container, and verified open menus; it does not observe the conversation body subtree. Settings and menu changes are processed in bounded batches (up to 150 nodes or 4 ms per slice).

### 🎯 Translation Scope & Sample Metrics

| Category | Policy | Details |
| :--- | :--- | :--- |
| **✅ Translated** | Structural allowlist + exact dictionary match | Settings navigation, section headers, titles and descriptions; supported split paragraphs; sidebar Automations/Customize; Composer Background/Artifacts labels; and fixed copy in bidirectionally verified mode, model, context, and profile menus |
| **🛡️ Untouched** | Explicitly excluded & protected | Chat messages, Thinking and other status labels, tool output, workspace content, code blocks (`code`/`pre`), keyboard shortcuts (`kbd`), user input, project/repository/profile data, counts, and names such as Interactive/Plan/Autopilot, models, and tiers |

Tooltips with unverified ownership remain in English. For example, the standalone Max-tier details tooltip is not translated because its accessible-name relationship to a specific menu option has not been verified.

**Performance Note:** This design does not guarantee zero overhead or smooth rendering on every device. `npm run benchmark` checks whether synthetic chat-body updates trigger Settings or fixed-UI scans and reports batch timings on a JSDOM DOM. This is not a WebView2 measurement, CPU benchmark, or real-world latency claim.

| Synthetic Benchmark Scenario | Metric | Observed Value |
| :--- | :--- | :--- |
| **5,000 synthetic chat nodes, 1,000 chat updates (Settings closed)** | Settings scans / fixed-UI scans; elapsed in this run | `0` / `0`; about `197.76 ms` |
| **5,000 synthetic chat nodes, 1,000 chat updates (Settings open)** | Settings scans / fixed-UI scans; elapsed in this run | `0` / `0`; about `199.97 ms` |
| **1,201 synthetic Settings elements (300 rows), initial translation through last item** | From dialog insertion to last translation | About `179.04 ms` |
| **1,201 synthetic Settings elements, 1,000 fixed-label updates** | Batch p95/max; observer callback p95/max | `4.02/4.28 ms`; `0.09/4.05 ms` |

---

### 📋 Requirements

- **OS & Application**: Windows, and **GitHub Copilot desktop** with WebView2 (target version `1.4.2`).
- **PowerShell**: PowerShell 7 or newer (`pwsh`).
- **Node.js**: Node.js 22 or newer (the runtime has no npm production dependencies).
- **Git**: A normal Git installation to clone the project.

---

### 🚀 Installation and Use

> [!NOTE]
> These steps use the source preview. The normal launcher has not yet been validated end to end with a newly started application. **Save your work and exit Copilot normally before running it.** Do not terminate Copilot forcibly or disable operating-system security.

#### 1. Clone and Launch

```powershell
git clone https://github.com/YOIMIYA66/github-copilot-zh.git
Set-Location .\github-copilot-zh
# Review the downloaded source and license before executing the launcher.
pwsh -NoProfile -File .\start.ps1
```

- **Custom Installation Path**: The default executable is under `%LOCALAPPDATA%\Programs\GitHub Copilot\github.exe`. For another installation location, pass the actual executable path with `-AppPath`:
  ```powershell
  pwsh -NoProfile -File .\start.ps1 -AppPath "D:\CustomPath\GitHub Copilot\github.exe"
  ```
- **How It Works**: Keep the terminal open while using Copilot. The launcher checks the installed executable's Authenticode signature, starts a new application process with a loopback (`127.0.0.1`) WebView2 debugging port, and checks the listener's process ancestry and signature before connecting. **It refuses to attach to an existing app.**

#### 2. Stop and Restore

- Press **`Ctrl+C`** in the terminal to request restoration of translated text.
- Exit Copilot normally and start it from its usual shortcut to remove the debug port as well.
- If the launcher or connection exits unexpectedly, normal app exit and restart clears the in-memory overlay. No settings values are intended to be changed.

---

### 🔒 Security and Troubleshooting

> [!WARNING]
> **Local Debugging Port Notice:** The debugging port is unauthenticated—other processes running as your user may be able to inspect or modify the application while debugging is enabled. Use it only on a trusted machine and close the app normally when finished. CDP and the WebView2 debug arguments are not stable Copilot APIs.

- **Existing `github.exe` process reported**: Save your work and exit that application normally before retrying (the launcher never terminates existing processes).
- **Verification or connection failure**: If signature, listener, page identity, or connection checks fail, the launcher stops instead of connecting to an unrecognized target. It does not terminate the app.
- **Labels remain English or controls behave unexpectedly**: Stop the overlay and restart the app normally; the target version or DOM markup may have changed.

---

### 🤖 Ask an AI Assistant to Help Install

Copy this prompt to an AI assistant with access to your computer:

```text
Help me install the GitHub Copilot desktop UI translation from
https://github.com/YOIMIYA66/github-copilot-zh.
First check Windows, my GitHub Copilot desktop version, WebView2, PowerShell,
and Node.js. Read that repository's README, review its source and license, and
confirm the installation instructions and project URL before executing
anything. Treat an unverified or pre-release version as such and tell me if
the app version has not been validated. Save my work, and do not force-close
Copilot, disable security, expose credentials, or execute an unreviewed remote
script. Follow the repository's documented installation entry point only if I
approve the security risks. Verify that Settings and supported static UI labels/descriptions are translated;
chat messages, tool output, Thinking/status labels, and mode/model names remain
unchanged. Report any
failure or uncertainty and explain how to stop and restore the app.
```

---

### 🛠️ Development

#### Tests and Benchmark

`npm install` installs the development-only `jsdom` dependency and its transitive dependencies, whose license information is recorded in `package-lock.json`:

```powershell
npm install
npm test           # Run isolated unit tests
npm run benchmark  # Run synthetic DOM benchmark (not a WebView2 measurement or real-world latency claim)
```

#### Diagnostic Attachment

Only with the user's explicit consent, and with no other translation overlay active, a developer can attach to an existing **already-debuggable** Copilot process without restarting or refreshing it (this does not test the normal launcher). Supply the actual debug port and signed Copilot process ID:

```powershell
$port = 12345 # Replace with the verified loopback debug port.
$appPid = 1234 # Replace with the verified GitHub Copilot process ID.
$app = Get-CimInstance Win32_Process -Filter "ProcessId=$appPid"
node .\src\diagnose.js install $port $appPid $app.ExecutablePath
node .\src\diagnose.js status $port $appPid $app.ExecutablePath
node .\src\diagnose.js stop $port $appPid $app.ExecutablePath
```

- **Verification**: Each command verifies the loopback listener, its WebView2 signature and ancestry, the signed app process, and the page target before attaching. Installation affects only the current page; it does not register a script for future navigations. `stop` restores the diagnostic overlay's changes without closing the app and does not stop unrelated overlays.
- **Privacy-Preserving Metrics**: `status` returns only `settingsScans`, `portalScans`, `chromeScans`, `callbacks`, a cumulative count of distinct eligible fixed text nodes without a matching translation, and up to the latest 512 `batchMs` and `callbackMs` duration samples. **It does not return page text, account details, paths, or input values.** The unmatched count covers only the supported structural allowlist, can include fragments, and is **not** a count of all untranslated UI; zero does not mean complete coverage.

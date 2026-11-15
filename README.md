# GitHub Copilot desktop settings in Chinese

[中文](#中文) | [English](#english)

## 中文

> **源码预览版：**汉化层已在运行中的应用上进行部分验证，但普通启动器的完整启动流程尚未端到端测试，翻译覆盖也尚不完整。

本项目使用人工中文词典，翻译部分固定的设置标签和说明。不翻译聊天、思考标签、工作区内容，以及用户提供的名称和数值。不使用机器翻译、不下载模型、不需要 API 密钥，也不修改应用程序可执行文件。

开发目标为 Windows 上使用 WebView2 的 **GitHub Copilot desktop 1.4.2**。部分汉化层功能已通过附加到该运行版本进行验证；普通安装和启动器流程尚未验证。这不代表该版本完全兼容。桌面应用、WebView2 DOM 和调试接口均可能随时变化，其他版本尚未测试。

仅翻译识别为固定界面的设置标签和说明。只有能确认归属于设置的菜单才会翻译；部分工具提示和其他未识别文本会保留英文。

汉化层观察应用的 portal 容器，而不是聊天树；设置变化按有限批次处理。这种设计不保证零开销，也不保证所有设备上都流畅。在一次实机样本中，关闭设置后约八秒内设置扫描和观察器回调均为零。在一次切换十个页面的样本中，55 个处理批次的 p95 约为 1.2 毫秒、最大为 1.7 毫秒；64 次观察器回调的 p95 约为 0.7 毫秒、最大为 1.9 毫秒。这些只是单次样本，不是 CPU 基准测试，也不能保证其他设备和工作负载有相同表现。

### 环境要求

- Windows、使用 WebView2 的 GitHub Copilot desktop，以及 PowerShell 7 或更高版本。
- Node.js 22 或更高版本。运行时没有 npm 生产依赖。
- 用于克隆项目的 Git。

### 安装与使用

以下步骤使用源码预览版。正常启动器通过新启动应用完成整个流程尚未端到端验证。运行前请保存工作并正常退出 Copilot；不要强制结束 Copilot，也不要关闭操作系统安全防护。

```powershell
git clone https://github.com/YOIMIYA66/github-copilot-zh.git
Set-Location .\github-copilot-zh
# Review the downloaded source and license before executing the launcher.
pwsh -NoProfile -File .\start.ps1
```

使用 Copilot 时请保持终端打开。启动器会验证已安装可执行文件的 Authenticode 签名，以回环地址 WebView2 调试端口启动新的应用进程，并在连接前验证监听进程的归属和签名。它不会附加到已运行的应用。默认可执行文件位于 `%LOCALAPPDATA%\Programs\GitHub Copilot`；如果安装在其他位置，请使用 `-AppPath` 传入实际可执行文件路径。

在终端按 **Ctrl+C** 请求还原已翻译文本。正常退出 Copilot 并使用常用快捷方式重新启动，也可移除调试端口。如果启动器或连接意外退出，正常退出并重新启动应用即可清除内存中的汉化层。此工具不应更改任何设置值。

#### 安全与故障排除

调试端口不进行身份验证：调试启用时，以当前用户身份运行的其他进程可能查看或修改应用。请仅在可信设备上使用，并在完成后正常关闭应用。CDP 和 WebView2 调试参数并非稳定的 Copilot API。

如果启动时提示已有 `github.exe` 进程，请先保存工作并正常退出该应用，再重试。如果签名、监听进程、页面身份或连接检查失败，启动器会停止，而不会连接未知目标，也不会终止应用。如果标签仍为英文或控件行为异常，请停止汉化层并正常重启应用；目标版本或页面结构可能已发生变化。

### 让 AI 助手协助安装

将以下提示词复制给能够访问你电脑的 AI 助手：

```text
请帮我从以下仓库安装设置汉化：
https://github.com/YOIMIYA66/github-copilot-zh。
首先检查 Windows、GitHub Copilot desktop 版本、WebView2、PowerShell 和 Node.js。
阅读该仓库的 README，检查源代码和许可证，并在执行任何操作前确认安装说明和项目 URL。
如实说明未验证或预览版的状态，并告知我应用版本是否尚未验证。请保存我的工作，
不要强制关闭 Copilot、关闭安全防护、泄露凭据或执行未经检查的远程脚本。
只有在我同意安全风险后，才使用仓库中记录的安装入口。
验证设置标签已翻译，主页面（包括 Thinking 标签）仍为英文。
报告任何失败或不确定之处，并说明如何停止和还原应用。
```

### 开发

`npm install` 安装仅用于开发的 jsdom 及其传递依赖，许可证信息记录在 `package-lock.json` 中。运行 `npm test` 执行隔离测试，运行 `npm run benchmark` 执行合成 DOM 基准测试。该基准不是 WebView2 的测量结果，也不能代表实际使用延迟。

#### 诊断附加

仅在用户明确同意且没有其他汉化层运行时，开发者可以附加到现有**已启用调试**的 Copilot 进程，而不重启或刷新应用。此操作不测试普通启动器。请提供实际调试端口和已签名 Copilot 进程的 ID：

```powershell
$port = 12345 # Replace with the verified loopback debug port.
$appPid = 1234 # Replace with the verified GitHub Copilot process ID.
$app = Get-CimInstance Win32_Process -Filter "ProcessId=$appPid"
node .\src\diagnose.js install $port $appPid $app.ExecutablePath
node .\src\diagnose.js status $port $appPid $app.ExecutablePath
node .\src\diagnose.js stop $port $appPid $app.ExecutablePath
```

每条命令在附加前都会验证回环监听、WebView2 签名和进程归属、已签名应用进程以及页面目标。安装仅影响当前页面，不会为后续导航注册脚本。`stop` 会还原诊断汉化层的修改，不关闭应用，也不停止其他汉化层。

状态只返回扫描请求数、观察器回调次数、未匹配翻译的不同合格固定文本节点的累计数量，以及最多最近 512 个批次和回调耗时样本（毫秒）。它不返回页面文本、账号详情、路径或输入值。未匹配数仅涵盖支持的结构白名单，可能包含文本片段，**不是**所有未翻译界面的数量；零不代表覆盖完整。

## English

> **Source preview:** The overlay has been partially checked in a running
> application, but the normal launcher has not been tested end to end.
> Translation coverage is incomplete.

This project translates selected fixed settings labels and descriptions using a
hand-written Chinese dictionary. It does not translate chats, thinking labels,
workspace content, or user-provided names and values. It does not use machine
translation, download a model, require an API key, or modify the application
executable.

The development target is **GitHub Copilot desktop 1.4.2** on Windows using
WebView2. Parts of the overlay were checked by attaching to that running
version; the normal installation and launcher path have not yet been verified.
This is not a claim of full version compatibility. The desktop application,
its WebView2 DOM, and its debugging interface may change without notice.
Other versions have not been tested.

Only settings labels and descriptions identified as fixed UI are translated.
Menus are translated only when their association with Settings can be
verified; some tooltips and other unrecognized text remain English.

The overlay observes the application's portal container rather than the chat
tree. Settings changes are processed in bounded batches. This design does not
guarantee zero overhead or smooth rendering on every device. In one real-app
sample lasting eight seconds after Settings closed, no settings scans or
observer callbacks occurred. In one ten-page navigation sample,
55 processing batches had a p95 of about 1.2 ms and a maximum of 1.7 ms;
64 observer callbacks had a p95 of about 0.7 ms and a maximum of 1.9 ms.
These are individual samples, not a CPU benchmark or a guarantee for other
devices and workloads.

### Requirements

- Windows, GitHub Copilot desktop with WebView2, and PowerShell 7 or newer.
- Node.js 22 or newer. The runtime has no npm production dependencies.
- A normal Git installation to clone the project.

### Installation and use

These steps use the source preview. The normal launcher has not yet been
validated end to end with a newly started application. Save your work and exit
Copilot normally before running it. Do not terminate Copilot forcibly or disable
operating-system security.

```powershell
git clone https://github.com/YOIMIYA66/github-copilot-zh.git
Set-Location .\github-copilot-zh
# Review the downloaded source and license before executing the launcher.
pwsh -NoProfile -File .\start.ps1
```

Keep the terminal open while using Copilot. The launcher checks the installed
executable's Authenticode signature, starts a new application process with a
loopback WebView2 debugging port, and checks the listener's process ancestry
and signature before connecting. It refuses to attach to an existing app.
The default executable is under `%LOCALAPPDATA%\Programs\GitHub Copilot`;
for another installation, pass its actual executable path with `-AppPath`.

Press **Ctrl+C** in the terminal to request restoration of translated text.
Exit Copilot normally and start it from its usual shortcut to remove the debug
port as well. If the launcher or connection exits unexpectedly, normal app
exit and restart clears the in-memory overlay. No settings values are intended
to be changed.

#### Security and troubleshooting

The debugging port is unauthenticated: other processes running as your user
may be able to inspect or modify the application while debugging is enabled.
Use it only on a trusted machine and close the app normally when finished.
CDP and the WebView2 debug arguments are not stable Copilot APIs.

If startup reports another `github.exe` process, save work and exit that
application normally before retrying. If signature, listener, page identity,
or connection checks fail, the launcher stops instead of connecting to an
unrecognized target. It does not terminate the app. If labels remain English
or controls behave unexpectedly, stop the overlay and restart the app
normally; the target version or markup may have changed.

### Ask an AI assistant to help install

Copy this prompt to an AI assistant with access to your computer:

```text
Help me install the settings translation from
https://github.com/YOIMIYA66/github-copilot-zh.
First check Windows, my GitHub Copilot desktop version, WebView2, PowerShell,
and Node.js. Read that repository's README, review its source and license, and
confirm the installation instructions and project URL before executing
anything. Treat an unverified or pre-release version as such and tell me if
the app version has not been validated. Save my work, and do not force-close
Copilot, disable security, expose credentials, or execute an unreviewed remote
script. Follow the repository's documented installation entry point only if I
approve the security risks. Verify that settings labels are translated and
the main page, including Thinking labels, remains in English. Report any
failure or uncertainty and explain how to stop and restore the app.
```

### Development

`npm install` installs the development-only jsdom dependency and its
transitive dependencies, whose license information is recorded in
`package-lock.json`. Run `npm test` for isolated tests and
`npm run benchmark` for the synthetic DOM benchmark. The benchmark is not a
measurement of WebView2 or a claim about real-world latency.

#### Diagnostic attachment

Only with the user's explicit consent, and with no other translation overlay
active, a developer can attach to an existing **already-debuggable** Copilot
process without restarting or refreshing it. This does not test the normal
launcher. Supply the actual debug port and signed Copilot process ID:

```powershell
$port = 12345 # Replace with the verified loopback debug port.
$appPid = 1234 # Replace with the verified GitHub Copilot process ID.
$app = Get-CimInstance Win32_Process -Filter "ProcessId=$appPid"
node .\src\diagnose.js install $port $appPid $app.ExecutablePath
node .\src\diagnose.js status $port $appPid $app.ExecutablePath
node .\src\diagnose.js stop $port $appPid $app.ExecutablePath
```

Each command verifies the loopback listener, its WebView2 signature and
ancestry, the signed app process, and the page target before attaching.
Installation affects only the current page; it does not register a script for
future navigations. `stop` restores the diagnostic overlay's changes without
closing the app. It does not stop unrelated overlays.

Status returns only scan-request and observer-callback counts, a cumulative
count of distinct eligible fixed text nodes without a matching translation,
and up to the latest 512 batch and callback duration samples in milliseconds.
It does not return page text, account details, paths, or input values. The
unmatched count covers only the supported structural allowlist, can include
fragments, and is **not** a count of all untranslated UI; zero does not mean
complete coverage.

<div align="center">

# GitHub Copilot Desktop 中文汉化层
### GitHub Copilot Desktop UI in Chinese

*基于结构白名单与纯人工词典的 GitHub Copilot 桌面端非侵入式内存汉化工具*

[![Platform](https://img.shields.io/badge/Platform-Windows%20(WebView2)-0078D4?logo=windows)](https://learn.microsoft.com/microsoft-edge/webview2/)
[![Target](https://img.shields.io/badge/Copilot%20Desktop-1.4.2-24292F?logo=githubcopilot)](https://github.com/features/copilot)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2022-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PowerShell](https://img.shields.io/badge/PowerShell-%E2%89%A5%207-5391FE?logo=powershell&logoColor=white)](https://github.com/PowerShell/PowerShell)
[![Dependencies](https://img.shields.io/badge/Runtime%20Deps-0-success)](./package.json)
[![Status](https://img.shields.io/badge/Status-Source%20Preview-orange)](./README.md)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

**简体中文 | [English](./README.en.md)**

</div>

---

> [!IMPORTANT]
> **源码预览版（Source Preview）：** 汉化层已在运行中的应用上进行部分验证，但普通启动器的完整启动流程尚未端到端测试，翻译覆盖也尚不完整。开发目标为 Windows 上使用 WebView2 的 **GitHub Copilot desktop 1.4.2**（这不代表该版本完全兼容；桌面应用、WebView2 DOM 和调试接口均可能随时变化，其他版本尚未测试）。

本项目通过精细的 DOM 结构白名单与**纯手工编写的中文词典**，为 GitHub Copilot 桌面端提供非侵入式的**设置（Settings）与固定界面控件**内存汉化层。

---

## ✨ 核心特性

- **📖 纯人工词典，零外部服务**：不使用机器翻译、不下载模型、不需要 API 密钥，运行时**零 npm 生产依赖**。
- **🛡️ 非侵入式内存覆盖**：绝不修改应用程序可执行文件（`github.exe`）或安装目录文件；按 `Ctrl+C` 或正常重启应用即可完全还原。
- **🎯 严格的翻译边界**：仅翻译已确认归属的设置文案、静态导航与 Composer 标签，以及通过触发器和菜单 ID 双向关联确认的固定菜单项与说明。聊天正文、工具输出、思考状态、代码、个人输入/资料、计数和动态模式/模型名称保持原文。
- **🔐 多重安全校验**：启动与连接前后双重验证 `github.exe`（`GitHub, Inc.`）与 `msedgewebview2.exe`（`Microsoft Corporation`）的 Authenticode 数字签名、进程树归属、页面 Origin（`http://tauri.localhost`）及 `127.0.0.1` 回环绑定。
- **⚡ 按需监听与分批处理**：仅观察窄范围固定控件根、主容器的直接子节点以及已验证关联的打开菜单，**不观察对话正文子树**。设置和菜单变化按有限批次（每批最多 150 节点 / 4 毫秒时间片）处理。

---

## 🎯 翻译范围与边界

| 类别 | 适用区域 | 具体内容 |
| :--- | :--- | :--- |
| **✅ 翻译内容**<br>*(结构白名单 + 词典精确匹配)* | **设置对话框（Settings）** | 设置导航栏、分类标题、选项标签、说明文本、更新状态提示、受支持的跨节点拆分段落，以及归属已验证的设置下拉框与操作按钮 |
| | **主界面静态控件** | 侧边栏 `Automations` / `Customize` 导航按钮、Composer 顶部的 `Background` / `Artifacts` 状态胶囊标签 |
| | **双向关联弹出菜单** | 经触发器与菜单 ID 双向验证的 Composer **模式菜单**、**模型与推理强度菜单**、**添加上下文菜单**以及侧边栏底部的**账户菜单**固定文案 |
| **🛡️ 保留原样**<br>*(显式排除，绝不修改)* | **对话与工作区** | 聊天正文、Thinking（思考）和其他状态标签、工具输出、工作区文件与路径 |
| | **代码与用户输入** | 代码块（`code`/`pre`）、键盘快捷键按键（`kbd`）、输入框与可编辑区域、用户自定义名称/路径/数值、项目/仓库/个人资料及各类计数 |
| | **专有名称与未知提示** | `Interactive` / `Plan` / `Autopilot` 模式名、模型与级别名称，以及归属无法确认的工具提示（例如 Max 级别的独立详情提示，因无法验证其与具体菜单项的可访问名称关联而保留英文） |

---

## 🚀 快速开始

### 1. 环境要求

| 组件 | 要求说明 |
| :--- | :--- |
| **操作系统与应用** | Windows，以及使用 WebView2 的 **GitHub Copilot desktop**（开发目标版本 `1.4.2`） |
| **PowerShell** | PowerShell 7 或更高版本（`pwsh`） |
| **Node.js** | Node.js 22 或更高版本（运行时无任何 npm 生产依赖） |
| **Git** | 用于克隆本项目仓库 |

### 2. 克隆并启动

> [!NOTE]
> 以下步骤使用源码预览版。正常启动器通过新启动应用完成整个流程尚未端到端验证；启动等待阶段按 `Ctrl+C` 目前仍可能以非零退出码结束。**运行前请先保存工作并正常退出 Copilot**；不要强制结束 Copilot，也不要关闭操作系统安全防护。

```powershell
git clone https://github.com/YOIMIYA66/github-copilot-zh.git
Set-Location .\github-copilot-zh
# 执行启动器前请先审阅下载的源代码与许可证 (LICENSE)
pwsh -NoProfile -File .\start.ps1
```

- **自定义安装路径**：默认可执行文件路径为 `%LOCALAPPDATA%\Programs\GitHub Copilot\github.exe`。若安装在其他位置，请通过 `-AppPath` 传入实际路径：
  ```powershell
  pwsh -NoProfile -File .\start.ps1 -AppPath "D:\CustomPath\GitHub Copilot\github.exe"
  ```
- **运行要求**：使用 Copilot 期间请**保持终端窗口打开**。启动器仅启动新的已签名应用进程，拒绝附加到已运行的应用。

### 3. 停止与还原

- **在线还原**：在终端按 **`Ctrl+C`** 即可卸载内存汉化层，并将页面上已翻译的文本恢复为英文原样。
- **彻底关闭调试端口**：正常退出 Copilot，之后从桌面或开始菜单的常规快捷方式重新启动即可。
- **异常退出恢复**：如果启动器或调试连接意外中断，只需正常退出并重启 Copilot 应用即可清除内存中的汉化层。本工具不会修改任何持久化的应用设置值。

---

## 🤖 让 AI 助手协助安装

你可以将以下提示词直接复制给能够访问你电脑的本地 AI 助手（如 Claude Code、Copilot CLI、Cursor 等）：

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

## 🔒 安全说明与故障排除

> [!WARNING]
> **本地调试端口安全提示：** WebView2 调试端口不进行身份验证。当调试启用时，以当前系统用户身份运行的其他本地进程可能查看或修改应用。请仅在可信设备上使用，并在使用完毕后正常关闭应用。CDP 和 WebView2 调试参数并非稳定的 Copilot 官方 API。

| 常见问题 / 现象 | 原因与处理方式 |
| :--- | :--- |
| **启动提示已有 `github.exe` 进程** | 启动器拒绝附加到已有进程，也不会强制杀进程。请先保存工作并正常退出已打开的 Copilot，再重新运行 `start.ps1`。 |
| **签名、监听进程或连接校验失败** | 若可执行文件签名、端口监听归属、页面身份或连接检查未通过，启动器会立即安全中止，不会连接未知目标，也不会终止应用。 |
| **部分标签仍为英文或控件行为异常** | 目标应用版本或页面 DOM 结构可能已发生变化。请按 `Ctrl+C` 停止汉化层并正常重启应用。 |

---

## 🔍 工作原理与项目结构

### 运行流程

1. **环境与签名预检（`start.ps1`）**：检查 PowerShell 7+ 与 Node.js 22+，校验 `github.exe` 的 `GitHub, Inc.` 数字签名，确认当前无运行中的 `github.exe` 进程。
2. **回环调试端口启动（`start.ps1`）**：分配本地空闲端口，通过临时环境变量 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` 仅在 `127.0.0.1` 回环地址上启用 WebView2 远程调试并启动应用。
3. **双重归属与目标校验（`connect.js` / `verify-listener.ps1` / `cdp.js`）**：在获取调试目标前与 WebSocket 握手成功后，双重验证监听端口独占绑定 `127.0.0.1`、监听进程为微软签名的 `msedgewebview2.exe` 且隶属于刚启动的 `github.exe` 进程树，并核对页面标题与 `http://tauri.localhost` Origin。
4. **内存注入与无损还原（`runner.js` / `injection.js` / `overlay.js`）**：注入 DOM 观察器与人工词典，按白名单分批替换固定文本节点；收到 `Ctrl+C` 时注销脚本并精确还原所有已跟踪的文本与属性。

### 目录结构

```text
github-copilot-zh/
├── start.ps1                # PowerShell 启动器（环境检查、签名校验、分配回环调试端口并启动应用）
├── src/
│   ├── runner.js            # 主运行器（管理 CDP 连接生命周期、脚本注入与 Ctrl+C 退出还原）
│   ├── connect.js           # 安全连接器（连接前后调用 verify-listener.ps1 执行双重校验）
│   ├── verify-listener.ps1  # 进程与签名校验脚本（验证回环绑定、WebView2 签名与父子进程树）
│   ├── cdp.js               # 零依赖轻量 CDP 客户端与页面目标筛选器 (selectTarget)
│   ├── injection.js         # 页面注入源码生成、移除还原与诊断模式动作封装
│   ├── overlay.js           # 核心 DOM 汉化层（结构白名单判定、MutationObserver、分批节流与还原）
│   ├── dictionary.js        # 人工编写的英文 -> 中文固定界面词典
│   └── diagnose.js          # 开发者诊断附加工具（支持 install / status / stop）
└── test/
    ├── benchmark.js         # JSDOM 合成 DOM 基准测试脚本
    ├── cdp.test.js          # CDP 协议与目标筛选单元测试
    ├── chrome.test.js       # 主界面固定控件与弹出菜单汉化单元测试
    ├── injection.test.js    # 脚本注入、Origin 限制与诊断模式单元测试
    ├── overlay.test.js      # 设置界面翻译、动态更新与还原单元测试
    └── settings-pages.test.js # 各设置分页结构覆盖单元测试
```

---

## ⚡ 性能设计与采样数据

汉化层的设计目标是尽量降低对主界面的干扰，但**不保证零开销，也不保证在所有设备上都流畅**。以下提供单次实机采样与 JSDOM 合成基准数据供参考（耗时会随机器和负载变化，不代表普遍性能保证）。

### 1. WebView2 实机诊断附加样本（GitHub Copilot desktop 1.4.2，单次运行）

在运行中的应用上验证了诊断版安装、`stop` 还原以及 `measure: false` 普通版重新注入（全程未重启应用，未修改任何输入或菜单选值）：

| 采样阶段 | `settingsScans` | `portalScans` | `chromeScans` | `callbacks` | 耗时统计（Overlay 自身计时） |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **菜单交互前静置（约 8 秒，关闭态）** | `+0` | `+0` | `+0` | `+0` | 无扫描与回调触发 |
| **原生输入依次打开并关闭 4 个菜单各一次** | `+0` | `+12` | `+20` | `+23` | **处理批次（共 5 个）**：p95 / 最大 `1.40 ms`，总计 `3.60 ms`<br>**观察器回调（共 26 个）**：p95 `0.30 ms` / 最大 `0.40 ms`，总计 `2.50 ms` |
| **菜单交互后静置（约 8 秒，关闭态）** | `+0` | `+0` | `+0` | `+0` | 无扫描与回调触发 |
| **交互后累计总计** *(含初始 4 次 chrome 根扫描)* | `0` | `12` | `24` | `26` | — |

> **样本局限说明**：以上耗时仅为汉化层（overlay）内部自身计时，不是全应用 CPU、内存或 FPS 测量；该脚本仅执行了菜单开合交互，未叠加合成聊天负载，也未进行逐句翻译覆盖验收。

### 2. JSDOM 合成基准样本（`npm run benchmark`，单次运行）

使用 `npm run benchmark` 可在 Node.js + JSDOM 环境下检查合成聊天正文更新是否会触发设置/固定界面扫描，并报告合成 DOM 的批次处理耗时（**非 WebView2 实测或 CPU 基准，不代表真实页面渲染延迟**）：

| 合成基准场景 | 采样指标 | 结果数据 |
| :--- | :--- | :--- |
| **5,000 个合成聊天节点、1,000 次聊天更新（设置关闭）** | 设置扫描 / 固定界面扫描；本次耗时 | `0` / `0`；约 `198.23 ms` |
| **5,000 个合成聊天节点、1,000 次聊天更新（设置打开）** | 设置扫描 / 固定界面扫描；本次耗时 | `0` / `0`；约 `229.63 ms` |
| **1,201 个合成设置元素（300 行），首次翻译至末项完成** | 加入设置窗口至末项翻译完成 | 约 `154.37 ms` |
| **1,201 个合成设置元素、1,000 次设置标签更新** | 处理批次 p95/最大值；观察器回调 p95/最大值 | `4.06/4.19 ms`；`0.09/2.01 ms` |

---

## 🛠️ 开发与诊断

### 运行测试与基准

`npm install` 仅安装开发阶段测试所需的 `jsdom` 及其传递依赖（许可证信息记录在 `package-lock.json` 中）：

```powershell
npm install
npm test           # 运行隔离单元测试
npm run benchmark  # 运行合成 DOM 基准测试
```

### 诊断附加模式（Diagnostic Attachment）

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

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。

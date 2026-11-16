<div align="center">

# GitHub Copilot Desktop 中文汉化层
### GitHub Copilot Desktop UI in Chinese

*基于结构白名单与纯人工词典的 GitHub Copilot 桌面端非侵入式内存汉化工具*

[![Platform](https://img.shields.io/badge/Platform-Windows%20(WebView2)-0078D4?logo=windows)](https://learn.microsoft.com/microsoft-edge/webview2/)
[![Target](https://img.shields.io/badge/Copilot%20Desktop-1.4.2-24292F?logo=githubcopilot)](https://github.com/features/copilot)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2022-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PowerShell](https://img.shields.io/badge/PowerShell-%E2%89%A5%207-5391FE?logo=powershell&logoColor=white)](https://github.com/PowerShell/PowerShell)
[![Status](https://img.shields.io/badge/Status-Source%20Preview-orange)](./README.md)

**简体中文 | [English](./README.en.md)**

<p align="center">
  <a href="#-核心特性">核心特性</a> •
  <a href="#-翻译范围与边界">翻译范围</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-让-ai-助手协助安装">AI 安装</a> •
  <a href="#-安全说明与故障排除">安全排错</a> •
  <a href="#-工作原理与项目结构">工作原理</a> •
  <a href="#-性能设计与采样数据">性能数据</a>
</p>

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
- **⚡ 按需监听与分批处理**：仅观察窄范围固定控件根、已验证路由边界的直接子节点及所属打开菜单，**不观察对话正文子树**。采用 `MessageChannel` 调度分批处理：冷启动首批目标预算为 `12 ms` / `1,200` 个节点，后续交互批次最多处理 `400` 个节点、软预算为 `5 ms`（单次 DOM 操作可能超出，并非硬性截止时间）。

---

## 🎯 翻译范围与边界

### ✅ 会翻译（结构白名单 + 词典精确匹配）

| 适用区域 | 具体内容 |
| :--- | :--- |
| **设置对话框** | 设置导航栏、分类标题、选项标签、说明文本、受支持的跨节点拆分段落，以及归属已验证的设置下拉框与操作按钮。已观测的“颜色滤镜”子页还会翻译带标题的同源预览 iframe 中五个固定状态标签；示例代码和实际设置值保持不变。 |
| **仓库设置页** | Server-ready 标题/说明、仓库 MCP 空状态和移除仓库的删除提示已通过协调实机检查。预览还支持已观测的嵌套移除说明布局，只替换仓库名称两侧的固定文案，不读取或整体替换名称；该修复仍待实机验收。`serverReadyAction.pattern` 代码、正则输入和其他仓库或用户值保持不变。 |
| **会话活动设置** | 翻译 `accessibility-announcements` 标题、说明、十项活动标签及 On/Off。实机采用 `li[data-subsetting-id]` 而非 `data-settings-row`；按精确子设置键与 UL 关联的分区标题确认归属，不改变开关值。对应聊天实时通知仍保持英文。 |
| **主界面静态控件** | 侧边栏 `New` / `Pull requests` / `Issues` / `Automations` / `Customize` 导航按钮（新建 / 拉取请求 / 议题 / 自动化 / 扩展中心）及 Composer 顶部 `Background` / `Artifacts` 状态标签。侧栏要求经验证的导航结构及成对匹配的 `data-sidebar-nav-item` / `data-command`；`New` 还需 `new` 文件拖放标记。支持深层标签 span、导航挂载和替换，不观察项目/会话列表。 |
| **双向关联弹出菜单** | 经触发器与菜单 ID 双向验证的 Composer **模式菜单**、**模型与推理说明**、**添加上下文菜单**、侧栏**账户菜单**及**主题子菜单**固定文案；账号身份不翻译。**工具权限子菜单**现按最新要求翻译标题（“始终询问 / 辅助模式 / 全部允许”）与三条固定说明，取代此前说明保持英文的例外，保留两行布局与选中状态。模型开关 On/Off 与已观测的能力说明仅在已验证开关/详情归属中翻译，模型/tier 名不翻。Accounts 操作仍需 Accounts 设置触发器与合法菜单关联。 |
| **已验证页面控件** | PR/Issue 的所属页头 H1 标题及筛选栏精确标签的显示映射；自动化概览页签/搜索/操作按钮，以及经验证的设置自动化编辑器标题/说明、Chat 标签和关联帮助说明。预览还支持已观测的 Issue 页 `New issue` 按钮组件标签结构，仍待实机验收。New automation 对话框及 Skills 搜索/操作因无法验证其真实页面归属，不纳入翻译白名单。Lexical 输入器只翻固定 `data-placeholder` 与关联占位描述，不遍历或观察输入子树。Accessibility 快捷键操作 P 标签按真实列表/按钮布局翻译。已采样的 desktop 1.4.2 中，用户打开 Keyboard shortcuts 后实际显示同一 Settings 辅助功能分区，并无第二个独立对话框；键绑定与快捷键实时播报保持原文。 |
| **图片标注工具栏** | Arrow / Rectangle / Pencil / Comment / Discard / Save 仅在已验证全屏图片预览/编辑器链中的专属工具栏翻译，不改 radio 值或选中状态。标注工具提示仍须由已验证按钮的 `aria-describedby` 指向 portaled `role=tooltip`；此标准 ARIA 变体已通过 fixture，尚未实机 hover 验证。不读取或翻译编辑器、图片、canvas、批注及预览文件名。 |
| **已验证悬停提示** | 侧栏页脚的 `Share feedback` / `Settings`，以及已验证 Composer 页脚的 `Mode` / `Model & reasoning`，要求已知触发器同时具有 `data-popup-open` 与 `:hover`，并符合 body portal / focusable 容器的精确结构。只翻译标题叶节点，不读取键盘快捷键；缓存的反馈对话框或其他类似 tooltip 的节点不构成归属。 |
| **Composer 用量弹层** | 仅匹配已验证的 `AI credits quota:` Composer 触发器、`aria-controls` 关系及直接 body portal 中的固定 dialog 结构。翻译 Plan / Session / Tokens / Context 标签、压缩对话与用量操作，以及 `used`、`AI credits`、`cached`、`reasoning` 固定后缀；数字、百分比前缀、K/M 计数、Context 按钮值和触发器 `aria-label` 均保持不变。兼容原三 Text 详情和已采样的三 SPAN 包装，不读取或观察新增数值子节点。fixture 已验证两种布局，原生包装译文待实机验收。 |
| **侧栏分组标签** | Projects、单一叶节点的 No projects yet 空状态、两处已观测 Sessions 标题及固定 `sidebar-group-quick-chats` Chats 标签翻译。须满足 section/标题关联与专属两 SPAN 分组结构，只有第二个叶 SPAN 是标签；不读取、翻译或观察第一个 SPAN 的子树。只观察固定叶节点和列表壳的直接子级边界，不观察项目/会话条目子树、不翻用户名称。 |
| **新建会话菜单** | Sessions 页头专属 `sidebar-new-session` 触发器与 body portal 菜单双向关联后，翻译 Chat、Start session in 和三项 Add 操作。操作叶必须具有 `chat.create` / `project.add-github` / `project.add-from-url` / `project.add-folder`；仅精确直链装饰标题可例外翻译 `aria-hidden` 内容，其他隐藏标签不放开。只观察固定叶及直接挂载/已知元数据边界，不订阅整菜单子树或仓库值。 |
| **固定自动档位预览** | 仅在已归属模型菜单中，按已采样的 `balance` / `hydrafusion` / `hydrafusion-max` 枚举和精确标签槽翻译 Standard / High / Max；其他模型名、未知档位及描述保持原文。 |
| **会话右键菜单预览** | 按已采样的 body portal 壳、完整操作顺序及会话命令签名，翻译聊天和编码会话右键菜单的固定动作；不读取或观察会话名称及图标子树。关闭后只保留已验证 portal / presentation / menu 的直接结构和元数据观察，以支持原生保留节点的重新打开，不读取关闭菜单的标签。结构或命令失效时恢复仍由汉化层持有的标签；译文待实机验收。 |
| **语音设置** | 翻译已观测的 `voice-mode-language` 标题/说明及麦克风权限说明句。Auto 仅在该分区专属语言按钮的固定 label 内映射，不翻模型名或普通 dialog。其他语言显示及实际保存的语言/权限值不变，不仅凭 trigger 关联推断语言弹层选项归属。 |
| **扩展中心控件** | 专属 Browse/Installed 页头页签、Add、搜索占位文字、All types、Editor’s picks 标题/说明及已验证的卡片 Add canvas 操作按钮。预览还翻译具有已观测三子级结构、Add 操作及窗口占位节点的 Customize H1；九项已知分类标签只匹配 `customize-category-filter` 专属页签的独立文本叶，并要求同级所属页头。未知标签、混合计数槽及卡片内容保持不变，分类译文仅通过 fixture，尚未实机验收。Add 菜单仍沿用已验证关联和项 ID，不推断 Skill 子菜单。 |
| **反馈对话框预览** | 侧栏反馈按钮的 `aria-controls` 必须指向已打开的直接 body portal 对话框及精确三层内容壳。只翻译 textarea 占位文字、独立公开议题说明及 Cancel / Share feedback 操作叶；提交按钮兼容已观测的 `keyShortcut` 同级节点及其中 chord SPAN / 两个 KBD 叶，但不读取或观察该子树。不读取或翻译标题、草稿，textarea 仅观察属性。字段或触发器关系失效时，只恢复仍由汉化层持有的文本与属性。已采样实机归属结构，新译文仍待实机验收。 |
| **设置内固定选择器** | Themes 中已观测的 `data-value` radiogroup 与所属 H2 标题关联，覆盖没有 `data-settings-row` 的应用/终端 System / Light / Dark；旧行布局仍兼容。会话时间范围下拉框仅翻译已归属 `sessions-cli-sessions` 且已观测的固定 `Last 3/7/14/30/90/180/360 days` 选项。未列出的数值选项不会通过模板翻译。 |

“静态”指产品固定文案，不是 DOM 创建时间：菜单或按钮即使动态挂载/更新，固定标签仍可翻译；任意生成句子、时间戳、百分比及实际值不翻。本版移除此前的可变优惠/日期、更新检查时间和任意 Last N day(s) 模板，仅保留精确匹配的预定义选项。

预览词典还兼容 28 条旧版实验设置标题/说明，译文独立编写，继续使用已有 `experimental-experiments` 设置归属。包括侧栏配置、可编辑文件标签页、统一模型控件、云端会话、批准与队列控件、WSL、后台任务、终端传输和富文本输入框；不开放新的翻译区域、不引入旧注入器或机器翻译。fixture 验证不代表这些旧文案仍出现在当前桌面版本中。旧版的 `Thinking` / `Thought` 与聊天正文模板明确不合入。

协调实机预览已确认 Customize H1 显示为“扩展中心”；这不代表分类标签变体或旧版实验设置文案已通过实机验收。

### 🛡️ 保留原文（显式排除，绝不修改）

| 适用区域 | 具体内容 |
| :--- | :--- |
| **对话与工作区** | 聊天正文、`Thinking` / `Thought for N seconds` 和其他状态标签、工具输出、`Sent message …` 行、消息页脚中的相对时间与模型信息、工作区文件与路径。页脚尚无经验证的归属结构，因此当前版本保持原文，不进行扫描或翻译。 |
| **代码与用户输入** | 代码块（`code`/`pre`）、键盘按键（`kbd`）、输入框与可编辑区域、用户自定义名称/路径/数值、项目/仓库/个人资料及各类计数 |
| **专有名称与未知提示** | 模型名、未知级别名称、归属未确认的其他工具提示及未验证的上下文弹层。Composer 模式触发器按钮翻译为“协作”（计划/自动执行保持一致），而模式弹出菜单内的 `Interactive` / `Plan` / `Autopilot` 选项名称按用户要求保留英文；套餐用量中的 Plan 仍译为套餐。模型推理详情与 Effort 子菜单仅在经验证的模型菜单/详情结构成立时翻译；不推断未验证级别。 |
| **原生语音错误通知** | 固定语音忙碌错误通知保持英文：尚未观察到该原生通知的正向归属，也没有为复现它启动录音。实现不会翻译通用警告框或 toast。 |
| **工作筛选显示边界** | 在已验证的 PR/Issue 筛选栏内，对 Authored by me、Assigned to me、Involves me、Review requests、Done、Created by me、Mentioning me 做精确中文显示映射。同名自定义筛选也会得到相同的可恢复显示映射，但不修改保存名称、查询条件或输入值；其他自定义名称不变。仅有 `role=tablist` 不符合归属要求。`Nothing here` 只在已观测的完整直接子级空壳与 `No items match ` 固定消息前缀同时成立时翻译；动态消息及筛选名保持英文。仅观察该空壳消息叶节点以撤销失效归属，不观察结果区或聊天子树。 |
| **外部市场与自动化数据** | 第三方卡片名称/说明、已安装资源、计数、自动化名称/运行记录及输入草稿保持原文。仅翻译明确标识的产品固定控件，不扫描整张卡片、目录 section 或结果内容。 |
| **Profile 点数用量** | `AI credits used: N%` 整行保持英文，包含变化的百分比；不会全局排除其他与点数相关的设置文案。 |
| **动态值与未验证控件** | 优惠百分比/日期、更新检查时间及可变数值消息保持原文。其他 segmented On/Off 文案因缺少已验证归属而不翻译；已验证控件保留选中状态。普通 Effort 子菜单的 Low / Medium / High / Extra High / Max 只在已观测的标题/值独立叶节点、nested popup 与相同 root owner 关联内翻译。Model / Effort / Context window（兼容 Content window）只匹配已归属模型菜单的固定标题槽或非交互标题，不改模型名/值槽和 200K。Copilot Fusion `data-auto-tier-id` 专业 tier 名保持英文。不使用普通 toolbar 或全局短词匹配。 |

聊天中所有具体活动通知保持英文，包括思考（`Thinking`、`Thinking…`、`Thinking...`、`Thought for N seconds`）、`Sent message …`、工具/搜索/文件操作、CLI 状态、模型/代理切换及压缩；共享标签只在对应设置分区翻译，不翻译或观察聊天正文。Nested DIV 菜单触发器的标题与当前值分别识别，不再拼接全文判断；打开子菜单时父 presentation 的 inert / aria-hidden 不取消其归属，只忽略菜单项内部隐藏镜像和 `kbd` 快捷键，绝不对可见字符串去重。

desktop 1.4.2 协调实机验收已确认侧栏四项（含两处 Sessions）、PR 五项/Issue 四项筛选标签和两处 Nothing here、两组主题单选项、辅助功能 62 行快捷键和十行播报、听写标题/说明及麦克风指引、权限菜单六项固定标题/说明及 inert 父关联。图片工具栏已挂载时六按钮中文通过；生命周期修复后，用户正常重新打开且不再次注入，视觉确认已经中文。随后 DOM 探针发现工具栏已卸载，因此不将此写成第二次六按钮 DOM 测量。preview/editor/toolbar 延迟挂载已通过回归，仅沿已证实的直接子级挂载边界发现，不新增编辑器 subtree 观察。当前模型为 Auto/Fusion：普通非 Fusion Effort、Model/Context 细分变体及未观测的 Fusion 详情变体本轮并未完整实机验收；已支持规则有实机结构及 fixture，也未为测试切换模型。Arrow hover 未产生 `aria-describedby`，tooltip 变体仍只有 fixture 验证；听写 Auto 未为实机测试主动选择。

新建会话菜单的四个 command 标签及装饰标题已在实机全部中文；通过原生加号按钮关闭后重新打开、不再次注入，五项再次逐项通过。未点击菜单动作、创建会话或添加仓库。

其他汉化工具及其后台伴随进程可能与本项目冲突：只停用页面实例，后台进程仍可能重新注入。协调热替换前，应先使用其他工具的标准停用入口关闭其伴随进程、恢复其页面改动，再停用本项目旧实例并安装新版。新版本不会根据已有中文猜测英文或反向改写正文；本项目已有实例运行时，重复执行注入不会替换该实例。

页面发现沿已验证控件的连接祖先链反推，只保留主容器路由前缀的直接子级观察器。实机样本在第三层 DIV 替换页面，前三层对象保留；这不是订阅所有第三层 DIV，也不宣称布局普遍成立。文字观察器只挂到固定控件，Lexical 输入器为纯属性观察；节点移除、归属标记失效及菜单失去关联时断开观察器，仅恢复仍等于本项目译文的内容。实机范围与未验证变体已列于上方，不代表整页验收。

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

**v0.2.0** 的 [Releases](https://github.com/YOIMIYA66/github-copilot-zh/releases) 提供 `github-copilot-zh-0.2.0-source.zip`，解压审阅源码与许可证后即可运行 `start-silent.vbs`（无窗口静默）或 `start.cmd`（终端控制台）；运行时无需 `npm install`。详见 [CHANGELOG.md](CHANGELOG.md)。

> [!NOTE]
> 以下步骤使用源码预览版。**运行前请先保存工作并正常退出 Copilot**；不要强制结束 Copilot，也不要关闭操作系统安全防护。

```powershell
git clone https://github.com/YOIMIYA66/github-copilot-zh.git
Set-Location .\github-copilot-zh
# 执行启动器前请先审阅下载的源代码与许可证 (LICENSE)
.\start.cmd
```

- **静默无窗口启动（推荐日常使用）**：双击目录中的 `start-silent.vbs`（或为其创建桌面快捷方式），会通过 `pwsh -WindowStyle Hidden` 传入 `-Silent` 后台启动，不弹出命令行窗口；若遇到失败则会以系统原生弹窗报错。
- **双击启动**：也可以在资源管理器中双击仓库目录的 `start.cmd`。如启动失败，窗口会保留错误提示；阅读提示后按任意键关闭。
- **直接运行脚本**：如果从交互式 PowerShell 直接运行 `.\start.ps1`，启动失败时会显示错误并等待按 Enter；`start.cmd` 会自行保留错误窗口，避免重复暂停。
- **管理员权限**：启动器不会主动请求 UAC 提权。已有 Copilot 正在运行时，提权也不能解决问题；请先保存工作并正常退出 Copilot。
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
验证设置和已支持的静态界面标签/说明（包括符合所属条件的账户操作菜单、页面控件、Artifacts 状态标签及 Composer 用量弹层固定文案）已翻译；用量弹层的数字/百分比前缀、K/M 计数、Context 实际值和触发器无障碍标签保持不变。聊天正文、工具输出、Thinking / Thought for N seconds、Sent message 行、模型名、其他动态值、Profile 点数用量、第三方市场内容、非白名单自定义筛选名及未验证空状态保持原文。固定模式标签及已验证自动档位仅改显示，不改内部值。同名白名单筛选只改显示，不改保存名称或查询。页脚相对时间/模型信息保留原文，不增加动态值翻译或遍历聊天正文。不要将未实机验证的控件称为完整覆盖。
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

### 系统架构与运行流程

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/architecture-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="docs/images/architecture-light.png">
    <img alt="GitHub Copilot for Windows 汉化补丁系统架构与运行流程图" src="docs/images/architecture-light.png" width="100%">
  </picture>
</p>

<p align="center">
  <sub>💡 提示：可直接在浏览器中打开 <a href="docs/architecture.html"><b>docs/architecture.html</b></a> 体验完整交互式架构图（支持多端视口缩放、主题切换、连线动效与源代码精准定位）。</sub>
</p>

此图概括原有启动器/汉化层流程；本轮新增页面控件的边界以本文上方的范围表为准。

1. **环境与签名预检（`start.ps1`）**：检查 PowerShell 7+ 与 Node.js 22+，校验 `github.exe` 的 `GitHub, Inc.` 数字签名，确认当前无运行中的 `github.exe` 进程。
2. **回环调试端口启动（`start.ps1`）**：分配本地空闲端口，通过临时环境变量 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` 仅在 `127.0.0.1` 回环地址上启用 WebView2 远程调试并启动应用。
3. **双重归属与目标校验（`connect.js` / `verify-listener.ps1` / `cdp.js`）**：通过单次常驻 PowerShell `-Interactive` 两阶段校验，在获取调试目标前与 WebSocket 握手成功后，验证监听端口独占绑定 `127.0.0.1`、监听进程为微软签名的 `msedgewebview2.exe` 且隶属于刚启动的 `github.exe` 进程树，并核对页面标题与 `http://tauri.localhost` Origin。
4. **内存注入与无损还原（`runner.js` / `injection.js` / `overlay.js`）**：注入 DOM 观察器与人工词典，按白名单分批替换固定文本节点；收到 `Ctrl+C` 时注销脚本并精确还原所有已跟踪的文本与属性。

### 目录结构

```text
github-copilot-zh/
├── start-silent.vbs         # 静默无控制台窗口启动入口（调用 start.ps1 -Silent，出错时弹窗提示）
├── start.cmd                # 双击终端启动入口（失败时保留错误信息）
├── start.ps1                # PowerShell 启动器（环境检查、签名校验、分配回环调试端口并启动应用）
├── docs/                    # 项目文档与系统架构导出（交互式 HTML 与高分辨率架构图）
├── src/
│   ├── runner.js            # 主运行器（管理 CDP 连接生命周期、脚本注入与 Ctrl+C 退出还原）
│   ├── connect.js           # 安全连接器（通过单个常驻 verify-listener.ps1 执行握手前后双重校验）
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
    ├── launcher.test.js     # Windows 双击入口与失败提示测试
    ├── overlay.test.js      # 设置界面翻译、动态更新与还原单元测试
    ├── usage-popup.test.js  # 用量弹层固定文案与动态值隔离测试
    └── settings-pages.test.js # 各设置分页结构覆盖单元测试
```

---

## ⚡ 性能设计与采样数据

汉化层的设计目标是尽量降低对主界面的干扰，但**不保证零开销，也不保证在所有设备上都流畅**。以下提供单次实机采样与 JSDOM 合成基准数据供参考（耗时会随机器和负载变化，不代表普遍性能保证）。

### 1. WebView2 实机诊断附加样本（GitHub Copilot desktop 1.4.2，单次运行）

在运行中的应用上验证了诊断版安装、`stop` 还原以及 `measure: false` 普通版重新注入（全程未重启应用，未修改任何输入或菜单选值）：

| 采样阶段 | `settingsScans` | `portalScans` | `chromeScans` | `callbacks` | 耗时统计（Overlay 自身计时） |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **菜单交互前静置（~8s，关闭态）** | `+0` | `+0` | `+0` | `+0` | 无扫描与回调触发 |
| **依次打开并关闭 4 个菜单各一次** | `+0` | `+12` | `+20` | `+23` | **5 个处理批次**：p95 / max `1.40 ms`（共 `3.60 ms`）<br>**26 次回调**：p95 `0.30 ms` / max `0.40 ms`（共 `2.50 ms`） |
| **菜单交互后静置（~8s，关闭态）** | `+0` | `+0` | `+0` | `+0` | 无扫描与回调触发 |
| **交互后累计总计** *(含初始 4 次根扫描)* | `0` | `12` | `24` | `26` | — |

> **样本局限说明**：以上耗时仅为汉化层（overlay）内部自身计时，不是全应用 CPU、内存或 FPS 测量；该脚本仅执行了原生输入菜单开合交互，未叠加合成聊天负载，也未进行逐句翻译覆盖验收。账户操作菜单及 PR/Issue 页签未在当前实机版本逐项复核。

### 2. JSDOM 合成基准样本（`npm run benchmark`，单次运行）

使用 `npm run benchmark` 可在 Node.js + JSDOM 环境下检查合成聊天正文更新是否会触发设置/固定界面扫描，并报告合成 DOM 的处理次数与耗时（**非 WebView2 实测或 CPU 基准，不代表真实页面渲染延迟**）。时间范围仅翻译所属 `sessions-cli-sessions` 下拉框内已观测的固定选项。Accounts 页菜单只在其触发器位于 Accounts 设置页且菜单所有权关联有效时匹配固定操作标签；该菜单结构尚未实机复核。

| 合成基准场景 | 采样指标 | 结果数据（v0.2.0） |
| :--- | :--- | :--- |
| **5,000 个聊天节点、1,000 次更新（设置关闭/打开）** | 设置 / 弹层 / 固定界面扫描；回调；耗时 | `0` / `0` / `0`；`0`；`234.15/374.34 ms` |
| **项目/会话文字及 Chats 计数各更新 1,000 次（共 3,000 次）** | 扫描/回调 | 全为 `0` |
| **1,201 个设置元素（300 行），首次翻译至末项** | 加入设置窗口至末项标题及说明完成 | `591.41 ms` |
| **1,201 个设置元素、1,000 次标签更新** | 设置扫描；批次数 / p95/最大值；回调次数 / p95/最大值；耗时 | `1,000`；`200` / `5.73/6.39 ms`；`300` / `0.29/0.71 ms`；`869.93 ms` |
| **未验证 PR/Issue / Automations / 工作页移除，同等聊天负载** | 扫描/回调；各场景耗时 | 全为 `0`；`454.98/439.11/421.28 ms` |
| **已验证 PR 筛选栏，同等聊天负载** | 扫描/回调；耗时 | 全为 `0`；`424.51 ms` |
| **已归属 PR 面板内 1,000 次结果文字更新** | 设置 / 弹层 / 固定界面扫描；回调 | `0` / `0` / `0`；`0` |
| **已验证自动化页头存在/移除，同等聊天负载** | 扫描/回调；各场景耗时 | 全为 `0`；`373.15/374.51 ms` |
| **3 个页面固定控件、300 次标签更新** | 固定界面扫描；批次数 / p95/最大值；回调次数 / p95/最大值；耗时 | `300`；`100` / `2.13/3.33 ms`；`71` / `1.17/5.35 ms`；`203.58 ms` |
| **1,000 次外部卡片说明更新** | 扫描/回调；耗时 | 全为 `0`；`38.2 ms` |
| **5 个侧栏固定控件、500 次标签更新** | 固定界面扫描；批次数 / p95/最大值；回调次数 / p95/最大值；耗时 | `500`；`100` / `1.63/2.56 ms`；`0` / `0/0 ms`；`216.51 ms` |
| **新建会话菜单打开，同等聊天负载** | 扫描/回调；耗时 | 全为 `0`；`393.04 ms` |
| **该菜单内 1,000 次仓库文字更新** | 扫描/回调；耗时 | 全为 `0`；`13.07 ms` |

基准包含已验证的侧栏/页面控件与直接子级边界，只测选定场景，不代表整页覆盖。测量聊天前等待初始化翻译及路由维护完成；聊天触发任何扫描或回调都会使基准失败。更新样本排除初始化。5 ms 交互分批预算为软目标而非硬截止时间。**95 项测试全部通过**，覆盖上述所有页面/设置/弹窗/悬停提示、选区浮动菜单、延迟主壳挂载以及无窗口静默启动入口。实机验收限制与未验证变体以正文说明为准。

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

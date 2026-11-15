<div align="center">

# GitHub Copilot Desktop UI in Chinese
### GitHub Copilot Desktop 中文汉化层

*A non-invasive, in-memory Chinese localization overlay for GitHub Copilot Desktop powered by a strict structural allowlist and a hand-written dictionary*

[![Platform](https://img.shields.io/badge/Platform-Windows%20(WebView2)-0078D4?logo=windows)](https://learn.microsoft.com/microsoft-edge/webview2/)
[![Target](https://img.shields.io/badge/Copilot%20Desktop-1.4.2-24292F?logo=githubcopilot)](https://github.com/features/copilot)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2022-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PowerShell](https://img.shields.io/badge/PowerShell-%E2%89%A5%207-5391FE?logo=powershell&logoColor=white)](https://github.com/PowerShell/PowerShell)
[![Status](https://img.shields.io/badge/Status-Source%20Preview-orange)](./README.en.md)

**[简体中文](./README.md) | English**

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-translation-scope--boundaries">Scope</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-ask-an-ai-assistant-to-help-install">AI Install</a> •
  <a href="#-security-and-troubleshooting">Troubleshooting</a> •
  <a href="#-how-it-works--project-structure">How It Works</a> •
  <a href="#-performance-design--sample-metrics">Performance</a>
</p>

</div>

---

> [!IMPORTANT]
> **Source preview:** The overlay has been partially checked in a running application, but the normal launcher has not been tested end to end. Translation coverage is incomplete. The development target is **GitHub Copilot desktop 1.4.2** on Windows using WebView2 (this is not a claim of full version compatibility; the desktop app, WebView2 DOM, and debugging interface may change without notice, and other versions have not been tested).

This project translates selected fixed **Settings** text and verified static desktop UI controls in GitHub Copilot desktop using a strict DOM structural allowlist and a **hand-written Chinese dictionary**.

---

## ✨ Key Features

- **📖 Hand-Written Dictionary, Zero External Calls**: Does not use machine translation, download a model, or require an API key. Zero npm production dependencies at runtime.
- **🛡️ Non-Invasive In-Memory Overlay**: Never modifies the application executable (`github.exe`) or installation files. Press `Ctrl+C` or restart the app normally to restore everything cleanly.
- **🎯 Strict Translation Boundaries**: Translates fixed Settings text, static sidebar and Composer labels, and fixed copy in menus whose triggers and menu IDs are bidirectionally verified. Chat messages, tool output, Thinking/status labels, code, personal input/profile data, counts, and dynamic mode/model names stay unchanged.
- **🔐 Multi-Layer Security Verification**: Verifies Authenticode signatures for both `github.exe` (`GitHub, Inc.`) and `msedgewebview2.exe` (`Microsoft Corporation`), process ancestry, page origin (`http://tauri.localhost`), and `127.0.0.1` loopback binding before and after connecting.
- **⚡ Scoped Observation & Bounded Batching**: Observes narrow fixed-control roots, verified route-boundary direct children, and owned open menus; **it does not observe the conversation body subtree**. Batches stop at 150 nodes or a soft 4 ms budget checked between operations; an individual DOM operation can overrun that budget.

---

## 🎯 Translation Scope & Boundaries

### ✅ Translated (structural allowlist + exact dictionary match)

| UI Area | Details |
| :--- | :--- |
| **Settings Dialog** | Navigation items, section headers, option titles, descriptions, supported split paragraphs, and verified Settings listboxes/menus and action buttons |
| **Session Activity Settings** | The `accessibility-announcements` heading, description, ten activity labels and On/Off labels are translated. The observed layout uses `li[data-subsetting-id]`, not `data-settings-row`: exact keys and the list's linked section heading establish ownership. Switch values are never changed. Corresponding real-time chat notifications remain English. |
| **Static Main-Window Controls** | Sidebar `New` / `Pull requests` / `Issues` / `Automations` / `Customize` navigation buttons (新建 / 拉取请求 / 议题 / 自动化 / 扩展中心) and Composer `Background` / `Artifacts` status labels. Sidebar labels require the verified navigation structure and matching `data-sidebar-nav-item` / `data-command` pairs; `New` additionally requires its `new` file-drop marker. Nested label spans, navigation mounting and replacement are supported without observing project/session lists. |
| **Bidirectionally Verified Menus** | Fixed copy in the Composer **mode menu**, **model/reasoning details**, **add-context menu**, sidebar **account menu** and **theme submenu**. Profile fixed labels translate without account identity text. The **tool-permissions submenu** now translates both titles (`始终询问` / `辅助模式` / `全部允许`) and the three fixed descriptions, superseding the earlier English-description exception; layout and selection remain unchanged. Model switch On/Off labels and the observed capable-model descriptions translate only in their verified switch/details owners; model/tier names do not. Accounts actions require an Accounts Settings trigger and valid popup ownership. |
| **Verified Page Controls** | PR/Issue page H1 titles in the observed owned header; Automations Personal/Shared/Dreaming tabs, search placeholder, New automation, setup title/description, Chat label and its linked help description. The Lexical composer's fixed `data-placeholder` and linked placeholder description can translate, but its input subtree is not walked or observed. Twelve additional navigation/session/region/thinking/table/artifact shortcut labels are supported in the known Accessibility keyboard section; a separate shortcut-help dialog needs its own verified owner. |
| **Extensions Center Controls** | Dedicated Browse/Installed header tabs, Add trigger, search placeholder, All types, Editor’s picks title/description and the verified Add canvas card action only. Add menu items require the owned trigger/menu link and their observed item IDs (MCP Server, Plugin, Skill, Canvas from URL), with the fixed Manage marketplaces item; MCP/URL/Copilot remain unchanged. Skill submenus and the separate category-filter tablist are not inferred from these rules. |
| **Fixed Settings Choices** | System/Light/Dark controls inside a known Themes settings section and `data-settings-row`, plus the observed fixed `Last 3/7/14/30/90/180/360 days` choices only in the owned `sessions-cli-sessions` dropdown. Unlisted numeric options are not translated through a template. |

“Static” describes product copy, not when its DOM node is created: fixed menu/button labels may be mounted or updated dynamically and still translate. Arbitrary generated sentences, timestamps, percentages and actual values do not. This version removes the earlier variable discount/date, update-check timestamp and arbitrary Last N day(s) templates; only exact predefined choice labels remain.

### 🛡️ Untouched (explicitly excluded, never modified)

| UI Area | Details |
| :--- | :--- |
| **Conversations & Workspace** | Chat messages, `Thinking` / `Thought for N seconds` and other status labels, tool output, `Sent message …` lines, message-footer relative time and model information, and workspace files/paths. Footer ownership has not been verified, so these labels remain unchanged and are not scanned in this preview. |
| **Code & User Data** | Code blocks (`code`/`pre`), keyboard shortcuts (`kbd`), inputs and editable regions, user-provided names/paths/values, project/repository/profile data, and counts |
| **Proper Names & Unverified Tooltips** | Mode names (`Interactive` / `Plan` / `Autopilot`), model and tier names, and other tooltips with unverified ownership. Model/reasoning details are translated only while a verified model menu is open and the tooltip matches its dedicated details structure; no specific tier association is inferred. |
| **Indistinguishable Work Tabs & Empty States** | PR/Issue built-in tabs have no observed marker separating them from identically named user-created filters; these tabs and `Nothing here` remain English. A generic `role=tablist`, matching text or `data-size=medium` alone is not enough. Dynamic `No items match "..."` sentences and filter names are unchanged. No result-pane or transcript subtree observer is added. |
| **External Marketplace & Automation Data** | Third-party card names/descriptions, installed resources, counts, automation names/runs and editable drafts remain unchanged. Only the specifically identified product controls translate; entire cards, catalog sections and results are not scanned. |
| **Profile Credit Usage** | The `AI credits used: N%` row remains English, including changing percentages. Other credit-related Settings copy is not globally excluded. |
| **Dynamic Values & Unverified Controls** | Discount percentages/dates, update-check timestamps and variable-value messages remain unchanged. Image-annotation toolbar ownership and effort-group choices (`Standard` / `High` / `Max`, distinct from same-named model/tier names) have not been confirmed; no generic toolbar or global short-word matching is used. |

All detailed chat activity notifications remain English: thinking (`Thinking`, `Thinking…`, `Thinking...`, `Thought for N seconds`), `Sent message …`, tool/search/file actions, CLI status, model-agent changes and compaction. Shared labels are translated in their Settings section, not in the transcript; chat bodies are never translated or observed. Submenu-label ownership ignores explicitly `aria-hidden` / `hidden` mirrors and `kbd` shortcuts, never deduplicates arbitrary visible strings; mirror handling is regression-tested, not individually verified in every live menu.

A separate translation tool and its background companion can conflict with this overlay: stopping only its page instance may allow that companion to reinject it. Before a coordinated hot replacement, stop any other tool's companion through its standard stop mechanism, restore its page changes, then stop this project's previous instance and install the new version. This version does not guess English from existing Chinese text or rewrite the transcript; evaluating its injection while its existing instance is active does not replace that instance.

Page discovery follows the observed connected ancestor chain of verified controls, retaining only its main-container route prefix with direct-child observers. The sampled route replaced children at the third DIV while retaining the first three ancestor objects; this is not a blanket subscription to every third-level DIV or a universal layout claim. Page text observers attach to individual fixed controls; the editable Lexical control is attribute-only. Removed controls, invalid owner markers and lost popup ownership disconnect their observers and restore only unchanged project-written translations. New page/menu coverage is fixture-verified and still awaits coordinated live review.

---

## 🚀 Quick Start

### 1. Requirements

| Component | Requirement |
| :--- | :--- |
| **OS & Application** | Windows, and **GitHub Copilot desktop** with WebView2 (target version `1.4.2`) |
| **PowerShell** | PowerShell 7 or newer (`pwsh`) |
| **Node.js** | Node.js 22 or newer (zero npm production dependencies at runtime) |
| **Git** | Standard Git installation to clone the repository |

### 2. Clone and Launch

> [!NOTE]
> These steps use the source preview. The normal launcher has not yet been validated end to end with a newly started application. During the startup wait, pressing `Ctrl+C` may still exit with a non-zero code. **Save your work and exit Copilot normally before running it.** Do not terminate Copilot forcibly or disable operating-system security.

```powershell
git clone https://github.com/YOIMIYA66/github-copilot-zh.git
Set-Location .\github-copilot-zh
# Review the downloaded source and license before executing the launcher.
.\start.cmd
```

- **Double-click**: You can also double-click `start.cmd` in the repository folder. On failure, its window stays open so you can read the error; press any key to close it.
- **Run the script directly**: When `.\start.ps1` is run from an interactive PowerShell, failures are shown and wait for Enter. `start.cmd` handles the pause itself to avoid prompting twice.
- **Administrator access**: The launcher does not request UAC elevation. Elevation does not resolve an already-running Copilot process; save your work and exit Copilot normally first.
- **Custom Installation Path**: The default executable is under `%LOCALAPPDATA%\Programs\GitHub Copilot\github.exe`. For another installation location, pass the actual executable path with `-AppPath`:
  ```powershell
  pwsh -NoProfile -File .\start.ps1 -AppPath "D:\CustomPath\GitHub Copilot\github.exe"
  ```
- **Runtime Behavior**: **Keep the terminal open** while using Copilot. The launcher starts a new signed application process and refuses to attach to an already-running instance.

### 3. Stop and Restore

- **Live Restore**: Press **`Ctrl+C`** in the terminal to unload the overlay and restore translated text back to English.
- **Remove Debug Port**: Exit Copilot normally and start it from its usual shortcut.
- **Unexpected Exit Recovery**: If the launcher or connection exits unexpectedly, normal app exit and restart clears the in-memory overlay. No persistent settings values are changed.

---

## 🤖 Ask an AI Assistant to Help Install

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
approve the security risks. Verify that Settings and supported static UI labels/descriptions (including an
account action menu only when its ownership conditions are met) are translated;
chat messages, tool output, Thinking/status labels, and mode/model names remain
unchanged. Keep Thinking / Thought for N seconds and Sent message lines in
English. Keep dynamic values, the Profile credit-usage row, external marketplace
content and unverified work-page tabs/empty states unchanged. Validate new
page controls only within the README's verified scopes. Translate the supported Artifacts status chip, but do not translate
Artifacts text appearing in message bodies. Message-footer relative time and
model labels are not supported in this preview because their DOM ownership has
not been verified; leave them unchanged and do not scan the transcript to find
them. Do not claim unverified controls are fully covered. Report any failure or
uncertainty and explain how to stop and restore the app.
```

---

## 🔒 Security and Troubleshooting

> [!WARNING]
> **Local Debugging Port Notice:** The debugging port is unauthenticated—other processes running as your user may be able to inspect or modify the application while debugging is enabled. Use it only on a trusted machine and close the app normally when finished. CDP and the WebView2 debug arguments are not stable Copilot APIs.

| Issue / Symptom | Cause & Resolution |
| :--- | :--- |
| **Existing `github.exe` process reported** | The launcher never terminates or attaches to existing processes. Save your work, exit Copilot normally, and retry. |
| **Verification or connection check fails** | If signature, listener, page identity, or connection checks fail, the launcher stops immediately without connecting to an unrecognized target or terminating the app. |
| **Labels remain English or controls behave unexpectedly** | The target version or DOM markup may have changed. Press `Ctrl+C` to stop the overlay and restart the app normally. |

---

## 🔍 How It Works & Project Structure

### System Architecture & Lifecycle

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/architecture-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="docs/images/architecture-light.png">
    <img alt="GitHub Copilot for Windows Localization Architecture & Lifecycle" src="docs/images/architecture-light.png" width="100%">
  </picture>
</p>

<p align="center">
  <sub>💡 Tip: Open <a href="docs/architecture.html"><b>docs/architecture.html</b></a> directly in your browser for the full interactive diagram (viewport zoom, theme toggle, trace animations, and exact source code references).</sub>
</p>

The illustration summarizes the original launcher/overlay flow; the scope table above documents the additional page-control boundaries in this revision.

1. **Pre-flight & Signature Check (`start.ps1`)**: Verifies PowerShell 7+ and Node.js 22+, checks the `GitHub, Inc.` Authenticode signature on `github.exe`, and ensures no `github.exe` instance is already running.
2. **Loopback Debug Launch (`start.ps1`)**: Allocates an ephemeral loopback port and launches `github.exe` with `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` bound strictly to `127.0.0.1`.
3. **Dual Process & Target Verification (`connect.js` / `verify-listener.ps1` / `cdp.js`)**: Before fetching `/json/list` and again after WebSocket open, verifies that the port is exclusively bound to `127.0.0.1` by a `Microsoft Corporation`-signed `msedgewebview2.exe` descending from the launched `github.exe` PID, and validates the `http://tauri.localhost` page target.
4. **Scoped Injection & Clean Restoration (`runner.js` / `injection.js` / `overlay.js`)**: Injects the scoped `MutationObserver` and dictionary; on `Ctrl+C`, deregisters the script and restores all tracked text nodes and attributes to their original values.

### Directory Layout

```text
github-copilot-zh/
├── start.cmd                # Double-click entry point (keeps error messages visible)
├── start.ps1                # PowerShell launcher (checks prerequisites, verifies signature, starts app)
├── docs/                    # Project documentation & architecture exports (interactive HTML & HiDPI diagrams)
├── src/
│   ├── runner.js            # Main runner (manages CDP lifecycle, script registration, and Ctrl+C cleanup)
│   ├── connect.js           # Verified connector (runs verify-listener.ps1 before and after WebSocket open)
│   ├── verify-listener.ps1  # Verifies loopback binding, WebView2 signature, and process tree ancestry
│   ├── cdp.js               # Zero-dependency minimal CDP client and page target selector (selectTarget)
│   ├── injection.js         # Page injection payload generator, removal logic, and diagnostic actions
│   ├── overlay.js           # Core DOM overlay (structural allowlists, MutationObserver, bounded batching)
│   ├── dictionary.js        # Hand-written English-to-Chinese fixed UI dictionary
│   └── diagnose.js          # Developer diagnostic CLI (install / status / stop)
└── test/
    ├── benchmark.js         # Synthetic JSDOM benchmark script
    ├── cdp.test.js          # Unit tests for CDP client and target selection
    ├── chrome.test.js       # Unit tests for static main-window UI and verified menus
    ├── injection.test.js    # Unit tests for script injection, origin checks, and diagnostics
    ├── launcher.test.js     # Tests for the Windows double-click entry point and failures
    ├── overlay.test.js      # Unit tests for Settings translation, dynamic mutations, and restoration
    └── settings-pages.test.js # Unit tests for Settings page structural coverage
```

---

## ⚡ Performance Design & Sample Metrics

This design aims to keep overhead low and avoid observing streaming chat, **but does not guarantee zero overhead or smooth rendering on every device**. Below are single-run real-app and synthetic JSDOM samples for reference (timings vary by hardware and workload and are not a general performance guarantee).

### 1. WebView2 Diagnostic-Attachment Sample (GitHub Copilot desktop 1.4.2, single run)

The diagnostic overlay was installed in the running app, stopped/restored, and replaced with the normal `measure: false` overlay without restarting the app or changing any input or menu selection:

| Sample Window | `settingsScans` | `portalScans` | `chromeScans` | `callbacks` | Overlay Timing Summary |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **~8 s before menu interactions (closed)** | `+0` | `+0` | `+0` | `+0` | No scans or callbacks triggered |
| **Open & close each of 4 menus once** | `+0` | `+12` | `+20` | `+23` | **5 batches**: p95 / max `1.40 ms` (`3.60 ms` total)<br>**26 callbacks**: p95 `0.30 ms` / max `0.40 ms` (`2.50 ms` total) |
| **~8 s after menu interactions (closed)** | `+0` | `+0` | `+0` | `+0` | No scans or callbacks triggered |
| **Final Cumulative Counts** *(incl. 4 root scans)* | `0` | `12` | `24` | `26` | — |

> **Sample Limitations**: These are internal overlay timings, not whole-app CPU, memory, or FPS measurements. This run exercised native-input menu open/close interactions only, without synthetic chat load or a sentence-by-sentence translation coverage audit. Account action menus and PR/Issue tabs were not individually rechecked in the live app.

### 2. Synthetic JSDOM Benchmark (`npm run benchmark`, single run)

`npm run benchmark` checks whether synthetic chat-body updates trigger Settings or fixed-UI scans and reports processing counts and timings on a synthetic JSDOM tree (**not a WebView2 measurement, CPU benchmark, or real-world rendering latency claim**). Only observed fixed time-window choices are translated in the owned `sessions-cli-sessions` dropdown. Accounts-page actions are matched only when their trigger belongs to the Accounts Settings page and popup ownership is valid; that menu structure has not been rechecked in the live app.

| Synthetic Benchmark Scenario | Metric | Observed Value |
| :--- | :--- | :--- |
| **5,000 synthetic chat nodes, 1,000 chat updates (Settings closed/open)** | Settings / portal / fixed-UI scans; callbacks; elapsed | `0` / `0` / `0`; `0`; `448.35/511.03 ms` |
| **1,201 synthetic Settings elements (300 rows), initial translation through last item** | From dialog insertion to last heading and description | `394.46 ms` |
| **1,201 synthetic Settings elements, 1,000 fixed-label updates** | Settings scans; batch count / p95/max; observer callback count / p95/max; elapsed | `1,000`; `50` / `3.48/3.77 ms`; `150` / `0.13/0.23 ms`; `828.85 ms` |
| **Unverified PR/Issue / Automations / removed work page, same chat load** | Scans / callbacks; elapsed by scenario | All `0`; `500.81/498.68/510.66 ms` |
| **Verified Automations header present / removed, same chat load** | Scans / callbacks; elapsed by scenario | All `0`; `519.34/530.76 ms` |
| **3 verified page controls, 300 label updates** | Fixed-UI scans; batch count / p95/max; callback count / p95/max; elapsed | `300`; `50` / `2.06/3.06 ms`; `150` / `0.55/0.98 ms`; `538.75 ms` |
| **1,000 external-card description updates** | Scans / callbacks; elapsed | All `0`; `87.31 ms` |
| **5 fixed sidebar controls, 500 label updates** | Fixed-UI scans; batch count / p95/max; observer callback count / p95/max; elapsed | `500`; `50` / `2.09/2.22 ms`; `150` / `0.69/0.83 ms`; `460.07 ms` |

The benchmark includes verified sidebar and page controls and their direct-child boundaries. It measures the selected synthetic scenarios, not full page-translation coverage; unrelated structure without ownership markers remains unsupported. Setup translation and route bookkeeping settle before chat measurement; any chat-triggered scan or callback fails the benchmark. Update timing samples exclude initial setup. **38 tests** pass, including route replacement and initial-chat page discovery, editable-input and external-card zero-callback regressions, lost owner-marker/menu restoration, activity list keys/heading ownership, Chinese permission descriptions and unchanged tier/state values. Owned Settings composer fixtures also cover accessible action names without chat keyboard hints and a noninteractive Mode heading without a generated ID; these menu variants still need live review. A bounded audit found no missing dictionary entries or duplicate keys among **126 declared fixed strings** from the menu/choice/page/activity/shortcut declarations; it is not a live UI census. These are isolated DOM fixtures, not coordinated visual acceptance.

---

## 🛠️ Development

### Tests and Benchmark

`npm install` installs the development-only `jsdom` dependency and its transitive dependencies, whose license information is recorded in `package-lock.json`:

```powershell
npm install
npm test           # Run isolated unit tests
npm run benchmark  # Run synthetic DOM benchmark
```

### Diagnostic Attachment

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

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

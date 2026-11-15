<div align="center">

# GitHub Copilot Desktop UI in Chinese
### GitHub Copilot Desktop 中文汉化层

[![Platform](https://img.shields.io/badge/Platform-Windows%20(WebView2)-0078D4?logo=windows)](https://learn.microsoft.com/microsoft-edge/webview2/)
[![Target](https://img.shields.io/badge/Copilot%20Desktop-1.4.2-24292F?logo=githubcopilot)](https://github.com/features/copilot)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2022-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PowerShell](https://img.shields.io/badge/PowerShell-%E2%89%A5%207-5391FE?logo=powershell&logoColor=white)](https://github.com/PowerShell/PowerShell)
[![Dependencies](https://img.shields.io/badge/Runtime%20Deps-0-success)](./package.json)
[![Status](https://img.shields.io/badge/Status-Source%20Preview-orange)](./README.en.md)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

**[简体中文](./README.md) | English**

</div>

---

> [!IMPORTANT]
> **Source preview:** The overlay has been partially checked in a running application, but the normal launcher has not been tested end to end. Translation coverage is incomplete. The development target is **GitHub Copilot desktop 1.4.2** on Windows using WebView2 (this is not a claim of full version compatibility; the desktop app, WebView2 DOM, and debugging interface may change without notice, and other versions have not been tested).

This project translates selected fixed Settings text and verified static desktop UI in GitHub Copilot desktop using a strict structural allowlist and a **hand-written Chinese dictionary**.

## ✨ Key Features

- **Hand-Written Dictionary, Zero External Calls**: Does not use machine translation, download a model, or require an API key. Zero npm production dependencies at runtime.
- **Non-Invasive In-Memory Overlay**: Never modifies the application executable (`github.exe`) or installation files. Press `Ctrl+C` or restart the app normally to restore everything cleanly.
- **Strict Translation Boundaries**: Translates fixed Settings text, static sidebar and Composer labels, and fixed copy in menus whose triggers and menu IDs are bidirectionally verified. Chat messages, tool output, Thinking/status labels, code, personal input/profile data, counts, and dynamic mode/model names stay unchanged.
- **Multi-Layer Security Verification**: Verifies Authenticode signatures for both `github.exe` (`GitHub, Inc.`) and `msedgewebview2.exe` (`Microsoft Corporation`), process ancestry, page origin (`http://tauri.localhost`), and `127.0.0.1` loopback binding before and after connecting.
- **Scoped Observation & Bounded Batching**: Observes narrow fixed-control roots, direct children of the main container, and verified open menus; it does not observe the conversation body subtree. Settings and menu changes are processed in bounded batches (up to 150 nodes or 4 ms per slice).

## 🎯 Translation Scope & Sample Metrics

| Category | Policy | Details |
| :--- | :--- | :--- |
| **✅ Translated** | Structural allowlist + exact dictionary match | Settings navigation, section headers, titles and descriptions; supported split paragraphs; sidebar Automations/Customize; Composer Background/Artifacts labels; and fixed copy in bidirectionally verified mode, model, context, and profile menus |
| **🛡️ Untouched** | Explicitly excluded & protected | Chat messages, Thinking and other status labels, tool output, workspace content, code blocks (`code`/`pre`), keyboard shortcuts (`kbd`), user input, project/repository/profile data, counts, and names such as Interactive/Plan/Autopilot, models, and tiers |

Tooltips with unverified ownership remain in English. For example, the standalone Max-tier details tooltip is not translated because its accessible-name relationship to a specific menu option has not been verified.

**Performance Note:** This design does not guarantee zero overhead or smooth rendering on every device. `npm run benchmark` checks whether synthetic chat-body updates trigger Settings or fixed-UI scans and reports batch timings on a JSDOM DOM. This is not a WebView2 measurement, CPU benchmark, or real-world latency claim.

| Synthetic Benchmark Scenario | Metric | Observed Value |
| :--- | :--- | :--- |
| **5,000 synthetic chat nodes, 1,000 chat updates (Settings closed)** | Settings scans / fixed-UI scans; elapsed in this run | `0` / `0`; about `198.23 ms` |
| **5,000 synthetic chat nodes, 1,000 chat updates (Settings open)** | Settings scans / fixed-UI scans; elapsed in this run | `0` / `0`; about `229.63 ms` |
| **1,201 synthetic Settings elements (300 rows), initial translation through last item** | From dialog insertion to last translation | About `154.37 ms` |
| **1,201 synthetic Settings elements, 1,000 fixed-label updates** | Batch p95/max; observer callback p95/max | `4.06/4.19 ms`; `0.09/2.01 ms` |

**WebView2 diagnostic-attachment sample (GitHub Copilot desktop 1.4.2, one run):** The diagnostic overlay was installed in the running app, stopped/restored, and replaced with the normal `measure: false` overlay; the app was not restarted, and no input or menu value was changed. In closed-menu samples of about eight seconds before and after the menu interactions, deltas for `settingsScans`, `portalScans`, `chromeScans`, and `callbacks` were all `0`. Opening and closing each of the four menus once with native input produced deltas of `0/12/20/23`; five processing batches measured p95/max `1.40 ms` and `3.60 ms` total, while 26 callbacks measured p95 `0.30 ms`, max `0.40 ms`, and `2.50 ms` total. Final cumulative counts were `settingsScans=0`, `portalScans=12`, `chromeScans=24`, and `callbacks=26` (including four initial chrome-root scans). These are overlay timings, not whole-app CPU, memory, or FPS measurements; the sample is small and not a general performance guarantee. This script exercised menus only, without synthetic chat load or a sentence-by-sentence translation coverage audit.

---

## 📋 Requirements

- **OS & Application**: Windows, and **GitHub Copilot desktop** with WebView2 (target version `1.4.2`).
- **PowerShell**: PowerShell 7 or newer (`pwsh`).
- **Node.js**: Node.js 22 or newer (the runtime has no npm production dependencies).
- **Git**: A normal Git installation to clone the project.

---

## 🚀 Installation and Use

> [!NOTE]
> These steps use the source preview. The normal launcher has not yet been validated end to end with a newly started application. During the startup wait, pressing `Ctrl+C` may still exit with a non-zero code. **Save your work and exit Copilot normally before running it.** Do not terminate Copilot forcibly or disable operating-system security.

### 1. Clone and Launch

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

### 2. Stop and Restore

- Press **`Ctrl+C`** in the terminal to request restoration of translated text.
- Exit Copilot normally and start it from its usual shortcut to remove the debug port as well.
- If the launcher or connection exits unexpectedly, normal app exit and restart clears the in-memory overlay. No settings values are intended to be changed.

---

## 🔒 Security and Troubleshooting

> [!WARNING]
> **Local Debugging Port Notice:** The debugging port is unauthenticated—other processes running as your user may be able to inspect or modify the application while debugging is enabled. Use it only on a trusted machine and close the app normally when finished. CDP and the WebView2 debug arguments are not stable Copilot APIs.

- **Existing `github.exe` process reported**: Save your work and exit that application normally before retrying (the launcher never terminates existing processes).
- **Verification or connection failure**: If signature, listener, page identity, or connection checks fail, the launcher stops instead of connecting to an unrecognized target. It does not terminate the app.
- **Labels remain English or controls behave unexpectedly**: Stop the overlay and restart the app normally; the target version or DOM markup may have changed.

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
approve the security risks. Verify that Settings and supported static UI labels/descriptions are translated;
chat messages, tool output, Thinking/status labels, and mode/model names remain
unchanged. Report any
failure or uncertainty and explain how to stop and restore the app.
```

---

## 🛠️ Development

### Tests and Benchmark

`npm install` installs the development-only `jsdom` dependency and its transitive dependencies, whose license information is recorded in `package-lock.json`:

```powershell
npm install
npm test           # Run isolated unit tests
npm run benchmark  # Run synthetic DOM benchmark (not a WebView2 measurement or real-world latency claim)
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

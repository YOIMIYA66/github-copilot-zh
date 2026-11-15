# GitHub Copilot desktop settings in Chinese

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
guarantee zero overhead or smooth rendering on every device. In one real-app sample lasting eight seconds after Settings closed, no settings
scans or observer callbacks occurred. In one ten-page navigation sample,
55 processing batches had a p95 of about 1.2 ms and a maximum of 1.7 ms;
64 observer callbacks had a p95 of about 0.7 ms and a maximum of 1.9 ms.
These are individual samples, not a CPU benchmark or a guarantee for other
devices and workloads.

## Requirements

- Windows, GitHub Copilot desktop with WebView2, and PowerShell 7 or newer.
- Node.js 22 or newer. The runtime has no npm production dependencies.
- A normal Git installation to clone the project.

## Installation and use

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

### Security and troubleshooting

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

## Ask an AI assistant to help install

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

## Development

`npm install` installs the development-only jsdom dependency and its
transitive dependencies, whose license information is recorded in
`package-lock.json`. Run `npm test` for isolated tests and
`npm run benchmark` for the synthetic DOM benchmark. The benchmark is not a
measurement of WebView2 or a claim about real-world latency.

### Diagnostic attachment

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

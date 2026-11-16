# Changelog

## 0.1.1

First tagged release of this independently implemented project.

### Fixed and restored

- Restore verified fixed repository Settings copy, including server-ready headings/descriptions, repository MCP empty states, instructions, automation defaults and plugin headings.
- Restore owned Artifacts labels, Accessibility announcement settings, permission descriptions and PR/Issue filter labels without translating transcript content or actual saved values.
- Repair Tool permissions labels and descriptions when the Mode button has the positively observed localized accessibility label. Retain the displayed Interactive, Plan and Autopilot names.
- Discover later nested menu portals through direct-child observation of an already-owned portal; keep fixed submenu labels translated after host rerenders.
- Include the existing owned usage-popup fixed labels and suffixes while preserving numbers, percentages and context values.

### Scope and verification

- Windows, PowerShell 7+ and Node.js 22+ are required. Runtime code has no npm production dependencies.
- Coordinated live checks target GitHub Copilot desktop 1.4.2 with WebView2; the repaired permissions menu was accepted by the user. Other versions are not verified.
- Conversation bodies, Thinking/Thought labels, code, tool output, personal input and repository identity stay unchanged.
- Translation uses only a manual dictionary, with no machine-translation service, model downloads or API key. The launcher does not modify the signed application.

### Known limitations

- The first mixed repository-removal sentence remains English in the observed app; its independent deletion-warning tail translates. Synthetic regressions do not establish full live coverage.
- A fresh application launch through the normal launcher has not been verified end to end. Save work and exit Copilot normally before launching; do not force-terminate it.
- Some popup variants remain fixture-only or unverified. WebView2 DOM and debugging parameters are not stable official localization APIs.

### Distribution

- `github-copilot-zh-0.1.1-source.zip` contains runnable source, launchers, documentation, license and regression tests. Extract and review it, then run `start.cmd`.
- No `node_modules`, personal application files, debug logs or translation models are included. Developer dependencies are needed only to run tests.

export function startSettingsTranslation(document, dictionary, options = {}) {
  const portal = document.getElementById("portal-root");
  if (!portal) throw new Error("Copilot portal root was not found");
  const navPages = new Set([
    "general", "account", "sessions", "themes", "accessibility", "voice",
    "computer-use", "model-providers", "experimental", "environments", "repositories"
  ]);
  const fixedSections = new Set([
    "general-about", "general-auto-update", "general-launch-at-login", "general-tray-menu",
    "general-delete-chat-confirmation", "general-delete-view-confirmation",
    "general-find-in-workspace-position", "general-notification-sound", "general-theme",
    "sessions-manage-sessions", "sessions-verbosity", "sessions-image-generation-watermark",
    "sessions-auto-approve", "sessions-agent-merge-byline", "sessions-commit-attribution",
    "sessions-memory", "sessions-remote-default", "sessions-remote-discovery",
    "sessions-keep-awake", "sessions-delete-confirmation", "sessions-archive-confirmation",
    "sessions-close-terminal-confirmation", "sessions-edit-message-confirmation",
    "sessions-retry-response-confirmation", "sessions-cli-sessions",
    "sessions-session-lifecycle", "accessibility-display",
    "accessibility-notifications", "accessibility-announcements",
    "accessibility-keyboard-shortcuts-toggle", "accessibility-keyboard",
    "accessibility-conversation-transcript", "voice-mode-input-device",
    "voice-mode-shortcut", "voice-mode-recording-behavior", "voice-mode-language",
    "experimental-experiments", "themes-mode", "themes-terminal", "computer-use-general"
  ]);
  const popupWords = {
    "general-find-in-workspace-position": ["Top right", "Top left", "Bottom right", "Bottom left", "Center"],
    "sessions-default-model": ["Latest used", "Preferred model"],
    "sessions-worktree-location": ["Global storage", "Inside repository", "Next to repository", "Custom"],
    "sessions-verbosity": ["Minimal", "Balanced", "Detailed", "Concise", "Verbose", "Collapse completed turn details behind a summary panel",
      "Group consecutive tool calls into a single panel", "Show every tool call and intermediate message"],
    "sessions-remote-default": ["Disabled", "View only", "Remote control",
      "Sessions are only available on this device", "View session activity from another device",
      "Control sessions from another device"],
    "sessions-remote-discovery": ["1 day", "7 days", "14 days", "30 days", "90 days"],
    "sessions-cli-sessions": ["Off", "Last 3 days", "Last 7 days", "Last 14 days", "Last 30 days",
      "Last 90 days", "Last 180 days", "Last 360 days"],
    "sessions-session-lifecycle": ["Disabled", "1 day", "7 days", "15 days", "30 days", "60 days", "90 days"],
    "sessions-auto-approve": ["Approve all", "Run tools without asking.", "Assisted",
      "Uses AI to reduce approval prompts.", "Ask every time", "Ask before running tools."],
    "accessibility-notifications": ["5 seconds", "10 seconds", "30 seconds", "1 minute",
      "5 minutes", "10 minutes", "30 minutes", "Indefinite"]
  };
  const colorFilterPopupWords = [
    "No adjustment", "Keep the palette's original colors.",
    "Red color blind (Protanopia)", "Reds look dark or blend with greens.",
    "Green color blind (Deuteranopia)", "Greens blend with reds or browns.",
    "Blue-yellow color blind (Tritanopia)", "Blues blend with greens; yellows with pinks."
  ];
  const actionWords = {
    "general-about": ["Check for updates"],
    "general-workspace-location": ["Change location…"],
    "general-theme": ["Change theme"],
    "sessions-manage-sessions": ["Manage sessions"],
    "voice-mode-input-device": ["Learn more", "Open preferences", "Test mic"],
    "model-providers-providers": ["Add provider"]
  };
  const chromeWords = {
    sidebar: ["Manage accounts", "Switch account", "Manage sessions", "Theme", "Keyboard shortcuts", "Health check",
      "What's new", "About", "Help center", "Sign out"],
    sidebarTheme: ["System", "Light", "Dark", "Open themes settings"],
    sidebarNewSession: ["Chat", "Start session in", "Add from GitHub", "Add from URL",
      "Add local folder or repository"],
    composerMode: ["Mode", "Step-by-step collaboration", "Plan first, execute when ready",
      "End-to-end execution without interruption", "Tool permissions", "Approve all"],
    composerPermissions: ["Approve all", "Always ask", "Ask every time", "Assisted",
      "Ask before running tools.", "Uses AI to reduce approval prompts.", "Run tools without asking."],
    composerEffort: ["Low", "Medium", "High", "Extra High", "Max"],
    composerModel: ["Model", "Effort", "Context window", "Content window", "Effort level", "Learn more", "On", "Off", "Retry",
      "Models will be available when the local session is running.",
      "Prioritizes capable models for challenging tasks and deeper reasoning.",
      "Prioritizes the most capable models for the most demanding tasks and complex reasoning.",
      "Prioritizes versatile models for efficient everyday coding."],
    composerContext: ["Repository file or folder…", "Repository file or folder...", "Project file or folder...", "Session…", "Session...", "Files…", "Files...", "Folder…", "Folder..."],
    customizeAdd: ["MCP Server…", "Plugin…", "Skill", "Canvas from URL…", "Manage marketplaces…"],
    sidebarSessionConfig: [
      "Grouping", "Ordering", "Show", "Status", "PR", "Environment", "Source",
      "Reset filters", "Collapse all", "Expand all", "Mark all as read",
      "Repository", "Updated"
    ],
    sidebarSessionConfigGrouping: ["Repository", "Last updated", "Status", "Environment"],
    sidebarSessionConfigOrdering: ["Updated", "Created", "Status", "Name (A-Z)", "Name (Z-A)"],
    sidebarSessionConfigShow: ["Repository", "Branch"],
    sidebarSessionConfigStatus: ["Needs attention", "Unread", "Working", "Done"],
    sidebarSessionConfigPR: ["Draft", "Open", "Merged", "Closed", "No PR"],
    sidebarSessionConfigEnvironment: ["Cloud", "Codespaces", "WSL", "SSH", "Other remote", "Local"],
    sidebarSessionConfigSource: ["Desktop", "CLI", "Automations"],
    composerEnvironment: ["This computer", "Cloud", "Environments", "Codespaces", "Local"],
    commandPalette: ["Switch model", "Set thinking effort", "Check for updates", "Resume remote session", "Resume session by ID", "New session", "New project", "New issue", "Undo"],
    workspacePanel: [
      "Session", "Library", "Terminal", "Browser", "Files", "Side chat", "My work",
      "Insights", "Canvas", "Add tab", "Overview", "Pick & Polish",
      "Use Pick & Polish to refine your frontend",
      "Enter a local dev URL, then press",
      "to pick elements and polish them live.",
      "Enter a URL", "URL",
      "Share browser tab with agent",
      "Light preview theme", "Dark preview theme", "Preview color scheme"
    ],
    msgMore: ["Share as secret gist", "Fork chat from response", "Fork session from response"]
  };
  const accountActionWords = ["Update authorization", "Manage plan", "Remove account", "Set as default"];
  const permissionTitles = { Assisted: "辅助模式", "Approve all": "全部允许" };
  const modeTitles = { Interactive: "协作", Plan: "规划", Autopilot: "自动执行" };
  const modeTriggerLabel = /^(?:Mode: (?:Interactive|Plan|Autopilot)|模式：(?:协作|规划|自动执行))(?:[，,]\s*Ctrl \+ Shift \+ M)?$/;
  const activityLabels = {
    reasoning: "Reasoning", "tool-calls": "Tool calls", "code-search": "Code search",
    "reading-files": "Reading files", "creating-files": "Creating files", "editing-files": "Editing files",
    "cli-commands": "Running CLI commands", "cli-exit": "CLI commands finish running",
    "model-change": "Changing models and agents", compaction: "Compacting the conversation"
  };
  const shortcutLabels = ["Go back", "Go forward", "Previous session", "Next session",
    "Open review changes", "Run current session", "Stop running", "Submit pull request review",
    "Previous region", "Next region", "Toggle sidebar", "Go to selection actions",
    "Collapse or expand thinking", "Expand tables", "Previous artifact", "Next artifact",
    "Command palette", "Find in file", "Find next match", "Find previous match", "Open settings",
    "View keyboard shortcuts", "Go to session by number", "Next unread session",
    "Quote selection", "Copy selection", "Add widget", "Add repositories", "Save widget repositories",
    "Older version", "Newer version", "Toggle file edits panel", "Toggle panel", "Toggle file tree",
    "Maximize or restore panel", "Go to review changes", "Go to pull request overview", "Open plan panel",
    "Open or cycle terminal", "Collapse all diff files", "Go to file", "New session", "New chat",
    "New project", "Run or stop current session", "Search recent prompts", "Open model and reasoning",
    "Show usage popover", "Cycle through composer modes", "Decrease reasoning effort", "Increase reasoning effort",
    "New tab", "Switch to tab by number", "Previous tab", "Next tab", "Close tab", "Split right", "Split down",
    "Reopen last closed tab", "Toggle Pick & Polish", "Capture screenshot", "Open pull request review",
    "Submit comment", "Quote reply", "Attach selection to prompt", "Attach selection to prompt with comment",
    "Activate voice transcription", "Assign…"];
  const sidebarNavigationSelector = '[data-sidebar-live-width] > div > [data-testid="sidebar-scroll-viewport"] > div > nav';
  const sidebarBoundarySelectors = [
    "[data-sidebar-live-width]", "[data-sidebar-live-width] > div",
    '[data-sidebar-live-width] > div > [data-testid="sidebar-scroll-viewport"]',
    '[data-sidebar-live-width] > div > [data-testid="sidebar-scroll-viewport"] > div'
  ];
  const sidebarItems = {
    home: { command: "navigation.home", label: "New" },
    pulls: { command: "navigation.pulls", label: "Pull requests" },
    issues: { command: "navigation.issues", label: "Issues" },
    workflows: { command: "navigation.automations", label: "Automations" },
    extensions: { command: "navigation.customize", label: "Customize" }
  };
  const projectsSection = '[data-sidebar-live-width] > div > [data-testid="sidebar-scroll-viewport"] > div > div > section[aria-labelledby="sidebar-agents-heading"]';
  const sessionsSection = '[data-sidebar-live-width] [data-sidebar-session-list="true"] > div > ul[role="presentation"] > li[role="presentation"] > section[aria-labelledby]';
  const sidebarStaticSelectors = [
    `${projectsSection} > div[data-sidebar-section-header] > h3#sidebar-agents-heading > button[aria-expanded] > span`,
    `${projectsSection} > ul[role="tree"] > li[role="treeitem"]:only-child`,
    '[data-sidebar-live-width] [data-sidebar-session-list="true"] > div > h3#sidebar-sessions-heading',
    `${sessionsSection} > div[data-sidebar-section-header] > h4[id] > button > span`,
    `${sessionsSection} > ul[role="tree"][aria-labelledby][data-sidebar-session-summary-hint-group] > li[role="treeitem"] > div[data-testid="repository-group-row"] > div#sidebar-group-quick-chats > span:last-child`,
    '#sidebar-heading',
    '#quick-links-heading'
  ];
  const sidebarStaticRoots = new WeakSet();
  const sidebarStaticBoundaries = new Map();
  const sidebarNewSessionTrigger = '[data-sidebar-live-width] [data-sidebar-session-list="true"] > div > div > button[data-testid="sidebar-new-session"][aria-haspopup="menu"][id]';
  const sidebarSessionLabelRules = [
    { selector: ':scope > div > div > div[role="menuitem"][data-command="chat.create"] > span', word: "Chat" },
    ...[["project.add-github", "Add from GitHub"], ["project.add-from-url", "Add from URL"],
      ["project.add-folder", "Add local folder or repository"]].map(([command, word]) => ({
      selector: `:scope > div > div > div[role="none"] > div[role="menuitem"][data-command="${command}"] > span`, word
    })),
    { selector: ':scope > div > div > div[role="none"] > div[aria-hidden="true"]', word: "Start session in" }
  ];
  const annotationPreview = '#portal-root > [data-base-ui-portal] > div[role="dialog"][data-open][data-testid="image-preview-dialog"][data-image-preview-dialog][data-window-dialog-position="fullscreen"]';
  const annotationEditor = `${annotationPreview} > div[data-testid="browser-screenshot-annotation-editor"]`;
  const annotationMount = `${annotationEditor} > div`;
  const annotationToolbar = `${annotationMount} > div[data-testid="browser-screenshot-annotation-toolbar"]`;
  const annotationMountSelectors = ['#portal-root > [data-base-ui-portal]', annotationPreview,
    annotationEditor, annotationMount];
  const usageTriggerSelector = 'button[data-base-ui-click-trigger][aria-haspopup="dialog"][aria-label^="AI credits quota:"]';
  const chromeRootSelectors = [
    'nav[aria-labelledby="quick-links-heading"]', "[data-sidebar-footer]",
    '[data-testid="composer-pills"]', "[data-rich-composer-footer]", sidebarNavigationSelector, annotationToolbar,
    ...sidebarStaticSelectors, sidebarNewSessionTrigger,
    'button[data-testid="sidebar-session-configuration"]',
    'button[data-testid="sidebar-feedback-button"]',
    'button[data-testid="navigation-back-button"]',
    'button[data-testid="navigation-forward-button"]',
    'button[aria-label^="Toggle sidebar"]',
    'button[aria-label^="切换侧栏"]',
    'button[aria-label="Search"]',
    'button[aria-label^="Search,"]',
    'button[aria-label="搜索"]',
    'button[aria-label^="搜索，"]',
    'button[aria-label^="New session"]',
    'button[aria-label="New chat"]',
    'button[aria-label^="新建会话"]',
    'button[aria-label="新建聊天"]',
    '[data-sidebar-live-width] div[role="separator"]',
    '[data-sidebar-resize-handle]',
    'main button[aria-label^="Environment:"], main button[aria-label^="环境："]',
    'main button[aria-label^="Repository:"], main button[aria-label^="仓库："]',
    'aside[data-testid="chat-canvas-panel"]'
  ];
  const chromeRootSelector = chromeRootSelectors.join(",");
  const sidebarBoundaryObservers = new Map();
  const sidebarNavigationRoots = new WeakSet();
  const themeSectionIds = new Set(["general-theme", "themes-mode", "themes-terminal"]);
  const projectSections = new Set(["project-copilot-account", "project-sidebar", "project-code-search",
    "project-repository-configuration", "project-sandbox-policy", "project-instructions",
    "project-default-branch", "project-branch-prefix", "project-branch-update-strategy", "project-reusable-worktrees",
    "project-browser-auto-open", "project-remote-control", "project-github-account", "project-scripts",
    "project-server-ready-pattern", "project-sparse-checkout", "project-automation", "project-removal"]);
  const projectNavSections = new Set([...projectSections, "project"]);
  const chromeRoots = new Set();
  const chromeRootObservers = new Map();
  let mainRoot = document.querySelector("main[data-app-shell-main]");
  const observedMainRoots = new WeakSet();
  const factory = '[data-factory-proposal-host="true"]';
  const factoryHeader = `${factory} header [data-customize-category-header-row]`;
  const setup = `${factory} [role="tabpanel"] main > div > div > div[data-size="medium"]`;
  const customizeHeader = 'header[data-content-leading-inset][data-f6-nav] [data-customize-category-header-row]';
  const customizeCategories = [
    "All", "Plan", "Build", "Review", "Test", "Ship", "Monitor", "Design", "Knowledge", "Data", "Communication",
    "Development", "Infrastructure", "Databases", "Intelligence", "Web", "Productivity", "Observability", "Commerce"
  ];
  const composerPlaceholders = [
    "Ask anything. Use / for commands or & for sessions…",
    "Ask anything. Use / for commands or & for sessions...",
    "Ask anything. Use / for commands, & sessions, # issues…",
    "Ask anything. Use / for commands, & sessions, # issues...",
    "Ask anything. Use / for commands, & sessions, @ files…",
    "Ask anything. Use / for commands, & sessions, @ files...",
    "Ask anything or paste a URL. Use / for commands, & sessions, # issues…",
    "Ask anything or paste a URL. Use / for commands, & sessions, # issues...",
    "Steer this session…",
    "Steer this session..."
  ];
  const pageRules = [
    { selector: '[data-testid="my-work-inbox-view"] > [data-testid="my-work-list-pane"] > header[data-content-leading-inset][data-tauri-drag-region][data-f6-nav] > div > div > h1',
      words: ["Pull requests", "Issues"], workHeading: true },
    { selector: 'button[data-command="issue.create"] > div > span',
      words: ["New issue"], issueButton: true },
    { selector: 'button[data-command="issue.create"] > span[data-component="content"] > span[data-component="label"]',
      words: ["New issue"], issueButton: true },
    { selector: '[data-testid="my-work-inbox-view"] > [data-testid="my-work-list-pane"] > [data-testid="my-work-filter-bar"] > div > [data-tab-row-scroller] > [role="tablist"]',
      words: ["Authored by me", "Assigned to me", "Involves me", "Review requests", "Done", "Created by me", "Mentioning me"],
      workFilters: true },
    { selector: '[data-testid="my-work-inbox-view"] > [data-testid="my-work-list-pane"] > div > [data-testid="my-work-inbox-scroll-container"][role="tabpanel"]',
      words: ["Nothing here"], emptyHost: true },
    { selector: `${factory} header:has([data-customize-category-header-row]) h1`, words: ["Automations"] },
    { selector: `${factoryHeader} [data-customize-category-drag-region] [data-tab-row-scroller] > [role="tablist"]`,
      words: ["Personal", "Shared", "Dreaming"] },
    { selector: `${factoryHeader} button[data-new-automation-action][data-size="small"]`,
      words: ["New automation"] },
    { selector: `${factoryHeader} [role="search"] input[data-size="small"]`,
      attribute: "placeholder", words: ["Search personal automations…", "Search personal automations..."] },
    { selector: `${setup} > div > div:nth-child(2)`,
      words: ["Set up automations",
        "Use agents to handle recurring work on a cadence you choose or triggered by events. You can start from scratch or turn an existing agent skill into an automation."],
      setup: true },
    { selector: `${setup} [data-prompt-composer-v2][data-command-context="prompt-composer"] [data-rc-consumer="prompt-composer"] [role="textbox"][contenteditable="true"][data-lexical-editor="true"]`,
      attribute: "data-placeholder",
      words: ["Describe what this automation should do. Type / for skills…",
        "Describe what this automation should do. Type / for skills..."],
      setup: true },
    { selector: `${setup} button[data-base-ui-tooltip-trigger][aria-describedby]`,
      words: ["Chat"], setup: true },
    { selector: `${customizeHeader} [data-customize-category-drag-region] [data-customize-category-tabs-root="true"]`,
      words: ["Browse", "Installed"] },
    { selector: 'header[data-content-leading-inset="true"][data-f6-nav] > h1',
      words: ["Customize"], customizeHeading: true },
    { selector: '[role="tabpanel"] [data-testid="customize-category-filter"] button[role="tab"] span, [role="tabpanel"] h2#browse-integrations-heading',
      words: customizeCategories, customizeCategory: true },
    { selector: `${customizeHeader} button[data-testid="extensions-add-menu-trigger"][aria-haspopup="menu"]`,
      words: ["Add"], kind: "customizeAdd" },
    { selector: '[role="tabpanel"] [role="search"] button[data-testid="customize-type-filter-trigger"][aria-haspopup="menu"]',
      words: ["All types"], customize: true },
    { selector: '[role="tabpanel"] [role="search"]:has(button[data-testid="customize-type-filter-trigger"]) input[data-size="large"]',
      attribute: "placeholder",
      words: ["Search MCP servers, plugins, skills and more…", "Search MCP servers, plugins, skills and more..."],
      customize: true },
    { selector: 'section[aria-labelledby="featured-editors-picks-heading"] h2[id="featured-editors-picks-heading"]',
      words: ["Editor’s picks", "Editor's picks"], customize: true },
    { selector: 'section[aria-labelledby="featured-editors-picks-heading"] div:has(> h2[id="featured-editors-picks-heading"]) > p',
      words: ["Standout ways to customize Copilot."], customize: true },
    { selector: '[role="tabpanel"] section:not([aria-labelledby="featured-editors-picks-heading"]) h2',
      words: ["Featured", "Plan, build, and ship", "Connect your work", "Extensions", "Canvas", "Skills", "Agents", "Library", "Tools"],
      customizeSectionTitle: true },
    { selector: '[role="tabpanel"] section:not([aria-labelledby="featured-editors-picks-heading"]) p',
      words: ["Tools for planning work, testing experiences, and shipping with confidence.", "Bring the tools and context you use every day into Copilot."],
      customizeSectionDesc: true },
    { selector: 'section[aria-labelledby="featured-editors-picks-heading"] ul[role="list"][aria-labelledby="featured-editors-picks-heading"] > li[data-carousel-card] button[data-variant="invisible"][data-size="small"]',
      words: ["Add canvas"], customize: true, cardAction: true },
    { selector: '[data-testid="conversation-composer-area"] div[data-rich-composer-placeholder="true"], main[data-app-shell-main] div[data-rich-composer-placeholder="true"]',
      words: composerPlaceholders, composerPlaceholderText: true },
    { selector: '[data-testid="conversation-composer-area"] div[role="textbox"][data-placeholder], main[data-app-shell-main] div[role="textbox"][data-placeholder]',
      attribute: "data-placeholder", words: composerPlaceholders, composerPlaceholderAttr: true },
    { selector: 'main[data-app-shell-main] h1', words: ["New"], homeHeading: true },
    { selector: 'main[data-app-shell-main] p',
      words: ["GitHub Copilot uses AI. Check for mistakes."], homeDisclaimer: true },
    { selector: '[data-testid="conversation-composer-area"] div[role="status"], main[data-app-shell-main] div[role="status"]',
      words: [
        "You've used all of your AI credits.",
        "Manage your budget to keep building.",
        "Manage budget"
      ],
      composerStatus: true },
    { selector: '[data-testid="conversation-composer-area"] button, [data-testid="prompt-suggestions"] button, [data-testid="home-actions"] button',
      words: [
        "Compare SQL and NoSQL database tradeoffs",
        "Compare SQL and NoSQL databases for real-time analytics.",
        "Design a REST API for a task management service",
        "Design a REST API for a task management application.",
        "Draft a product requirements doc for a mobile app",
        "Draft a product requirements doc for user authentication.",
        "Add a README explaining how the project works",
        "Add a README with setup instructions and usage guide.",
        "Scaffold a project with Vite, React, and TypeScript",
        "Scaffold a project structure with best practices.",
        "Find performance bottlenecks and optimization opportunities",
        "Find performance bottlenecks and optimize them.",
        "Manage budget",
        "Try now", "Dismiss", "This computer", "Cloud",
        "New session, Ctrl + N. New chat, Ctrl + Shift + N."
      ],
      homeButton: true }
  ];
  const pageControls = new Map();
  const pageBoundaryObservers = new Map();
  const emptyMessageRoots = new Set();
  const pageRouteBoundaries = new Set();
  const pageOwnerAttributes = ["role", "id", "aria-labelledby", "aria-describedby", "aria-haspopup",
    "data-size", "data-variant", "data-testid", "contenteditable", "data-user-content",
    "data-factory-proposal-host", "data-customize-category-tabs-root", "data-customize-category-header-row",
    "data-customize-category-drag-region", "data-tab-row-scroller", "data-new-automation-action",
    "data-content-leading-inset", "data-f6-nav", "data-tauri-drag-region", "data-window-caption-spacer",
    "data-command", "data-command-context", "data-rc-consumer", "data-lexical-editor", "data-prompt-composer-v2",
    "data-rich-composer-footer", "data-value", "data-open", "data-image-preview-dialog",
    "data-window-dialog-position"];
  const pageOwnerAttrSet = new Set(pageOwnerAttributes);
  const attrTargetSelector = 'input[role="searchbox"],input[role="combobox"],button[aria-label],textarea,[data-placeholder],[role="separator"],[data-sidebar-resize-handle]';
  const chromeObserverOptions = {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ["aria-expanded", "aria-controls", "aria-haspopup", "aria-labelledby", "aria-label",
      "id", "role", "data-testid", "data-open", "data-popup-open", "data-side", "data-align", "tabindex",
      "data-base-ui-focusable", "data-kbd-chord", "data-rootownerid", "aria-describedby",
      "data-sidebar-nav-item", "data-command", "data-sidebar-file-drop-kind", "data-selected",
      "data-user-content", "contenteditable", "data-menu-has-radio-item", "data-nested", "data-auto-tier-id",
      "aria-setsize", "aria-posinset", "hidden", "aria-hidden", ...pageOwnerAttributes]
  };
  const splitPatterns = [
    { section: "project-repository-configuration", tag: "P", parents: ["P", "P", "CODE", "P", "P"],
      original: ["Add a", " ", ".worktreeinclude", " ",
        "file to the repo root to auto-copy gitignored files into new worktrees."],
      translated: ["在仓库根目录添加", " ", ".worktreeinclude", " ",
        "文件，以自动将被 gitignore 忽略的文件复制到新工作树。"] },
    { section: "project-sandbox-policy", tag: "LI", parents: ["LI", "LI", "LI", "LI", "LI"],
      original: ["Network:", " ", "Internet allowed", " · ", "Local network allowed"],
      translated: ["网络：", "", "允许访问互联网", " · ", "允许访问本地网络"] },
    { section: "project-sandbox-policy", tag: "LI", parents: ["LI", "LI", "LI", "LI", "LI", "LI", "LI"],
      original: ["Credentials: Git", " ", "allowed", " · ", "GitHub CLI", " ", "allowed"],
      translated: ["凭据：", "", "允许使用 Git", " · ", "允许使用 GitHub CLI", "", ""] },
    { section: "general-tray-menu", tag: "P", parents: ["P", "P", "P"],
      original: ["Show the GitHub Copilot icon in the ", "system tray", "."],
      translated: ["在", "系统托盘", "中显示 GitHub Copilot 图标。"] },
    { section: "sessions-auto-approve", tag: "P", parents: ["SPAN", "SPAN", "CODE", "SPAN", "SPAN"],
      original: ["Choose when new local sessions ask before running tools. Once a session has started,", " ",
        "/permissions manual|assisted|allow-all", " ",
        "sets a session-specific override. Managed settings can restrict modes or set a different starting mode without changing this saved preference."],
      translated: ["选择新本地会话何时在运行工具前询问。会话启动后，", " ",
        "/permissions manual|assisted|allow-all", " ", "可为该会话单独设置。托管设置可能限制可用模式或指定其他初始模式，而不会更改此保存的偏好。"] },
    { section: "sessions-commit-attribution", tag: "P", parents: ["SPAN", "CODE", "SPAN", "SPAN"],
      original: ["Include a ", "Co-authored-by", " ", "trailer in commit messages written by Copilot."],
      translated: ["在 Copilot 编写的提交消息中包含 ", "Co-authored-by", " ", "署名。"] },
    { section: "sessions-branch-prefix", tag: "P", parents: ["SPAN", "SPAN", "CODE", "SPAN", "SPAN"],
      original: ["Prefix added to generated branch names. Use", " ", "%username%", " ", "for your GitHub login."],
      translated: ["添加到生成分支名称的前缀。使用", " ", "%username%", " ", "表示你的 GitHub 登录名。"] },
    { section: "sessions-worktree-location", tag: "P",
      parents: ["SPAN", "SPAN", 'BUTTON > SPAN[data-component="content"] > SPAN[data-component="label"]', "SPAN"],
      original: ["Store new worktrees under the", " ", "global storage location", "."],
      translated: ["将新工作树存储在", " ", "全局存储位置", "下。"] },
    { section: "themes-palette", tag: "P", parents: ["P", "BUTTON", "P"],
      original: ["Configure additional options in ", "Accessibility", "."],
      translated: ["在", "辅助功能", "中配置更多选项。"] },
    { section: "accessibility-keyboard-shortcuts-toggle", tag: "H3", parents: ["H3", "H3", "KBD", "KBD", "SPAN"],
      original: ["Cycle agent modes with", " ", "⇧", "⇥", "Shift + Tab"],
      translated: ["使用", " ", "⇧", "⇥", "Shift + Tab 循环切换代理模式"] }
  ];
  const policySummaryLinePatterns = new Map([
    [2, splitPatterns.find(pattern => pattern.section === "project-sandbox-policy" &&
      pattern.original[0] === "Network:")],
    [3, splitPatterns.find(pattern => pattern.section === "project-sandbox-policy" &&
      pattern.original[0] === "Credentials: Git")]
  ]);
  const tracked = new Map();
  const attributes = new Map();
  const chromePopupObservers = new Map();
  const feedbackPopups = new Set();
  const sessionContextPopups = new Set();
  const sessionContextBoundaryObservers = new Map();
  const usagePopupEntries = new Map();
  const usagePopupObserverStates = new Map();
  const usageTriggers = new WeakSet();
  const sidebarSessionBoundaries = new WeakMap();
  const stats = { settingsScans: 0, portalScans: 0, chromeScans: 0, callbacks: 0, unmatchedFixedNodes: 0, batchMs: [], callbackMs: [] };
  const unmatched = new WeakSet();
  const queue = [];
  let queueHead = 0;
  const queued = new Set();
  let timer = null;
  const ChannelCtor = document.defaultView.MessageChannel || globalThis.MessageChannel;
  const drainChannel = ChannelCtor ? new ChannelCtor() : null;
  let drainInFlight = false;
  let initialDrainDone = false;
  if (drainChannel) {
    drainChannel.port1.unref?.();
    drainChannel.port2.unref?.();
    drainChannel.port1.onmessage = () => {
      drainInFlight = false;
      if (!stopped && queueHead < queue.length) drain();
    };
  }
  function scheduleDrain() {
    if (stopped || drainInFlight || timer !== null) return;
    if (drainChannel) {
      drainInFlight = true;
      drainChannel.port2.postMessage(null);
    } else {
      timer = document.defaultView.setTimeout(drain, 0);
    }
  }
  let dialog = null;
  let colorFilterCache = null;
  let colorFilterCacheDirty = true;
  let colorPreviewFrame = null;
  let colorPreviewFrameLoad = null;
  let colorPreviewList = null;
  let colorPreviewLabels = new Map();
  let colorPreviewObserver = null;
  let stopped = false;
  let initialized = false;

  function chromeRootFor(element) {
    if (!element || !chromeRoots.size) return null;
    if (chromeRoots.has(element) && element.isConnected) return element;
    let nearest = null;
    for (const root of chromeRoots) {
      if (root.isConnected && root.contains(element) && (!nearest || nearest.contains(root))) nearest = root;
    }
    return nearest;
  }

  function addChromeRoot(root) {
    if (chromeRoots.has(root)) return;
    if (!pageControls.has(root) && root.closest("[data-user-content],[contenteditable]")) return;
    if (sidebarStaticSelectors.some(selector => root.matches(selector))) {
      if (!sidebarStaticKind(root)) return;
      sidebarStaticRoots.add(root);
    }
    if (root.matches(sidebarNavigationSelector)) sidebarNavigationRoots.add(root);
    chromeRoots.add(root);
    const rootObserver = new document.defaultView.MutationObserver(mutations);
    const rule = pageControls.get(root);
    rootObserver.observe(root, rule?.attribute ? { attributes: true,
      attributeFilter: [rule.attribute, ...pageOwnerAttributes] } : chromeObserverOptions);
    chromeRootObservers.set(root, rootObserver);
    scan(root, "chrome");
    if (root.matches(annotationToolbar)) {
      for (const button of root.querySelectorAll('button[data-base-ui-tooltip-trigger][aria-describedby]')) {
        observeAnnotationTooltips(button);
      }
    }
    if (initialized) {
      for (const trigger of root.querySelectorAll('button[aria-expanded="true"][aria-haspopup]')) {
        const popup = ownedPopupForTrigger(trigger);
        if (popup) {
          if (chromeMenuKind(trigger)) observeChromePopup(popup);
          scanOwnedPopup(popup);
        }
      }
      for (const trigger of root.querySelectorAll('button[data-popup-open]')) {
        scanHoverTooltipForTrigger(trigger);
      }
    }
  }

  function discoverChromeRoots(scope) {
    if (scope.nodeType === 1 && scope.matches(chromeRootSelector)) addChromeRoot(scope);
    for (const root of scope.querySelectorAll(chromeRootSelector)) addChromeRoot(root);
    if (scope.nodeType === 1 && scope.matches("[data-sidebar-live-width]")) discoverSidebarNavigation(scope);
    for (const sidebar of scope.querySelectorAll("[data-sidebar-live-width]")) discoverSidebarNavigation(sidebar);
    if (scope === document || mainRoot?.contains(scope)) refreshPageControls();
  }

  function discoverAnnotationMounts(scope) {
    const index = annotationMountSelectors.findIndex(selector => scope.matches(selector));
    if (index < 0) return false;
    let found = index > 0;
    const next = annotationMountSelectors[index + 1] || annotationToolbar;
    for (const child of scope.children) {
      if (!child.matches(next)) continue;
      found = true;
      if (next === annotationToolbar) addChromeRoot(child);
      else discoverAnnotationMounts(child);
    }
    return found;
  }

  function validCustomizeHeader(header) {
    if (!header?.matches('header[data-content-leading-inset="true"][data-f6-nav]') ||
        header.children.length !== 3) return false;
    const [heading, middle, spacer] = header.children;
    const row = middle.firstElementChild;
    if (!heading.matches("h1") || !usageLeafText(heading) ||
        !["Customize", dictionary.Customize].includes(heading.firstChild.nodeValue) ||
        !middle.matches("div") || middle.children.length !== 1 ||
        !spacer.matches('div[data-window-caption-spacer="true"]') ||
        !row?.matches("div[data-customize-category-header-row]") || row.children.length !== 3) return false;
    return row.firstElementChild.matches("div[data-customize-category-drag-region]") &&
      !!row.firstElementChild.querySelector('[data-customize-category-tabs-root="true"] [role="tablist"]') &&
      row.children[1].matches("div") && row.children[2].matches("div") &&
      !!row.children[2].querySelector('button[data-testid="extensions-add-menu-trigger"][aria-haspopup="menu"]');
  }

  function validPageControl(root, rule, getCustomizeParents) {
    if (!rule || !root.isConnected || !mainRoot?.contains(root) ||
        root.closest("[data-user-content],[data-testid=workflow-gallery-card]")) return false;
    if (rule.related) return rule.related.isConnected && validPageControl(rule.related, pageControls.get(rule.related), getCustomizeParents) &&
      (rule.related.getAttribute("aria-describedby") || "").split(/\s+/).includes(root.id) &&
      !root.closest("[contenteditable]");
    if (rule.emptyCaption) return validWorkPanel(rule.emptyCaption) &&
      workEmptyCaption(rule.emptyCaption) === root;
    if (!root.matches(rule.selector)) return false;
    if (rule.customizeHeading) return validCustomizeHeader(root.parentElement);
    const hasCustomizeParent = panel => {
      if (getCustomizeParents) return getCustomizeParents().has(panel.parentElement);
      return [...mainRoot.querySelectorAll('header[data-content-leading-inset="true"][data-f6-nav]')]
        .some(header => validCustomizeHeader(header) && header.parentElement === panel.parentElement);
    };
    if (rule.customizeCategory) {
      if (root.matches("h2#browse-integrations-heading")) {
        const panel = root.closest('[role="tabpanel"]');
        return !!usageLeafText(root) && !root.closest("[contenteditable]") && !!panel &&
          hasCustomizeParent(panel);
      }
      const button = root.closest('button[role="tab"]');
      const panel = root.closest('[role="tabpanel"]');
      return !!usageLeafText(root) && !!button && button.children.length === 1 &&
        !root.closest("[contenteditable]") && !!panel &&
        hasCustomizeParent(panel);
    }
    if (rule.customizeSectionTitle || rule.customizeSectionDesc) {
      const panel = root.closest('[role="tabpanel"]');
      return !root.closest("[data-user-content],[contenteditable],ul[role=list],li,article") && !!panel &&
        hasCustomizeParent(panel);
    }
    if (rule.composerPlaceholderText) {
      return root.matches('div[data-rich-composer-placeholder="true"]') &&
        !root.closest("[data-user-content],[data-testid=conversation-body],[data-factory-proposal-host],[data-testid='my-work-inbox-view'],article,#chat");
    }
    if (rule.composerPlaceholderAttr) {
      return root.matches('div[role="textbox"][data-placeholder]') &&
        !root.closest("[data-user-content],[data-testid=conversation-body],[data-factory-proposal-host],[data-testid='my-work-inbox-view'],article,#chat");
    }
    if (rule.homeHeading) {
      if (root.closest(".chat,#chat,[data-user-content],[data-testid=conversation-body],[data-factory-proposal-host],[data-testid='my-work-inbox-view'],header,article")) return false;
      return root.matches("h1") && !!usageLeafText(root) &&
        ["New", dictionary.New].includes(root.textContent.trim());
    }
    if (rule.homeDisclaimer) {
      if (root.closest(".chat,#chat,[data-user-content],[data-testid=conversation-body],[data-factory-proposal-host],[data-testid='my-work-inbox-view'],header,article")) return false;
      return root.matches("p") && !!usageLeafText(root) &&
        ["GitHub Copilot uses AI. Check for mistakes.", dictionary["GitHub Copilot uses AI. Check for mistakes."]].includes(root.textContent.trim());
    }
    if (rule.homeButton || rule.promptSuggestion || rule.homeAction) {
      return root.matches("button") && !root.matches('[data-new-automation-action],button[data-command],button[role="tab"]') &&
        !root.closest(".chat,#chat,[data-testid='composer-pills'],[data-rich-composer-footer],[data-user-content],[contenteditable],[data-testid=conversation-body],[data-factory-proposal-host],[data-testid='my-work-inbox-view'],header,article");
    }
    if (rule.composerStatus) {
      return root.matches('div[role="status"]') &&
        !root.closest(".chat,#chat,[data-user-content],[data-testid=conversation-body],[data-factory-proposal-host],[data-testid='my-work-inbox-view'],article");
    }
    if (rule.workFilters) {
      const title = root.closest('[data-testid="my-work-list-pane"]')?.querySelector(
        'header[data-content-leading-inset][data-tauri-drag-region][data-f6-nav] > div > div > h1');
      if (!title || !["Pull requests", "Issues", dictionary["Pull requests"], dictionary.Issues]
        .includes(title.textContent.trim())) return false;
    }
    if (rule.issueButton) {
      const button = root.parentElement?.parentElement;
      const header = button?.parentElement?.parentElement;
      const pane = header?.parentElement;
      const view = pane?.parentElement;
      const heading = header?.querySelector("h1");
      const labelWrapper = root.parentElement;
      const nativeLabel = labelWrapper?.matches('span[data-component="content"]') &&
        root.matches('span[data-component="label"]') && button?.children.length === 1 &&
        labelWrapper.children.length === 1 && !!usageLeafText(root);
      const legacyLabel = labelWrapper?.matches("div") && root.matches("span");
      let shell = view;
      for (let depth = 0; depth < 4; depth++) {
        shell = shell?.parentElement;
        if (!shell?.matches("div")) return false;
      }
      if (!button?.matches('button[data-command="issue.create"]') ||
          root.parentElement?.parentElement !== button ||
          !(nativeLabel || legacyLabel) ||
          !header?.matches('header[data-content-leading-inset="true"][data-tauri-drag-region="true"][data-f6-nav]') ||
          !pane?.matches('[data-testid="my-work-list-pane"]') ||
          !view?.matches('[data-testid="my-work-inbox-view"]') || shell.parentElement !== mainRoot ||
          !["Issues", dictionary.Issues].includes(heading?.textContent.trim())) return false;
    }
    if (rule.setup && !root.closest('[data-size="medium"]')?.querySelector(
      '[data-prompt-composer-v2][data-command-context="prompt-composer"]')) return false;
    if (rule.words.length === 1 && rule.words[0] === "Chat") {
      const shell = root.closest('[data-size="medium"]');
      if (!(root.getAttribute("aria-describedby") || "").split(/\s+/).some(id => {
        const label = document.getElementById(id);
        return label && shell.contains(label) && label.childElementCount === 0 &&
          ["The agent will help you design your automation in a chat.",
            dictionary["The agent will help you design your automation in a chat."]].includes(label.textContent.trim());
      })) return false;
    }
    if (rule.customize && !mainRoot.querySelector(
      `${customizeHeader} [data-customize-category-tabs-root="true"]`)) return false;
    return true;
  }

  function validWorkPanel(panel) {
    if (!panel.isConnected || !mainRoot?.contains(panel) ||
        !panel.matches('[data-testid="my-work-inbox-scroll-container"][role="tabpanel"]') ||
        !panel.parentElement?.matches("div") ||
        !panel.parentElement.parentElement?.matches('[data-testid="my-work-list-pane"]') ||
        !panel.parentElement.parentElement.parentElement?.matches('[data-testid="my-work-inbox-view"]') ||
        panel.closest("[data-user-content],[contenteditable]")) return false;
    const title = panel.closest('[data-testid="my-work-list-pane"]')?.querySelector(
      'header[data-content-leading-inset][data-tauri-drag-region][data-f6-nav] > div > div > h1');
    return !!title && ["Pull requests", "Issues", dictionary["Pull requests"], dictionary.Issues].includes(title.textContent.trim());
  }

  function workEmptyCaption(panel) {
    if (panel.children.length !== 1) return null;
    const outer = panel.firstElementChild;
    const shell = outer.firstElementChild;
    if (!outer.matches("div") || outer.children.length !== 1 ||
        !shell?.matches('div[data-size="medium"]') || shell.children.length !== 1) return null;
    const content = shell.firstElementChild;
    if (!content.matches("div") || content.children.length !== 2 ||
        ![...content.children].every(node => node.matches("div"))) return null;
    const [title, message] = content.children;
    const caption = title.firstElementChild;
    if (title.children.length !== 1 || !caption?.matches("span") || caption.childElementCount ||
        !["Nothing here", dictionary["Nothing here"]].includes(caption.textContent.trim()) ||
        message.childElementCount || message.matches("[data-user-content],[contenteditable]")) return null;
    const text = message.firstChild;
    const prefix = "No items match ";
    if (text?.nodeType !== 3 || text.length < prefix.length) return null;
    // Inspect only the fixed prefix, never capture the custom filter name.
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, prefix.length);
    return range.toString() === prefix ? caption : null;
  }

  function refreshPageControls() {
    if (!mainRoot) return;
    const hasWorkView = !!mainRoot.querySelector('[data-testid="my-work-inbox-view"]');
    const hasFactory = !!mainRoot.querySelector(factory);
    const hasCustomizeCandidate = !!mainRoot.querySelector(
      'header[data-content-leading-inset="true"][data-f6-nav],[data-customize-category-header-row],[data-testid="customize-type-filter-trigger"],#featured-editors-picks-heading,[data-testid="customize-category-filter"]'
    );
    let customizeParentSet = null;
    function getCustomizeParents() {
      if (customizeParentSet) return customizeParentSet;
      customizeParentSet = new Set();
      if (!hasCustomizeCandidate) return customizeParentSet;
      for (const header of mainRoot.querySelectorAll('header[data-content-leading-inset="true"][data-f6-nav]')) {
        if (validCustomizeHeader(header) && header.parentElement) customizeParentSet.add(header.parentElement);
      }
      return customizeParentSet;
    }
    const boundaries = new Set(pageRouteBoundaries);
    const messages = new Set();
    function rememberRoutePrefix(owner) {
      if (!owner || owner.closest("[data-user-content]")) return;
      const path = [];
      for (let node = owner.parentElement; node && node !== mainRoot; node = node.parentElement) path.unshift(node);
      // Retain only the UI-observed route prefix, not any page or transcript subtree.
      if (path.length >= 3 && path.slice(0, 3).every(node => node.tagName === "DIV") &&
          path[0].parentElement === mainRoot) {
        for (const node of path.slice(0, 3)) { pageRouteBoundaries.add(node); boundaries.add(node); }
      }
    }
    for (const composer of mainRoot.querySelectorAll('[data-testid="conversation-composer-area"]')) {
      if (composer.closest('[data-user-content],[data-testid="conversation-body"],article')) continue;
      rememberRoutePrefix(composer);
      boundaries.add(composer);
      for (const child of composer.children) {
        if (child.tagName === "DIV" && !child.matches("[contenteditable]") && !child.querySelector("[contenteditable]")) {
          boundaries.add(child);
        }
      }
      for (const root of composer.querySelectorAll('[data-testid="composer-pills"],[data-rich-composer-footer]')) {
        addChromeRoot(root);
        for (let parent = root.parentElement; parent && parent !== mainRoot; parent = parent.parentElement) {
          if (!parent.closest("[contenteditable]")) boundaries.add(parent);
        }
      }
    }
    for (const root of mainRoot.querySelectorAll('aside[data-testid="chat-canvas-panel"],[data-testid="composer-pills"],[data-rich-composer-footer]')) {
      if (root.closest('[data-user-content],[data-testid="conversation-body"],article')) continue;
      if (root.matches('aside[data-testid="chat-canvas-panel"]')) rememberRoutePrefix(root);
      addChromeRoot(root);
    }
    function register(root, rule) {
      if (!validPageControl(root, rule, getCustomizeParents)) return;
      pageControls.set(root, rule);
      addChromeRoot(root);
      if (rule.customizeHeading) boundaries.add(root.parentElement.children[2]);
      let parent = root.parentElement;
      if (rule.cardAction) parent = root.closest("ul[role=list]");
      for (; parent && parent !== mainRoot; parent = parent.parentElement) {
        if (!parent.closest("[contenteditable]")) boundaries.add(parent);
      }
      const owner = root.closest('[data-factory-proposal-host],[data-testid="my-work-inbox-view"],header[data-content-leading-inset]');
      rememberRoutePrefix(owner);
      if (rule.attribute === "data-placeholder") {
        const id = (root.getAttribute("aria-describedby") || "").split(/\s+/)[0];
        const label = id && document.getElementById(id);
        if (label && !root.contains(label) && root.closest('[data-size="medium"]')?.contains(label) &&
            label.childElementCount === 0 && rule.words.some(word =>
              label.textContent.trim() === word || label.textContent.trim() === dictionary[word])) {
          register(label, { words: rule.words, related: root });
        }
      }
      if (rule.words.length === 1 && rule.words[0] === "Chat" &&
          ["Chat", dictionary.Chat].includes(visibleMenuLabel(root))) {
        for (const id of (root.getAttribute("aria-describedby") || "").split(/\s+/)) {
          const label = document.getElementById(id);
          if (label && root.closest('[data-size="medium"]')?.contains(label) && label.childElementCount === 0 &&
              ["The agent will help you design your automation in a chat.",
                dictionary["The agent will help you design your automation in a chat."]].includes(label.textContent.trim())) {
            register(label, { words: ["The agent will help you design your automation in a chat."], related: root });
          }
        }
      }
    }
    for (const rule of pageRules) {
      if (!hasWorkView && (rule.workHeading || rule.workFilters || rule.emptyHost)) continue;
      if (!hasFactory && (rule.setup || rule.selector.startsWith(factory))) continue;
      if (!hasCustomizeCandidate && (rule.customizeHeading || rule.customizeCategory ||
          rule.customizeSectionTitle || rule.customizeSectionDesc || rule.customize ||
          rule.kind === "customizeAdd" || rule.selector.startsWith(customizeHeader))) continue;
      for (const root of mainRoot.querySelectorAll(rule.selector)) {
        if (rule.emptyHost) {
          if (!validWorkPanel(root)) continue;
          boundaries.add(root);
          if (root.children.length === 1 && root.firstElementChild.matches("div") &&
              !root.firstElementChild.hasAttribute("data-user-content")) boundaries.add(root.firstElementChild);
          const caption = workEmptyCaption(root);
          if (caption) {
            const message = caption.parentElement.nextElementSibling;
            boundaries.add(message);
            messages.add(message);
            register(caption, { words: rule.words, emptyCaption: root });
          }
        } else register(root, rule);
      }
    }
    for (const [root, rule] of pageControls) {
      if (validPageControl(root, rule, getCustomizeParents)) continue;
      pageControls.delete(root);
      chromeRootObservers.get(root)?.disconnect();
      chromeRootObservers.delete(root);
      chromeRoots.delete(root);
      restorePopup(root);
    }
    for (const node of boundaries) {
      if (!node.isConnected || !mainRoot.contains(node) || node === mainRoot) continue;
      if (!pageBoundaryObservers.has(node)) {
        const boundary = new document.defaultView.MutationObserver(mutations);
        boundary.observe(node, { childList: true, attributes: true,
          characterData: messages.has(node), subtree: messages.has(node),
          attributeFilter: pageOwnerAttributes });
        pageBoundaryObservers.set(node, boundary);
      }
    }
    for (const [node, boundary] of pageBoundaryObservers) {
      if (node.isConnected && boundaries.has(node)) continue;
      boundary.disconnect();
      pageBoundaryObservers.delete(node);
      pageRouteBoundaries.delete(node);
    }
    emptyMessageRoots.clear();
    for (const message of messages) emptyMessageRoots.add(message);
  }

  function discoverSidebarNavigation(sidebar) {
    let containers = [sidebar];
    for (const selector of ["div", '[data-testid="sidebar-scroll-viewport"]', "div", "nav"]) {
      const children = [];
      for (const container of containers) {
        if (!sidebarBoundaryObservers.has(container)) {
          const boundaryObserver = new document.defaultView.MutationObserver(mutations);
          boundaryObserver.observe(container, { childList: true, attributes: true,
            attributeFilter: ["data-sidebar-live-width", "data-testid"] });
          sidebarBoundaryObservers.set(container, boundaryObserver);
        }
        for (const child of container.children) if (child.matches(selector)) children.push(child);
      }
      containers = children;
    }
    for (const nav of containers) addChromeRoot(nav);
    discoverSidebarStatic(sidebar);
  }

  function sidebarStaticKind(root) {
    if (!root.isConnected || root.childElementCount || root.closest("[data-user-content],[contenteditable]")) return null;
    const kind = sidebarStaticSelectors.findIndex(selector => root.matches(selector));
    if (kind === 0) return "Projects";
    if (kind === 1) {
      const section = root.parentElement.parentElement;
      return section.children.length === 2 && section.firstElementChild.matches("div[data-sidebar-section-header]") &&
        section.querySelector(":scope > div > h3#sidebar-agents-heading") ? "No projects yet" : null;
    }
    if (kind === 2) return "Sessions";
    if (kind === 5) return "Sidebar";
    if (kind === 6) return "Quick links";
    if (kind !== 3 && kind !== 4) return null;
    const section = root.closest("section");
    const heading = section.querySelector(":scope > div[data-sidebar-section-header] > h4[id]");
    const tree = [...section.children].find(node => node.matches('ul[role="tree"]') &&
      node.getAttribute("aria-labelledby") === heading?.id &&
      node.getAttribute("data-sidebar-session-summary-hint-group") === heading?.id);
    const group = tree?.querySelector(':scope > li[role="treeitem"] > div[data-testid="repository-group-row"] > div#sidebar-group-quick-chats');
    if (!heading || section.getAttribute("aria-labelledby") !== heading.id || !group ||
        group.children.length !== 2 || ![...group.children].every(node => node.matches("span")) ||
        group.lastElementChild.childElementCount) return null;
    return kind === 3 ? "Sessions" : root === group.lastElementChild ? "Chats" : null;
  }

  function discoverSidebarStatic(sidebar) {
    const boundaries = new Set();
    function watch(node) {
      boundaries.add(node);
      if (!sidebarBoundaryObservers.has(node)) {
        const boundary = new document.defaultView.MutationObserver(mutations);
        boundary.observe(node, { childList: true, attributes: true,
          attributeFilter: ["role", "id", "aria-labelledby", "aria-expanded", "data-testid",
            "data-sidebar-section-header", "data-sidebar-session-list", "data-sidebar-session-summary-hint-group",
            "data-sidebar-live-width", "data-user-content", "contenteditable"] });
        sidebarBoundaryObservers.set(node, boundary);
      }
    }
    // Keep known list shells observable across empty/group replacement, never their entry subtrees.
    for (const tree of sidebarStaticBoundaries.get(sidebar) || []) {
      if (!tree.isConnected || !sidebar.contains(tree) || !tree.matches('ul[role="tree"]') ||
          tree.closest("[data-user-content],[contenteditable]")) continue;
      for (let node = tree; node && sidebar.contains(node); node = node.parentElement) watch(node);
    }
    for (const selector of [...sidebarStaticSelectors, sidebarNewSessionTrigger]) for (const root of sidebar.querySelectorAll(selector)) {
      if (!sidebarStaticKind(root) && !isSidebarNewSessionTrigger(root)) continue;
      addChromeRoot(root);
      for (let node = root.parentElement; node && sidebar.contains(node); node = node.parentElement) watch(node);
      if (sidebarStaticKind(root) === "Projects") {
        const tree = root.closest("section").querySelector(':scope > ul[role="tree"]');
        if (tree) watch(tree);
      }
    }
    sidebarStaticBoundaries.set(sidebar, boundaries);
  }

  function removeDisconnectedChromeRoots(refreshPages = true) {
    if (refreshPages && (pageControls.size || pageBoundaryObservers.size)) refreshPageControls();
    for (const root of chromeRoots) {
      const rule = pageControls.get(root);
      if (root.isConnected && (rule ? validPageControl(root, rule) :
          !root.closest("[data-user-content],[contenteditable]") &&
          root.matches(chromeRootSelector)) &&
          (!sidebarNavigationRoots.has(root) || root.matches(sidebarNavigationSelector)) &&
          (!root.matches(sidebarNewSessionTrigger) || isSidebarNewSessionTrigger(root)) &&
          (!sidebarStaticRoots.has(root) || sidebarStaticKind(root))) continue;
      chromeRootObservers.get(root)?.disconnect();
      chromeRootObservers.delete(root);
      chromeRoots.delete(root);
      restorePopup(root);
    }
    for (const [sidebar] of sidebarStaticBoundaries) {
      if (!sidebar.isConnected || !sidebar.matches("[data-sidebar-live-width]")) sidebarStaticBoundaries.delete(sidebar);
    }
    for (const [container, boundaryObserver] of sidebarBoundaryObservers) {
      if (container.isConnected && (sidebarBoundarySelectors.some(selector => container.matches(selector)) ||
          [...sidebarStaticBoundaries.values()].some(boundaries => boundaries.has(container)))) continue;
      boundaryObserver.disconnect();
      sidebarBoundaryObservers.delete(container);
    }
  }

  function isSidebarMenuTrigger(trigger) {
    return trigger.matches('[data-sidebar-footer] button[aria-haspopup="menu"][id][aria-label$=", open user menu"]');
  }

  function isSidebarNewSessionTrigger(trigger) {
    return trigger.matches(sidebarNewSessionTrigger) &&
      !!trigger.parentElement.parentElement.querySelector(":scope > h3#sidebar-sessions-heading");
  }

  function sidebarSessionLabels(popup) {
    const labels = new Map();
    for (const rule of sidebarSessionLabelRules) {
      for (const label of popup.querySelectorAll(rule.selector)) {
        const hidden = label.closest('[aria-hidden="true"],[hidden]');
        const decorativeHeader = rule.word === "Start session in" && hidden === label &&
          !label.hasAttribute("hidden");
        if (!label.childElementCount && (!hidden || decorativeHeader) &&
            !label.closest("[data-user-content],[contenteditable]")) {
          labels.set(label, rule.word);
        }
      }
    }
    return labels;
  }

  function composerMenuKind(trigger) {
    const isComposerFooter = trigger.matches('[data-rich-composer-footer] button[aria-haspopup="menu"][id][data-base-ui-tooltip-trigger]');
    const isHomeEnv = trigger.matches('main[data-app-shell-main] button[aria-haspopup="menu"][id]') &&
      ((trigger.getAttribute("aria-label") || "").startsWith("Environment:") ||
        (trigger.getAttribute("aria-label") || "").startsWith("环境："));
    if (!isComposerFooter && !isHomeEnv) return false;
    const label = trigger.getAttribute("aria-label") || "";
    if (isHomeEnv) return "composerEnvironment";
    if (modeTriggerLabel.test(label)) return "composerMode";
    if (/^.+, model and reasoning(?:, Ctrl \+ Shift \+ E)?$/.test(label)) return "composerModel";
    if (label === "Add context & more" || label === dictionary["Add context & more"]) return "composerContext";
    return null;
  }

  function isSettingsChoice(section, text) {
    return Object.hasOwn(popupWords, section) && popupWords[section].includes(text);
  }

  function isModelPopupChoice(element, text) {
    const item = element.parentElement;
    const group = item?.parentElement;
    const hasRadioItem = group?.parentElement;
    const wrapper = hasRadioItem?.parentElement;
    const popup = wrapper?.parentElement;
    return isSettingsChoice("sessions-default-model", text) &&
      element.matches("span") && !element.childElementCount &&
      item?.matches('[role="menuitemradio"]') && group?.matches('[role="group"]') &&
      hasRadioItem?.hasAttribute("data-menu-has-radio-item") &&
      wrapper?.matches("div") && popup?.matches('[role="menu"]');
  }

  function isStoragePopupChoice(owner, element, text) {
    const option = element.closest('[role="option"]');
    return isSettingsChoice("sessions-worktree-location", text) &&
      option?.parentElement === owner.popup && option.children.length === 1 &&
      option.firstElementChild === element && element.matches("div") && !element.childElementCount;
  }

  function isColorFilterPopupText(owner, element, text) {
    if (!owner.words.includes(text)) return false;
    const option = element.closest('[role="option"]');
    const titleId = option?.getAttribute("aria-labelledby");
    const descriptionId = option?.getAttribute("aria-describedby");
    const title = titleId && document.getElementById(titleId);
    const description = descriptionId && document.getElementById(descriptionId);
    return option?.parentElement === owner.popup && titleId && descriptionId &&
      !/\s/.test(titleId) && !/\s/.test(descriptionId) &&
      title?.nodeType === 1 && description?.nodeType === 1 &&
      option.contains(title) && option.contains(description) &&
      (title.contains(element) || description.contains(element));
  }

  function settingsPortalPopup(popup, presentationCount) {
    let node = popup;
    for (let depth = 0; depth < presentationCount; depth++) {
      node = node.parentElement;
      if (!node?.matches('[role="presentation"][data-open]')) return false;
    }
    node = node.parentElement;
    if (!node?.matches("[data-base-ui-portal]")) return false;
    node = node.parentElement;
    return node?.matches("[data-base-ui-portal]") &&
      node.parentElement?.id === "portal-root";
  }

  function isUsageTriggerCandidate(trigger) {
    if (trigger?.tagName !== "BUTTON" || !trigger.matches(usageTriggerSelector)) return false;
    return true;
  }

  function usageTriggerOwner(trigger) {
    if (!isUsageTriggerCandidate(trigger)) return null;
    const trailing = trigger.closest('div[data-prompt-composer-trailing-actions="true"]');
    const wrapper = trailing?.parentElement;
    const footer = wrapper?.parentElement;
    const surface = footer?.parentElement;
    const composer = surface?.parentElement;
    const promptComposer = composer?.parentElement;
    if (!trailing || !trailing.contains(trigger) || wrapper?.tagName !== "DIV" ||
        !footer?.matches('div[data-rich-composer-footer="true"]') ||
        !composer?.matches('div[data-rc-consumer="prompt-composer"]') ||
        !promptComposer?.hasAttribute("data-prompt-composer-v2") ||
        promptComposer.getAttribute("data-command-context") !== "prompt-composer") return null;
    usageTriggers.add(trigger);
    return true;
  }

  function usagePopupOwner(popup) {
    if (!popup?.matches('div[role="dialog"][id][aria-labelledby][data-open][data-base-ui-focusable]') ||
        popup.children.length !== 2 || !popup.firstElementChild.matches("h2") ||
        popup.lastElementChild.tagName !== "DIV") return null;
    const heading = popup.firstElementChild;
    if (!heading.id || popup.getAttribute("aria-labelledby") !== heading.id) return null;
    const presentation = popup.parentElement;
    const portalNode = presentation?.parentElement;
    if (!presentation?.matches('div[role="presentation"][data-open]') ||
        !portalNode?.matches("[data-base-ui-portal]") || portalNode.parentElement !== document.body) return null;
    const candidates = [];
    for (const root of chromeRoots) {
      if (!root.matches("[data-rich-composer-footer]")) continue;
      for (const trigger of root.querySelectorAll(usageTriggerSelector)) {
        if (usageTriggerOwner(trigger) && trigger.getAttribute("aria-expanded") === "true" &&
              trigger.getAttribute("aria-controls") === popup.id) candidates.push(trigger);
      }
    }
    return candidates.length === 1
      ? { popup, trigger: candidates[0], presentation, portalNode, kind: "usage" }
      : null;
  }

  function usageLeafText(element) {
    return element?.childNodes.length === 1 && element.firstChild.nodeType === 3
      ? element.firstChild : null;
  }

  function usageRows(list, labels) {
    if (list?.tagName !== "DL" || list.children.length !== 2) return null;
    const rows = new Map();
    for (const row of list.children) {
      if (row.tagName !== "DIV" || row.children.length !== 2 ||
          row.firstElementChild.tagName !== "DT" || row.lastElementChild.tagName !== "DD") return null;
      const labelNode = usageLeafText(row.firstElementChild);
      if (!labelNode) return null;
      const label = labels.find(word => [word, dictionary[word]].includes(labelNode.nodeValue));
      if (!label || rows.has(label)) return null;
      rows.set(label, { row, labelNode, value: row.lastElementChild });
    }
    return rows.size === labels.length ? rows : null;
  }

  function usagePopupSlots(popup) {
    const content = popup.lastElementChild;
    if (content.children.length !== 3 || content.children[0].tagName !== "DL" ||
        content.children[1].tagName !== "DIV" || content.children[1].children.length !== 1 ||
        content.children[2].tagName !== "DIV") return null;
    const summaryRows = usageRows(content.children[0], ["Plan", "Session"]);
    const detailRows = usageRows(content.children[1].firstElementChild, ["Tokens", "Context"]);
    const actions = content.children[2];
    if (!summaryRows || !detailRows || actions.children.length !== 2 ||
        [...actions.children].some(button => button.tagName !== "BUTTON" || !usageLeafText(button))) return null;

    const fixed = new Set();
    const suffixes = new Map();
    const boundaries = new Set([
      content, content.children[0], content.children[1], content.children[1].firstElementChild, actions
    ]);
    const headingNode = usageLeafText(popup.firstElementChild);
    const hasUsageHeading = !!(headingNode && ["Usage", dictionary.Usage].includes(headingNode.nodeValue));
    if (hasUsageHeading) {
      fixed.add(headingNode);
      boundaries.add(popup.firstElementChild);
    }
    for (const rows of [summaryRows, detailRows]) {
      for (const { row, labelNode } of rows.values()) {
        fixed.add(labelNode);
        boundaries.add(row);
        boundaries.add(row.firstElementChild);
      }
    }
    const planValue = summaryRows.get("Plan").value;
    const sessionValue = summaryRows.get("Session").value;
    if (planValue.childNodes.length !== 1 || planValue.firstChild.nodeType !== 3 ||
        sessionValue.childNodes.length !== 1 || sessionValue.firstChild.nodeType !== 3) return null;
    suffixes.set(planValue.firstChild, ["% used", `% ${dictionary.used}`]);
    suffixes.set(sessionValue.firstChild, [" AI credits", ` ${dictionary["AI credits"]}`]);
    boundaries.add(planValue);
    boundaries.add(sessionValue);

    const tokenValue = detailRows.get("Tokens").value;
    if (tokenValue.children.length !== 1 || tokenValue.childNodes.length !== 1 ||
        tokenValue.firstElementChild.tagName !== "SPAN") return null;
    boundaries.add(tokenValue);
    boundaries.add(tokenValue.firstElementChild);
    const tokenLabels = [...tokenValue.firstElementChild.querySelectorAll("span[data-base-ui-tooltip-trigger]")];
    if (tokenLabels.length !== 2) return null;
    for (const label of tokenLabels) {
      let detail = label;
      if (label.children.length === 3 && label.childNodes.length === 3 &&
          [...label.children].every(child => child.matches("span"))) {
        const [total, numeric, description] = label.children;
        if (!label.id || !usageLeafText(total) || numeric.childNodes.length !== 2 ||
            numeric.firstChild.nodeType !== 1 || numeric.firstChild.tagName.toLowerCase() !== "svg" ||
            numeric.lastChild.nodeType !== 3) return null;
        detail = description;
        boundaries.add(label);
        boundaries.add(description);
      }
      let suffixNode = null;
      if (detail.childNodes.length === 3 && ![...detail.childNodes].some(node => node.nodeType !== 3) &&
          detail.firstChild.nodeValue === "(") {
        suffixNode = detail.lastChild;
      } else if (detail.childNodes.length === 1 && detail.firstChild.nodeType === 3 &&
          detail.firstChild.length > 0 && detail.firstChild.substringData(0, 1) === "(") {
        suffixNode = detail.firstChild;
      }
      if (!suffixNode) return null;
      const endsWith = value => suffixNode.length >= value.length &&
        suffixNode.substringData(suffixNode.length - value.length, value.length) === value;
      if (endsWith(" cached)") || endsWith(` ${dictionary.cached})`)) {
        suffixes.set(suffixNode, [" cached)", ` ${dictionary.cached})`]);
      } else if (endsWith(" reasoning)") || endsWith(` ${dictionary.reasoning})`)) {
        suffixes.set(suffixNode, [" reasoning)", ` ${dictionary.reasoning})`]);
      } else return null;
    }
    if (new Set([...suffixes.values()].map(([original]) => original)).size !== 4) return null;

    const actionWords = [["Compact conversation"], ["View usage and plan…", "View usage and plan..."]];
    const foundActions = new Set();
    for (const button of actions.children) {
      const node = usageLeafText(button);
      const group = actionWords.find(variants =>
        variants.some(value => [value, dictionary[value]].includes(node?.nodeValue)));
      const canonical = group?.[0];
      if (!node || !canonical || foundActions.has(canonical) || fixed.has(node)) return null;
      foundActions.add(canonical);
      fixed.add(node);
      boundaries.add(button);
    }
    if (fixed.size !== (hasUsageHeading ? 7 : 6) || foundActions.size !== actionWords.length) return null;
    return { fixed: [...fixed], suffixes, boundaries };
  }

  function restoreUsageEntry(node, entry) {
    if (entry.kind === "whole") {
      if (node.nodeValue === entry.translated) node.nodeValue = entry.original;
      return;
    }
    const offset = node.length - entry.translated.length;
    if (offset >= 0 && node.substringData(offset, entry.translated.length) === entry.translated) {
      node.replaceData(offset, entry.translated.length, entry.original);
    }
  }

  function restoreUsagePopup(popup) {
    for (const [node, entry] of usagePopupEntries) {
      if (entry.popup !== popup) continue;
      restoreUsageEntry(node, entry);
      usagePopupEntries.delete(node);
    }
  }

  function translateUsagePopup(popup) {
    if (!usagePopupOwner(popup)) return false;
    stats.portalScans++;
    const slots = usagePopupSlots(popup);
    if (!slots) {
      restoreUsagePopup(popup);
      refreshUsagePopupObserver(popup, { boundaries: new Set(), fixed: [], suffixes: new Map() });
      return false;
    }
    const current = new Set([...slots.fixed, ...slots.suffixes.keys()]);
    for (const [node, entry] of usagePopupEntries) {
      if (entry.popup === popup && !current.has(node)) {
        restoreUsageEntry(node, entry);
        usagePopupEntries.delete(node);
      }
    }
    for (const node of slots.fixed) {
      const prior = usagePopupEntries.get(node);
      const original = prior?.kind === "whole" && node.nodeValue === prior.translated
        ? prior.original : node.nodeValue;
      const translated = dictionary[original];
      if (!translated || translated === original || node.nodeValue === translated) continue;
      usagePopupEntries.set(node, { popup, kind: "whole", original, translated });
      node.nodeValue = translated;
    }
    for (const [node, [original, translated]] of slots.suffixes) {
      const prior = usagePopupEntries.get(node);
      const applied = prior?.kind === "suffix" && prior.original === original
        ? prior.translated : translated;
      const appliedOffset = node.length - applied.length;
      if (appliedOffset >= 0 && node.substringData(appliedOffset, applied.length) === applied) continue;
      const originalOffset = node.length - original.length;
      if (originalOffset < 0 || node.substringData(originalOffset, original.length) !== original) {
        usagePopupEntries.delete(node);
        continue;
      }
      usagePopupEntries.set(node, { popup, kind: "suffix", original, translated });
      node.replaceData(originalOffset, original.length, translated);
    }
    refreshUsagePopupObserver(popup, slots);
    return true;
  }

  function refreshUsagePopupObserver(popup, slots) {
    const state = usagePopupObserverStates.get(popup);
    if (!state) return;
    const owner = usagePopupOwner(popup);
    if (!owner) return;
    state.observer.disconnect();
    state.observer.observe(popup, { childList: true, attributes: true,
    attributeFilter: ["id", "role", "aria-labelledby", "data-open", "data-base-ui-focusable"] });
    state.observer.observe(owner.presentation, { attributes: true, attributeFilter: ["role", "data-open"] });
    state.observer.observe(owner.portalNode, { attributes: true, attributeFilter: ["data-base-ui-portal"] });
    for (const boundary of slots.boundaries) {
      if (boundary !== popup) state.observer.observe(boundary, { childList: true });
    }
    const textNodes = new Set([...slots.fixed, ...slots.suffixes.keys()]);
    for (const node of textNodes) state.observer.observe(node, { characterData: true });
  }

  function observeUsagePopup(popup) {
    if (chromePopupObservers.has(popup)) {
      translateUsagePopup(popup);
      return;
    }
    const popupObserver = new document.defaultView.MutationObserver(() => {
      if (stopped) return;
      const started = options.measure ? document.defaultView.performance.now() : 0;
      stats.callbacks++;
      try {
        if (!usagePopupOwner(popup)) {
          stopObservingChromePopup(popup);
          return;
        }
        translateUsagePopup(popup);
      } finally {
        if (options.measure) {
          stats.callbackMs.push(document.defaultView.performance.now() - started);
          if (stats.callbackMs.length > 512) stats.callbackMs.shift();
        }
      }
    });
    chromePopupObservers.set(popup, popupObserver);
    usagePopupObserverStates.set(popup, { observer: popupObserver });
    translateUsagePopup(popup);
  }

  function chromeMenuKind(trigger) {
    if (!trigger || !trigger.id || trigger.getAttribute("aria-expanded") !== "true" ||
        trigger.getAttribute("aria-haspopup") !== "menu" ||
        trigger.closest("[data-user-content],[contenteditable]")) return null;
    if (isSidebarMenuTrigger(trigger)) return "sidebar";
    if (isSidebarNewSessionTrigger(trigger)) return "sidebarNewSession";
    if (trigger.matches('button[data-testid="sidebar-session-configuration"]')) return "sidebarSessionConfig";
    const pageRule = pageControls.get(trigger);
    if (pageRule?.kind === "customizeAdd" && validPageControl(trigger, pageRule)) return "customizeAdd";
    if (trigger.matches('[data-testid="conversation-message-row"] button[aria-haspopup="menu"][id]') &&
        !trigger.closest("[data-user-content],[contenteditable]") &&
        ["More response actions", dictionary["More response actions"],
          "More options", dictionary["More options"]].includes(trigger.getAttribute("aria-label") || "")) {
      return "msgMore";
    }
    const directKind = composerMenuKind(trigger);
    if (directKind) return directKind;
    const parentMenu = trigger.closest('[role="menu"][id][aria-labelledby]');
    const parentTrigger = parentMenu && document.getElementById(parentMenu.getAttribute("aria-labelledby"));
    const parentKind = parentTrigger && chromeMenuKind(parentTrigger);
    if (!parentMenu || !parentTrigger || !parentKind || !parentMenu.contains(trigger) ||
        (parentTrigger.getAttribute("aria-controls") && parentTrigger.getAttribute("aria-controls") !== parentMenu.id) ||
        !parentMenu.hasAttribute("data-open") || !parentMenu.hasAttribute("data-rootownerid") ||
        !parentMenu.parentElement?.matches('[role="presentation"][data-open]') ||
        !parentMenu.parentElement.parentElement?.matches("[data-base-ui-portal]")) return null;
    const item = trigger.closest('[role="menuitem"]');
    if (!item || item.closest('[role="menu"]') !== parentMenu) return null;
    const labels = nestedMenuLabels(item);
    const label = labels ? visibleMenuLabel(labels[0]) : visibleMenuLabel(item);
    if (parentKind === "sidebar" && (label === "Theme" || label === dictionary.Theme)) return "sidebarTheme";
    if (parentKind === "composerMode" &&
        (label === "Tool permissions" || label === dictionary["Tool permissions"])) return "composerPermissions";
    if (parentKind === "composerModel" && labels &&
        (label === "Effort" || label === dictionary.Effort)) return "composerEffort";
    if (parentKind === "sidebarSessionConfig") {
      const base = label.split('\n')[0].trim();
      if (base === "Grouping" || base === dictionary.Grouping) return "sidebarSessionConfigGrouping";
      if (base === "Ordering" || base === dictionary.Ordering) return "sidebarSessionConfigOrdering";
      if (base === "Show" || base === dictionary.Show) return "sidebarSessionConfigShow";
      if (base === "Status" || base === dictionary.Status) return "sidebarSessionConfigStatus";
      if (base === "PR" || base === dictionary.PR) return "sidebarSessionConfigPR";
      if (base === "Environment" || base === dictionary.Environment) return "sidebarSessionConfigEnvironment";
      if (base === "Source" || base === dictionary.Source) return "sidebarSessionConfigSource";
    }
    return null;
  }

  function nestedMenuLabels(item) {
    if (!item?.matches('[role="menuitem"][aria-haspopup="menu"][id]')) return null;
    return menuRowLabels(item);
  }

  function menuRowLabels(item) {
    if (!item?.matches('[role="menuitem"]') ||
        !item.parentElement?.matches('div,[data-menu-has-radio-item],[role="group"],[role="none"]') ||
        !item.closest('[role="menu"]') || item.closest("[data-user-content],[contenteditable]")) return null;
    const labels = [...item.querySelectorAll(":scope > span > span > span")]
      .filter(node => {
        const hidden = node.closest('[aria-hidden="true"],[hidden]');
        return node.childElementCount === 0 && (!hidden || !item.contains(hidden));
      });
    return labels.length === 2 ? labels : null;
  }

  function visibleMenuLabel(item) {
    const walker = document.createTreeWalker(item, 4);
    let label = "";
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const hidden = node.parentElement.closest('[aria-hidden="true"],[hidden],kbd');
      if (!hidden || !item.contains(hidden)) label += node.nodeValue;
    }
    return label.trim();
  }

  function annotationButtonWords(button) {
    const toolbar = button?.closest(annotationToolbar);
    if (!toolbar || !chromeRoots.has(toolbar) || button.closest("[data-user-content],[contenteditable]")) return null;
    if (button.matches('button[role="radio"][data-value][data-base-ui-tooltip-trigger]') &&
        button.parentElement?.matches('div[role="radiogroup"][aria-label="Annotation tool"]') &&
        button.parentElement.parentElement?.parentElement === toolbar) {
      const label = { arrow: "Arrow", rectangle: "Rectangle", pencil: "Pencil", comment: "Comment" }[button.getAttribute("data-value")];
      return label ? [label] : null;
    }
    if (button.matches('button[data-size="small"][data-base-ui-tooltip-trigger]') &&
        button.parentElement?.parentElement === toolbar) {
      if (button.getAttribute("data-variant") === "invisible") return ["Discard"];
      if (button.getAttribute("data-variant") === "primary") return ["Save"];
    }
    return null;
  }

  const messageTooltipTitles = new Set([
    "Bookmark to timeline", "Copy response", "Copy assistant message",
    "Copy user message", "Edit message", "More response actions"
  ]);
  const footerTooltipTitles = new Set([
    "Mode", "Model & reasoning", "Add context & more", "Start voice recording", "AI usage", "Send", "Send message", "Stop"
  ]);

  const topChromeTooltipTitles = new Set([
    "Back", "Forward", "Configure sessions", "Toggle sidebar", "Search", "New session", "New chat"
  ]);

  function activeHoverTooltipTrigger(title) {
    let candidates = [];
    if (title === "Share feedback") {
      for (const root of chromeRoots) {
        if (root.matches("nav[data-sidebar-footer]")) {
          candidates.push(...root.querySelectorAll('button[data-testid="sidebar-feedback-button"][data-popup-open]'));
        }
      }
    } else if (title === "Settings") {
      for (const root of chromeRoots) {
        if (root.matches("nav[data-sidebar-footer]")) {
          candidates.push(...root.querySelectorAll('button[data-command="app.settings.open"][data-popup-open]'));
        }
      }
    } else if (topChromeTooltipTitles.has(title)) {
      const selectorMap = {
        Back: 'button[data-testid="navigation-back-button"][data-popup-open]',
        Forward: 'button[data-testid="navigation-forward-button"][data-popup-open]',
        "Configure sessions": 'button[data-testid="sidebar-session-configuration"][data-popup-open]'
      };
      if (selectorMap[title]) {
        for (const root of chromeRoots) {
          if (root.matches(selectorMap[title])) candidates.push(root);
        }
      } else {
        for (const root of chromeRoots) {
          if (!root.matches('button[data-popup-open][aria-label]')) continue;
          const label = root.getAttribute("aria-label") || "";
          const match = title === "Toggle sidebar"
            ? /^(?:Toggle sidebar|切换侧栏)(?:[,，]\s*.+)?$/.test(label)
            : title === "Search"
              ? /^(?:Search|搜索)(?:[,，]\s*.+)?$/.test(label)
              : title === "New session"
                ? /^(?:New session|新建会话)(?:[,，.]\s*.*)?$/.test(label)
                : /^(?:New chat|新建聊天)(?:[,，]\s*.+)?$/.test(label);
          if (match) candidates.push(root);
        }
      }
    } else if (title === "Show artifact files") {
      for (const root of chromeRoots) {
        if (root.matches('[data-testid="composer-pills"]')) {
          candidates.push(...root.querySelectorAll('button[data-testid="artifact-files-pill"][data-base-ui-tooltip-trigger][data-popup-open]'));
        }
      }
    } else if (title === "More options") {
      for (const button of document.querySelectorAll('button[data-popup-open]')) {
        if (button.closest("[data-user-content],[contenteditable]")) continue;
        const label = button.getAttribute("aria-label") || "";
        const inMessageRow = !!button.closest('[data-testid="conversation-message-row"]');
        const matchesMore = ["More options", dictionary["More options"],
          "More response actions", dictionary["More response actions"],
          "More", "More actions", "More session actions"].includes(label) ||
          /^(?:More options|更多选项|More response actions|更多回答操作)(?:[,，]\s*.+)?$/.test(label) ||
          (inMessageRow && !label);
        if (matchesMore && (inMessageRow || button.matches("[data-base-ui-tooltip-trigger]") ||
            button.closest('[data-sidebar-live-width],header,main,[role="dialog"],[role="menu"]'))) {
          candidates.push(button);
        }
      }
    } else if (messageTooltipTitles.has(title)) {
      for (const button of document.querySelectorAll('[data-testid="conversation-message-row"] button[data-popup-open][aria-label]')) {
        if (button.closest("[data-user-content],[contenteditable]")) continue;
        const label = button.getAttribute("aria-label") || "";
        const matchesTitle = label === title || label === dictionary[title] ||
          (title === "Copy response" && (label === "Copy assistant message" || label === dictionary["Copy assistant message"]));
        if (matchesTitle) candidates.push(button);
      }
    } else if (footerTooltipTitles.has(title)) {
      for (const footer of chromeRoots) {
        if (!footer.matches("div[data-rich-composer-footer]") ||
            footer.closest('[data-user-content],[contenteditable],[data-testid="conversation-body"]')) continue;
        for (const button of footer.querySelectorAll(
          'button[data-base-ui-tooltip-trigger][data-popup-open]'
        )) {
          const label = button.getAttribute("aria-label") || "";
          const sendMatch = /^(?:Send(?: message| prompt)?|发送(?:消息)?)(?:[,，]\s*.+)?$/i.test(label) ||
            (button.matches('button[type="submit"]') && !label);
          const stopMatch = /^(?:Stop|停止)(?:[,，]\s*.+)?$/i.test(label);
          const matchesKind = title === "Mode"
            ? modeTriggerLabel.test(label)
            : title === "Model & reasoning"
              ? /, model and reasoning(?:, Ctrl \+ Shift \+ E)?$/.test(label)
              : title === "Add context & more"
                ? (label === "Add context & more" || label === dictionary["Add context & more"])
                : title === "Start voice recording"
                  ? /^(?:Start voice recording|启动语音录音|开始语音输入)(?:[,，]\s*.+)?$/.test(label)
                  : title === "AI usage"
                    ? (usageTriggerOwner(button) || label.startsWith("AI credits quota:"))
                    : (title === "Send" || title === "Send message")
                      ? sendMatch
                      : title === "Stop"
                        ? stopMatch
                        : false;
          if (matchesKind) candidates.push(button);
        }
      }
    }
    if (candidates.length !== 1) return null;
    const trigger = candidates[0];
    return trigger.matches(":hover") && !trigger.closest("[data-user-content],[contenteditable]")
      ? trigger : null;
  }

  function hoverTooltipOwner(element) {
    const presentation = element.closest(
      'div[role="presentation"][data-open][data-side][data-align]'
    );
    const portalWrapper = presentation?.parentElement;
    const focusable = presentation?.firstElementChild;
    if (!presentation || presentation.children.length !== 1 ||
        !portalWrapper?.matches("[data-base-ui-portal]") || portalWrapper.parentElement !== document.body ||
        !focusable?.matches('div[data-open][data-side][data-align][tabindex="-1"][data-base-ui-focusable]') ||
        focusable.children.length < 1 || focusable.children.length > 2) return null;
    const label = focusable.firstElementChild;
    if (!label?.matches("span") || label.childElementCount || label.childNodes.length !== 1 ||
        label.firstChild.nodeType !== 3) return null;
    const title = label.firstChild.nodeValue.trim();
    const knownTitles = ["Share feedback", "Settings", ...topChromeTooltipTitles, ...footerTooltipTitles, "Show artifact files", ...messageTooltipTitles, "More options"];
    const english = knownTitles.find(value => [value, dictionary[value]].includes(title));
    if (!english) return null;
    if (focusable.children.length === 2) {
      const chord = focusable.children[1];
      if (!chord.matches("span[data-kbd-chord]") ||
          chord.childNodes.length !== chord.children.length || chord.children.length === 0 ||
          [...chord.children].some(child => !child.matches("kbd"))) return null;
    }
    const trigger = activeHoverTooltipTrigger(english);
    if (!trigger) return null;
    return { popup: presentation, label, trigger,
      words: [english, dictionary[english]], kind: "hoverTooltip" };
  }

  function observeAnnotationTooltips(button) {
    if (!annotationButtonWords(button)) return;
    for (const id of (button.getAttribute("aria-describedby") || "").split(/\s+/)) {
      const tooltip = document.getElementById(id);
      if (tooltip?.matches('[role="tooltip"]') && ownedPopup(tooltip)) {
        observeChromePopup(tooltip);
        scan(tooltip, "portal");
      }
    }
  }

  function modelTierLabel(item) {
    const words = { balance: "Standard", hydrafusion: "High", "hydrafusion-max": "Max" };
    const id = item?.getAttribute("data-auto-tier-id");
    const word = Object.hasOwn(words, id) ? words[id] : null;
    if (!word || !item.matches('div[role="menuitemradio"][id][aria-checked][aria-label][aria-describedby][aria-setsize][aria-posinset]') ||
        item.children.length !== 2 || !item.parentElement?.matches('div[role="none"]') ||
        !item.parentElement.parentElement?.matches('div[role="none"]')) return null;
    const [icon, content] = item.children;
    if (!icon.matches('span[aria-hidden="true"]') || icon.children.length !== 1 ||
        icon.firstElementChild.tagName.toLowerCase() !== "svg") return null;
    let leaf = content;
    for (let depth = 0; depth < 2; depth++) {
      if (!leaf.matches("span") || leaf.childNodes.length !== 1 ||
          leaf.children.length !== 1) return null;
      leaf = leaf.firstElementChild;
    }
    return leaf.matches("span") && usageLeafText(leaf) ? { leaf, word } : null;
  }

  function chromePopupText(owner, element, text) {
    if (!owner || !element) return false;
    if (owner.kind === "composerMode" && Object.hasOwn(modeTitles, text) &&
        element.matches("span") && usageLeafText(element) &&
        element.parentElement?.matches('[role="menuitemradio"]') &&
        element.parentElement.firstElementChild === element) return true;
    if (owner.kind === "composerModel") {
      const item = element.closest("[data-auto-tier-id]");
      const tier = modelTierLabel(item);
      if (tier && tier.leaf === element && item.closest('[role="menu"]') === owner.popup) {
        return text === tier.word;
      }
    }
    if (owner.kind === "sidebarNewSession") return sidebarSessionLabels(owner.popup).get(element) === text;
    if (owner.kind === "annotationTooltip") return owner.words.includes(text);
    if (owner.kind === "hoverTooltip") return element === owner.label && owner.words.includes(text);
    if (owner.kind === "sidebar" || owner.kind === "settingsAccountActions") {
      const item = element.closest('[role="menuitem"]');
      return owner.words.includes(text) &&
        !!item && item.closest('[role="menu"]') === owner.popup &&
        (element.matches("span,button") || element === item);
    }
    if (owner.kind === "sidebarTheme") {
      return owner.words.includes(text) &&
        (!!element.closest('[role="menuitem"],[role="menuitemradio"]'));
    }
    if (owner.kind === "composerPermissions") {
      return owner.words.includes(text) &&
        !!element.closest('[role="menuitemradio"]') &&
        (!element.closest("[data-menu-description]") ||
          ["Ask before running tools.", "Uses AI to reduce approval prompts.", "Run tools without asking."].includes(text));
    }
    if (owner.kind === "composerEffort") {
      const radio = element.closest('[role="menuitemradio"][aria-checked]');
      return owner.words.includes(text) && element.matches("span") &&
        !!radio && radio.closest('[role="menu"]') === owner.popup &&
        !element.closest('[aria-hidden="true"],[hidden]') &&
        !owner.popup.querySelector("[data-auto-tier-id]");
    }
    if (owner.kind === "composerModel" || owner.kind === "composerMode") {
      const item = element.closest('[role="menuitem"]');
      const labels = menuRowLabels(item);
      const label = labels && visibleMenuLabel(labels[0]);
      if (labels && item.closest('[role="menu"]') === owner.popup) {
        if (labels[0] === element && owner.kind === "composerModel" &&
            ["Model", "Effort", "Context window", "Content window"].includes(text)) return true;
        if (labels[0] === element && owner.kind === "composerMode" &&
            text === "Tool permissions") return true;
        if (labels[1] === element &&
            ((owner.kind === "composerModel" && (label === "Effort" || label === dictionary.Effort) &&
              chromeWords.composerEffort.includes(text)) ||
             (owner.kind === "composerMode" && (label === "Tool permissions" || label === dictionary["Tool permissions"]) &&
              chromeWords.composerPermissions.includes(text)))) return true;
      }
    }
    if (owner.kind === "composerModel" &&
        ["Retry", "Models will be available when the local session is running."].includes(text) &&
        !element.closest('[role="menuitemradio"],[data-auto-tier-id],[data-user-content]')) {
      return true;
    }
    if (owner.kind === "composerModelDetails") {
      return element.tagName === "P" &&
        ["Prioritizes capable models for challenging tasks and deeper reasoning.",
          "Prioritizes the most capable models for the most demanding tasks and complex reasoning.",
          "Prioritizes versatile models for efficient everyday coding."].includes(text);
    }
    if (owner.kind === "composerModel" && ["On", "Off"].includes(text)) {
      return !!element.closest("button[role=switch],[data-switch-state-label]");
    }
    if (owner.kind === "customizeAdd") {
      const item = element.closest('[role="menuitem"]');
      const labels = { mcp: "MCP Server…", plugin: "Plugin…", skill: "Skill", canvas: "Canvas from URL…" };
      return !!item && item.closest('[role="menu"]') === owner.popup &&
        (Object.entries(labels).some(([key, label]) => text === label &&
          item.getAttribute("data-testid") === `extensions-add-menu-${key}`) ||
          (text === "Manage marketplaces…" && !item.hasAttribute("data-testid")));
    }
    if (["Step-by-step collaboration", "Plan first, execute when ready",
      "End-to-end execution without interruption"].includes(text)) {
      return owner.kind === "composerMode" && !!element.closest('[role="menuitemradio"] [data-menu-description]');
    }
    if (text === "Mode") {
      return owner.kind === "composerMode" && element.matches("div,span,h2,h3") &&
        !element.closest('[role="menuitem"],[role="menuitemradio"],button,a');
    }
    if (["Model", "Effort", "Context window", "Content window", "Effort level"].includes(text)) {
      return owner.kind === "composerModel" && !!element.closest('[role="none"]') &&
        !element.closest('[role="menuitemradio"],[role="option"],[role="menuitem"],[data-auto-tier-id]');
    }
    if (text === "Learn more") return owner.kind === "composerModel" && element.matches("a[href]");
    if (["Prioritizes capable models for challenging tasks and deeper reasoning.",
      "Prioritizes the most capable models for the most demanding tasks and complex reasoning.",
      "Prioritizes versatile models for efficient everyday coding."].includes(text)) return false;
    if (owner.kind.startsWith("sidebarSessionConfig")) {
      const item = element.closest('[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]');
      return owner.words.includes(text) &&
        !!item && item.closest('[role="menu"]') === owner.popup;
    }
    if (owner.kind === "sessionCopySubmenu" || owner.kind === "msgMore") {
      const item = element.closest('[role="menuitem"]');
      return owner.words.includes(text) &&
        !!item && item.closest('[role="menu"]') === owner.popup;
    }
    if (owner.kind === "commandPalette") {
      const item = element.closest('[role="option"]');
      return owner.words.includes(text) && !!item && owner.popup.contains(item);
    }
    if (owner.kind === "composerEnvironment") {
      const item = element.closest('[role="menuitem"],[role="menuitemradio"]');
      return owner.words.includes(text) && !!item && item.closest('[role="menu"]') === owner.popup;
    }
    if (owner.kind === "selectionMenu") {
      const item = element.closest('[role="menuitem"],button');
      return owner.words.includes(text) &&
        !!item && owner.popup.contains(item) &&
        !element.closest('kbd,[data-kbd-chord],[aria-hidden="true"],[hidden]');
    }
    if (owner.kind === "composerContext") {
      return owner.words.includes(text) && !!element.closest('[role="menuitem"]');
    }
    return owner.words.includes(text) && !!element.closest('[role="menuitem"]');
  }

  const selectionMenuWords = ["Add to Side chat", "Add to side chat", "Quote", "Copy"];
  const selectionKeycapRe = /^(?:(?:Ctrl|Control|Shift|Alt|Option|Meta|Cmd|Command|Win|Super|[A-Z0-9`+\-/,.\[\];'\\]|Enter|Tab|Esc|Space|Backspace)(?:\s*[+\-]\s*)?)+$/i;
  const popupAncestorSelector = '[data-base-ui-portal],[role="menu"],[role="listbox"],[role="dialog"],[role="tooltip"],[role="toolbar"]';

  function selectionItemTokens(item) {
    const walker = document.createTreeWalker(item, 4);
    const tokens = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const hidden = node.parentElement?.closest('[aria-hidden="true"],[hidden],kbd,[data-kbd-chord]');
      if (hidden && item.contains(hidden)) continue;
      const trimmed = node.nodeValue.trim();
      if (trimmed) tokens.push(trimmed);
    }
    return tokens;
  }

  function selectionMenuOwner(popup) {
    if (!popup?.isConnected ||
        !popup.matches('[role="menu"],[role="dialog"],[role="toolbar"]') ||
        popup.hasAttribute("aria-labelledby") ||
        popup.closest('[data-user-content],[contenteditable],[data-testid="conversation-body"],[data-settings-dialog-root],article') ||
        popup.querySelector('input,textarea,select,h1,h2,h3,h4,dl,dt,dd,table,[contenteditable],[data-user-content]')) return null;
    if (popup.hasAttribute("data-closed") || popup.closest("[data-closed],[hidden],[inert]")) return null;
    if (popup.closest('[role="presentation"]') && !popup.hasAttribute("data-open") &&
        !popup.closest('[role="presentation"][data-open]')) return null;
    const inFloatingHost = !!popup.closest('[data-base-ui-portal],#portal-root') ||
      popup.parentElement === document.body ||
      popup.parentElement?.parentElement === document.body ||
      !mainRoot?.contains(popup) ||
      !popup.closest("header,nav,aside,footer");
    if (!inFloatingHost) return null;
    const items = [...popup.querySelectorAll('[role="menuitem"],button')];
    if (items.length < 2 || items.length > 6) return null;
    const matched = new Set();
    for (const item of items) {
      const tokens = selectionItemTokens(item);
      if (!tokens.length) return null;
      const canonical = selectionMenuWords.find(word => [word, dictionary[word]].includes(tokens[0]));
      if (!canonical) return null;
      if (tokens.length > 1 && !tokens.slice(1).every(token => selectionKeycapRe.test(token))) return null;
      matched.add(canonical);
    }
    const walker = document.createTreeWalker(popup, 4);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || parent.closest('[role="menuitem"],button,[aria-hidden="true"],[hidden],kbd,[data-kbd-chord]')) continue;
      if (node.nodeValue.trim()) return null;
    }
    if (!matched.has("Copy") ||
        (!matched.has("Quote") && !matched.has("Add to Side chat") && !matched.has("Add to side chat"))) {
      return null;
    }
    return { popup, words: selectionMenuWords, kind: "selectionMenu" };
  }

  function sessionContextOwner(popup) {
    if (!popup?.isConnected ||
        !popup.matches('div[role="menu"][id][data-open][data-base-ui-focusable][data-rootownerid]') ||
        popup.hasAttribute("aria-labelledby") || popup.closest("[data-user-content],[contenteditable]")) return null;
    const presentation = popup.parentElement;
    const portalNode = presentation?.parentElement;
    if (!presentation?.matches('div[role="presentation"][data-open][data-side="bottom"]') ||
        !portalNode?.matches("div[id][data-base-ui-portal]") || portalNode.parentElement !== document.body) return null;
    const items = [];
    const mounts = [portalNode, presentation, popup];
    for (const child of popup.children) {
      if (child.matches('div[role="group"]')) {
        mounts.push(child);
        for (const member of child.children) {
          if (!member.matches('div[role="menuitem"]')) return null;
          items.push(member);
        }
      } else if (child.matches('div[role="none"][data-menu-separator]')) {
        continue;
      } else if (child.matches('div[role="menuitem"]')) {
        items.push(child);
      } else {
        return null;
      }
    }
    if (items.length < 6 || items.length > 12) return null;
    const itemRules = [
      { words: ["Rename"] },
      { words: ["Customize...", "Customize…"], projectOnly: true },
      { words: ["Settings"], projectOnly: true },
      { words: ["Pin", "Unpin"], command: "session.pin.set" },
      { words: ["Mark as unread", "Mark as read"], command: "session.read.set", projectOptional: true },
      { words: ["Show in Explorer"], command: "session.reveal" },
      { words: ["Share as secret gist"], command: "session.share-gist" },
      { words: ["Copy"], submenu: true },
      { words: ["Open in…", "Open in..."], submenu: true },
      { words: ["New section"], projectOnly: true },
      { words: ["Create nested session"] },
      { words: ["Detach session"] },
      { words: ["Archive", "Unarchive"], command: "session.archive", projectOptional: true },
      { words: ["Delete"], command: "session.delete", projectOptional: true }
    ];
    const parsed = [];
    let isProjectMenu = false;
    for (const [index, item] of items.entries()) {
      if (!item.matches('div[role="menuitem"][id][tabindex][aria-setsize][aria-posinset]') ||
          item.getAttribute("aria-setsize") !== String(items.length) ||
          item.getAttribute("aria-posinset") !== String(index + 1) ||
          item.children.length < 2 || item.children.length > 3 ||
          !item.firstElementChild.matches("span") ||
          !item.firstElementChild.firstElementChild?.matches('svg[aria-hidden="true"]')) return null;
      const isSubmenu = item.children.length === 3;
      if (isSubmenu && (!item.matches('[aria-haspopup="menu"][aria-expanded]') ||
          !item.children[2].matches('svg[aria-hidden="true"]'))) return null;
      const content = item.children[1];
      if (!content.matches("span")) return null;
      const leaf = !isSubmenu && content.children.length === 1 ? content.firstElementChild : content;
      if (!leaf?.matches("span") || (!isSubmenu && content.children.length > 1) || !usageLeafText(leaf)) return null;
      const value = leaf.firstChild.nodeValue;
      const rule = itemRules.find(candidate => Boolean(candidate.submenu) === isSubmenu &&
        candidate.words.some(word => [word, dictionary[word]].includes(value)));
      if (!rule) return null;
      if (rule.projectOnly) isProjectMenu = true;
      parsed.push({ item, content, leaf, rule, cmd: item.getAttribute("data-command") });
    }
    const labels = new Map();
    const seenCanonicals = new Set();
    for (const { item, content, leaf, rule, cmd } of parsed) {
      if (rule.projectOnly && !isProjectMenu) return null;
      if (rule.command) {
        if (isProjectMenu && rule.projectOptional) {
          if (cmd && cmd !== rule.command && !cmd.startsWith("project.")) return null;
        } else if (cmd !== rule.command) return null;
      } else if (cmd && !cmd.startsWith("session.") && (!isProjectMenu || !cmd.startsWith("project."))) {
        return null;
      }
      seenCanonicals.add(rule.words[0]);
      labels.set(leaf, rule.words);
      mounts.push(item);
      if (content !== leaf) mounts.push(content);
    }
    if (!seenCanonicals.has("Rename") || !seenCanonicals.has("Copy") || !seenCanonicals.has("Delete")) return null;
    return { popup, labels, mounts, kind: "sessionContext" };
  }

  function feedbackPopupOwner(popup) {
    if (!popup?.isConnected ||
        !popup.matches('[role="dialog"][id][data-open][data-base-ui-focusable][data-f6-focus-trap]') ||
        popup.closest("[data-user-content],[contenteditable]")) return null;
    const presentation = popup.parentElement;
    const portalNode = presentation?.parentElement;
    if (!presentation?.matches('div[role="presentation"][data-open]') ||
        !portalNode?.matches("div[data-base-ui-portal]") ||
        portalNode.parentElement !== document.body) return null;
    const triggers = [];
    for (const root of chromeRoots) {
      if (!root.isConnected || !root.matches("nav[data-sidebar-footer]")) continue;
      for (const trigger of root.querySelectorAll(
        'button[data-testid="sidebar-feedback-button"][aria-haspopup="dialog"][aria-expanded="true"][aria-controls]'
      )) {
        if (trigger.getAttribute("aria-controls") === popup.id &&
            !trigger.closest("[data-user-content],[contenteditable]")) triggers.push(trigger);
      }
    }
    if (triggers.length !== 1) return null;
    const mounts = [popup, presentation, portalNode];
    let shell = popup;
    for (let depth = 0; depth < 3; depth++) {
      if (shell.children.length !== 1 || !shell.firstElementChild.matches("div")) return null;
      shell = shell.firstElementChild;
      mounts.push(shell);
    }
    if (shell.children.length !== 3) return null;
    const [label, description, actions] = shell.children;
    if (!label.matches("label") || label.children.length !== 2 ||
        !label.firstElementChild.matches("span") ||
        !description.matches("p[id]") || !usageLeafText(description) ||
        !actions.matches("div") || actions.children.length !== 2) return null;
    const textarea = label.lastElementChild;
    const placeholder = "What feedback would you like to share?";
    const notice = "This will be posted as a public GitHub issue.";
    if (!textarea.matches('textarea[data-selectable="true"][aria-describedby]') ||
        !(textarea.getAttribute("aria-describedby") || "").split(/\s+/).includes(description.id) ||
        ![placeholder, dictionary[placeholder]].includes(textarea.getAttribute("placeholder")) ||
        ![notice, dictionary[notice]].includes(description.firstChild.nodeValue)) return null;
    const labels = new Map([[description, notice]]);
    for (const [index, word] of ["Cancel", "Share feedback"].entries()) {
      const button = actions.children[index];
      const content = button?.firstElementChild;
      const leaf = content?.firstElementChild;
      const shortcut = index === 1 && content?.children.length === 2 ? content.lastElementChild : null;
      const chord = shortcut?.firstElementChild;
      const fixedShortcut = shortcut?.matches('span[data-component="keyShortcut"]') &&
        shortcut.children.length === 1 && chord?.matches('span[data-kbd-chord="true"]') &&
        chord.children.length === 2 &&
        [...chord.children].every(key => key.matches("kbd") && usageLeafText(key));
      if (!button?.matches("button") || button.children.length !== 1 ||
          !content?.matches('span[data-component="content"]') ||
          content.children.length !== 1 && !fixedShortcut ||
          !leaf?.matches('span[data-component="label"]') || !usageLeafText(leaf) ||
          ![word, dictionary[word]].includes(leaf.firstChild.nodeValue) ||
          index === 1 && !(button.getAttribute("aria-describedby") || "").split(/\s+/).includes(description.id)) return null;
      labels.set(leaf, word);
      mounts.push(button, content);
    }
    if ([shell, label, description, actions, textarea, ...labels.keys()].some(element =>
      element.closest("[data-user-content],[contenteditable]"))) return null;
    mounts.push(label, actions);
    return { popup, trigger: triggers[0], textarea, placeholder, labels, mounts, kind: "feedback" };
  }

  function observeSessionContextBoundary(popup) {
    if (sessionContextBoundaryObservers.has(popup)) return;
    const boundaryObserver = new document.defaultView.MutationObserver(() => {
      if (stopped) return;
      if (!popup.isConnected) {
        boundaryObserver.disconnect();
        sessionContextBoundaryObservers.delete(popup);
        stopObservingChromePopup(popup);
      } else if (sessionContextOwner(popup)) {
        scanOwnedPopup(popup);
      } else {
        stopObservingChromePopup(popup);
      }
    });
    const presentation = popup.parentElement;
    const portalNode = presentation.parentElement;
    for (const boundary of [popup, presentation, portalNode]) {
      boundaryObserver.observe(boundary, {
        childList: true, attributes: true,
        attributeFilter: ["id", "role", "data-open", "data-side", "data-base-ui-portal",
          "data-base-ui-focusable", "data-rootownerid", "aria-labelledby",
          "data-user-content", "contenteditable"]
      });
    }
    sessionContextBoundaryObservers.set(popup, boundaryObserver);
  }

  function observeChromePopup(popup) {
    const sessionContext = sessionContextOwner(popup);
    if (sessionContext) {
      observeSessionContextBoundary(popup);
      let popupObserver = chromePopupObservers.get(popup);
      if (!popupObserver) {
        popupObserver = new document.defaultView.MutationObserver(mutations);
        chromePopupObservers.set(popup, popupObserver);
      }
      popupObserver.disconnect();
      sessionContextPopups.add(popup);
      for (const mount of sessionContext.mounts) popupObserver.observe(mount, {
        childList: true, attributes: true,
        attributeFilter: ["id", "role", "data-open", "data-side", "data-base-ui-focusable", "data-rootownerid",
          "data-menu-separator", "data-command", "aria-setsize", "aria-posinset", "aria-haspopup",
          "aria-expanded", "tabindex", "data-user-content", "contenteditable"]
      });
      for (const label of sessionContext.labels.keys()) {
        popupObserver.observe(label, {
          childList: true, attributes: true, attributeFilter: ["data-user-content", "contenteditable"]
        });
        popupObserver.observe(label.firstChild, { characterData: true });
      }
      return;
    }
    const feedback = feedbackPopupOwner(popup);
    if (feedback) {
      let popupObserver = chromePopupObservers.get(popup);
      if (!popupObserver) {
        popupObserver = new document.defaultView.MutationObserver(mutations);
        chromePopupObservers.set(popup, popupObserver);
      }
      popupObserver.disconnect();
      feedbackPopups.add(popup);
      for (const mount of feedback.mounts) popupObserver.observe(mount, {
        childList: true, attributes: true,
        attributeFilter: ["id", "role", "data-open", "data-base-ui-focusable", "data-f6-focus-trap",
          "data-component", "aria-describedby", "data-user-content", "contenteditable"]
      });
      for (const label of feedback.labels.keys()) popupObserver.observe(label, {
        ...chromeObserverOptions, attributeFilter: [...chromeObserverOptions.attributeFilter, "data-component"]
      });
      popupObserver.observe(feedback.textarea, { attributes: true,
        attributeFilter: ["placeholder", "aria-describedby", "data-selectable", "data-user-content", "contenteditable"] });
      return;
    }
    if (ownedPopup(popup)?.kind === "usage") {
      observeUsagePopup(popup);
      return;
    }
    const hoverOwner = ownedPopup(popup);
    if (hoverOwner?.kind === "hoverTooltip") {
      if (chromePopupObservers.has(popup)) return;
      const popupObserver = new document.defaultView.MutationObserver(mutations);
      popupObserver.observe(popup, { attributes: true,
        attributeFilter: ["data-open", "data-side", "data-align", "tabindex", "data-base-ui-focusable",
          "data-kbd-chord"] });
      popupObserver.observe(hoverOwner.label, { childList: true, characterData: true });
      chromePopupObservers.set(popup, popupObserver);
      return;
    }
    if (ownedPopup(popup)?.kind === "sidebarNewSession") {
      let popupObserver = chromePopupObservers.get(popup);
      if (!popupObserver) {
        popupObserver = new document.defaultView.MutationObserver(mutations);
        chromePopupObservers.set(popup, popupObserver);
      }
      popupObserver.disconnect();
      const boundaryOptions = { childList: true, attributes: true,
        attributeFilter: ["id", "role", "aria-labelledby", "data-open", "data-rootownerid",
          "data-command", "aria-hidden", "data-user-content", "contenteditable"] };
      popupObserver.observe(popup, boundaryOptions);
      for (const mount of popup.querySelectorAll(":scope > div, :scope > div > div, :scope > div > div > div[role=none]")) {
        popupObserver.observe(mount, boundaryOptions);
      }
      const boundaries = sidebarSessionBoundaries.get(popup) || new Set();
      const labels = sidebarSessionLabels(popup);
      for (const label of labels.keys()) {
        popupObserver.observe(label, chromeObserverOptions);
        boundaries.add(label.parentElement);
        boundaries.add(label);
      }
      for (const boundary of boundaries) {
        if (!popup.contains(boundary)) boundaries.delete(boundary);
        else if (!labels.has(boundary)) popupObserver.observe(boundary,
          boundary.matches("span") ? { attributes: true, attributeFilter: boundaryOptions.attributeFilter } : boundaryOptions);
      }
      sidebarSessionBoundaries.set(popup, boundaries);
      return;
    }
    if (chromePopupObservers.has(popup)) return;
    const popupObserver = new document.defaultView.MutationObserver(mutations);
    popupObserver.observe(popup, chromeObserverOptions);
    const portalNode = popup.parentElement?.parentElement;
    if (portalNode?.matches("[data-base-ui-portal]")) {
      popupObserver.observe(portalNode, { childList: true });
    }
    chromePopupObservers.set(popup, popupObserver);
  }

  function restorePopup(popup) {
    restoreUsagePopup(popup);
    for (const [node, entry] of tracked) {
      if (popup.contains(node)) restore(node, entry);
    }
    for (const [element, entries] of attributes) {
      if (!popup.contains(element)) continue;
      for (const [name, entry] of entries) {
        if (element.getAttribute(name) === entry.translated) element.setAttribute(name, entry.original);
      }
      attributes.delete(element);
    }
    for (let i = queue.length - 1; i >= queueHead; i--) {
      if (queue[i] && popup.contains(queue[i].node)) {
        queued.delete(queue[i].node);
        queue[i] = null;
      }
    }
  }

  function stopObservingChromePopup(popup) {
    const popupObserver = chromePopupObservers.get(popup);
    if (!popupObserver) return;
    popupObserver.disconnect();
    chromePopupObservers.delete(popup);
    feedbackPopups.delete(popup);
    sessionContextPopups.delete(popup);
    sidebarSessionBoundaries.delete(popup);
    usagePopupObserverStates.delete(popup);
    restorePopup(popup);
  }

  function scanChromePortal(portalNode) {
    if (!portalNode || portalNode.nodeType !== 1 || !portalNode.matches("[data-base-ui-portal]")) return;
    for (const popup of portalNode.querySelectorAll(
      '[role="menu"],[role="dialog"],[role="toolbar"],[role="tooltip"][id],' +
      ':scope > div[role="presentation"][data-open][data-side][data-align]'
    )) {
      const owner = ownedPopup(popup);
      if (!owner) continue;
      observeChromePopup(popup);
      scanOwnedPopup(popup);
    }
  }

  function scanOwnedPopup(popup) {
    const owner = ownedPopup(popup);
    if (!owner) return;
    if (owner.kind === "sessionContext") {
      observeChromePopup(popup);
      for (const label of owner.labels.keys()) scan(label, "portal");
    } else if (owner.kind === "feedback") {
      observeChromePopup(popup);
      for (const label of owner.labels.keys()) scan(label, "portal");
      translateAttribute(owner.textarea, "placeholder");
    } else if (owner.kind === "usage") {
      observeUsagePopup(popup);
    } else if (owner.kind === "commandPalette") {
      observeChromePopup(popup);
      const combobox = popup.querySelector('input[role="combobox"]');
      if (combobox) translateAttribute(combobox, "placeholder");
      for (const option of popup.querySelectorAll('[role="option"]')) {
        scan(option, "portal");
      }
    }
    else scan(owner.kind === "hoverTooltip" ? owner.label : popup, "portal");
  }

  function scanHoverTooltipForTrigger(trigger) {
    for (const portalNode of document.body.querySelectorAll(":scope > [data-base-ui-portal]")) {
      const popup = portalNode.querySelector(
        ':scope > div[role="presentation"][data-open][data-side][data-align]'
      );
      const owner = popup && hoverTooltipOwner(popup);
      if (owner?.trigger === trigger) {
        observeChromePopup(popup);
        scan(owner.label, "portal");
      }
    }
  }

  function isChromeText(element, text) {
    const root = chromeRootFor(element);
    if (!root) return false;
    if (sidebarStaticRoots.has(root)) return sidebarStaticKind(root) === text;
    if (root.matches(annotationToolbar)) return annotationButtonWords(element.closest("button"))?.includes(text) || false;
    const pageRule = pageControls.get(root);
    if (pageRule) return !pageRule.attribute && validPageControl(root, pageRule) && pageRule.words.includes(text) &&
      (!pageRule.workFilters || !!element.closest('button[role="tab"][aria-selected][data-tauri-drag-region="false"]'));
    if (root.matches(sidebarNavigationSelector)) {
      const button = element.closest("nav > ul > li > button[data-sidebar-nav-item][data-command]");
      if (!button || button.closest("nav") !== root) return false;
      const item = button.getAttribute("data-sidebar-nav-item");
      const fixed = Object.hasOwn(sidebarItems, item) && sidebarItems[item];
      return !!fixed && fixed.label === text && button.getAttribute("data-command") === fixed.command &&
        (item !== "home" || button.getAttribute("data-sidebar-file-drop-kind") === "new");
    }
    if (root.matches('nav[aria-labelledby="quick-links-heading"]')) {
      return ["Automations", "Customize"].includes(text) &&
        !!element.closest("li > button") && root.contains(element.closest("li > button"));
    }
    if (root.matches("[data-testid=composer-pills]")) {
      const button = element.closest("button");
      if (!button || !root.contains(button) || element.childElementCount) return false;
      return ["Background", "Artifacts", "Changes", "Scheduled"].includes(text);
    }
    if (root.matches("[data-rich-composer-footer]") && Object.hasOwn(modeTitles, text) &&
        element.matches("button") && usageLeafText(element) &&
        composerMenuKind(element) === "composerMode") return true;
    if (root.matches('aside[data-testid="chat-canvas-panel"]')) {
      return chromeWords.workspacePanel.includes(text) &&
        !element.closest('[data-user-content],[contenteditable],pre,code');
    }
    return false;
  }

  function isNavLabel(element) {
    if (element.matches("h3") && !element.childElementCount &&
        element.parentElement?.matches('li[role="presentation"]') &&
        element.parentElement.parentElement?.parentElement?.parentElement?.matches("nav") &&
        element.parentElement.parentElement.parentElement.parentElement.parentElement?.matches("[data-settings-content-root]") &&
        [ "Repositories", dictionary.Repositories ].includes(element.textContent.trim())) return true;
    const item = element.closest("nav li[id]");
    if (!item || !dialog.contains(item)) return false;
    const id = item.id.split("-option-")[1];
    if (!id || !element.closest("button")) return false;
    let parts;
    try { parts = decodeURIComponent(id).split(":"); } catch { return false; }
    return navPages.has(parts[0]) && (parts.length === 1 ||
      fixedSections.has(parts[1]) || Object.hasOwn(actionWords, parts[1]) ||
      parts[0] === "repositories" && projectNavSections.has(parts[1]));
  }

  function isProjectInstructionInput(element) {
    const section = element.parentElement;
    if (!dialog?.contains(element) || !element.matches("textarea") ||
        !section?.matches('section[data-section-id="project-instructions"]')) return false;
    const title = document.getElementById(element.getAttribute("aria-labelledby"));
    const description = document.getElementById(element.getAttribute("aria-describedby"));
    return title?.matches("h2[data-section-heading]") && description?.matches("p") &&
      title.parentElement === section && description.parentElement === section &&
      title.nextElementSibling === description && description.nextElementSibling === element;
  }

  function policyItem(element) {
    const item = element.closest("li");
    const list = item?.parentElement;
    const container = list?.parentElement;
    const section = item?.closest('section[data-section-id="project-sandbox-policy"]');
    if (!section || !dialog?.contains(section) || !section.contains(container) ||
        !list?.matches("ul") || list.children.length !== 4 ||
        ![...list.children].every(node => node.matches("li")) || container.children.length !== 2 ||
        container.lastElementChild !== list || !container.firstElementChild.matches("h3") ||
        !["Configured policy summary", dictionary["Configured policy summary"]]
          .includes(container.firstElementChild.textContent.trim())) return null;
    return [...list.children].indexOf(item);
  }

  function sandboxPolicyRow(element) {
    const section = element.closest('section[data-section-id="project-sandbox-policy"]');
    const row = element.closest('div[data-settings-row="true"][data-subsetting-id]');
    const id = row?.getAttribute("data-subsetting-id");
    const titles = {
      "additional-read-write": "Additional read/write",
      "additional-read-only": "Additional read-only",
      "denied-folders": "Denied",
      "outbound-internet": "Outbound internet",
      "local-network": "Local network",
      "git-credentials": "Git credentials",
      "github-cli-credentials": "GitHub CLI credentials"
    };
    const content = section?.children[1];
    const wrapper = row?.parentElement;
    if (!section || !dialog?.contains(section) || !Object.hasOwn(titles, id) ||
        !content?.matches("div") || wrapper?.parentElement !== content || row.children.length !== 2 ||
        !row.firstElementChild.matches("div") || row.firstElementChild.children.length !== 2 ||
        !row.firstElementChild.firstElementChild.matches("h3") ||
        !row.firstElementChild.lastElementChild.matches("p") || !row.lastElementChild.matches("div")) return null;
    const folderOrder = {
      "additional-read-write": 2,
      "additional-read-only": 3,
      "denied-folders": 4
    }[id];
    if (folderOrder !== undefined &&
        (content.children[folderOrder] !== wrapper || wrapper.children.length !== 2 ||
          wrapper.firstElementChild !== row || !wrapper.lastElementChild.matches("p"))) return null;
    const button = folderOrder !== undefined ? row.lastElementChild.querySelector(":scope > button") : null;
    const label = button?.querySelector(':scope > span[data-component="content"] > span[data-component="label"]');
    const labelText = label?.childNodes.length === 1 && label.firstChild.nodeType === 3 ? label.firstChild : null;
    return {
      section, content, wrapper, row, id,
      heading: row.firstElementChild.firstElementChild,
      description: row.firstElementChild.lastElementChild,
      label: labelText,
      empty: folderOrder !== undefined ? wrapper.lastElementChild : null,
      title: titles[id],
      folderOrder
    };
  }

  function sandboxFolderGroup(element) {
    const direct = sandboxPolicyRow(element);
    if (direct?.folderOrder !== undefined) return direct;
    const wrapper = element.matches("p") ? element.parentElement : null;
    const row = wrapper?.firstElementChild;
    const owner = row?.matches('[data-settings-row="true"][data-subsetting-id]') &&
      sandboxPolicyRow(row.firstElementChild?.firstElementChild);
    return owner?.wrapper === wrapper && owner.empty === element ? owner : null;
  }

  function policySummaryLine(node) {
    const item = node?.parentElement;
    const index = policyItem(item);
    const pattern = policySummaryLinePatterns.get(index);
    if (!pattern || !item?.matches("li") || item.childNodes.length !== pattern.original.length ||
        [...item.childNodes].some((child, position) =>
          child.nodeType !== 3 || child.parentElement !== item ||
          !child.parentElement.matches(pattern.parents[position].toLowerCase()))) return null;
    return { item, index, pattern, nodes: [...item.childNodes] };
  }

  function translatePolicySummaryLine(node) {
    const slots = policySummaryLine(node);
    if (!slots || !slots.nodes.includes(node)) return false;
    const existing = tracked.get(node);
    if (existing?.group) {
      if (validGroup(existing.group)) return true;
      restore(node, existing);
    }
    if (!slots.nodes.every((member, index) => member.nodeValue === slots.pattern.original[index])) {
      return false;
    }
    const group = {
      kind: "policySummary",
      root: slots.item,
      index: slots.index,
      nodes: slots.nodes,
      elements: [slots.item],
      children: [[...slots.item.childNodes]],
      parents: slots.nodes.map(member => member.parentElement),
      originals: slots.pattern.original,
      translated: slots.pattern.translated
    };
    for (let index = 0; index < slots.nodes.length; index++) {
      tracked.set(slots.nodes[index], {
        original: group.originals[index],
        translated: group.translated[index],
        group
      });
    }
    for (let index = 0; index < slots.nodes.length; index++) {
      if (group.originals[index] !== group.translated[index]) {
        slots.nodes[index].nodeValue = group.translated[index];
      }
    }
    return true;
  }

  function policySummarySlot(node) {
    if (node.nodeType !== 3) return null;
    const item = node.parentElement;
    if (!item?.matches("li") || policyItem(item) !== 1) return null;
    const nodes = [...item.childNodes];
    if (nodes.length !== 9 || nodes.some(child => child.nodeType !== 3)) return null;
    const section = item.closest('section[data-section-id="project-sandbox-policy"]');
    const scroll = section?.closest('[data-settings-scroll="true"]');
    if (!section?.matches('section[data-section-id="project-sandbox-policy"]') ||
        !scroll?.matches('section[data-settings-scroll="true"]') || !dialog?.contains(section)) return null;
    return { index: nodes.indexOf(node) };
  }

  function translatePolicySummarySlot(node) {
    const slot = policySummarySlot(node);
    if (!slot) return false;
    const translations = {
      0: ["Additional folders: ", "其他文件夹："],
      2: [" read/write,", " 可读写，"],
      5: [" read-only,", " 只读，"],
      8: [" denied", " 禁止访问"]
    };
    const pair = translations[slot.index];
    if (!pair) return true;
    const prior = tracked.get(node);
    const original = prior && node.nodeValue === prior.translated ? prior.original : node.nodeValue;
    if (original === pair[0]) {
      tracked.set(node, { original, translated: pair[1] });
      node.nodeValue = pair[1];
    } else if (prior) {
      tracked.delete(node);
    }
    return true;
  }

  function accountFixedSlot(element) {
    const scroll = element.closest('[data-settings-scroll][aria-label="Accounts"]');
    const card = element.closest('[data-testid^="github-account-card-"]');
    const section = element.closest("section");
    const list = card?.closest("li")?.parentElement;
    if (!scroll || !card || !list?.matches('ul[role="list"][aria-labelledby]') ||
        !scroll.contains(document.getElementById(list.getAttribute("aria-labelledby")))) return null;
    const badgeParent = card.children[0]?.children[0]?.children[1]?.children[0];
    if (badgeParent?.children.length === 2 && badgeParent.children[0].matches("p") &&
        badgeParent.children[1] === element && element.matches("span") && !element.childElementCount) return ["Default"];
    const creditsParent = element.parentElement;
    const creditsSection = creditsParent?.parentElement?.parentElement?.parentElement?.parentElement;
    if (element.matches("span") && !element.childElementCount &&
        creditsParent.children.length === 2 && creditsParent.children[0] === element &&
        creditsParent.children[1].matches("span") &&
        creditsSection?.matches("section") && creditsSection.parentElement?.parentElement?.parentElement === card) {
      return ["AI credits"];
    }
    if (!section || section.parentElement?.parentElement?.parentElement !== card) return null;
    if (element.matches("h3") && element.parentElement === section) {
      return ["Plan", "Additional usage disabled"];
    }
    const paragraph = element.closest("p");
    if (paragraph?.parentElement !== section) return null;
    if (element === paragraph) return ["AI credits are consumed based on model and token usage.",
      "to continue after plan credits run out."];
    if (element.matches("a") && element.parentElement === paragraph) return ["Learn more", "Enable additional usage"];
    return null;
  }

  function isAccountSettingsText(element, text) {
    const separate = element.closest('section[data-section-id="account-separate-copilot"]');
    if (separate) {
      const header = element.closest("[data-settings-header]");
      const block = element.closest("h2,p");
      return header?.parentElement === separate &&
        (block?.parentElement?.parentElement === header ||
          element.matches("[data-switch-state-label]") && ["On", "Off"].includes(text));
    }
    return accountFixedSlot(element)?.includes(text) || false;
  }

  function colorFilterSurface() {
    if (!colorFilterCacheDirty) return colorFilterCache;
    colorFilterCacheDirty = false;
    colorFilterCache = null;
    if (!dialog) return null;
    const breadcrumb = dialog.querySelector('nav[aria-label="Breadcrumb"]');
    const children = breadcrumb && [...breadcrumb.children];
    if (children?.length !== 3 || !children[0].matches("button") ||
        !children[1].matches("span") || !children[2].matches("h1") ||
        !["Accessibility", dictionary.Accessibility].includes(visibleMenuLabel(children[0])) ||
        !["Color filters", dictionary["Color filters"]].includes(visibleMenuLabel(children[2]))) return null;
    const scroll = [...dialog.querySelectorAll('section[data-settings-scroll="true"][aria-label="Accessibility"]')]
      .find(section => section.querySelector('button[role="combobox"][aria-haspopup="listbox"][id]'));
    if (!scroll) return null;
    const headers = [...scroll.querySelectorAll("[data-settings-header]")];
    const headerFor = title => headers.find(header => {
      const content = header.firstElementChild;
      return content?.children.length >= 2 &&
        content.children[0].matches("h2") && content.children[1].matches("p") &&
        [title, dictionary[title]].includes(content.children[0].textContent.trim());
    });
    const filterHeader = headerFor("Color filter");
    const modeHeader = headerFor("Mode");
    const filterTitle = filterHeader?.firstElementChild.firstElementChild;
    const filterDescription = filterHeader?.firstElementChild.children[1];
    const modeDescription = modeHeader?.firstElementChild.children[1];
    const trigger = filterHeader?.querySelector('button[role="combobox"][aria-haspopup="listbox"][id]');
    const describedBy = (trigger?.getAttribute("aria-describedby") || "").split(/\s+/);
    const group = modeHeader?.querySelector('div[role="radiogroup"][aria-describedby]');
    const radios = group && [...group.querySelectorAll(':scope > button[role="radio"][data-value]')];
    if (!filterTitle?.id || !filterDescription?.id || !modeDescription?.id ||
        !describedBy.includes(filterDescription.id) || !group || group.hasAttribute("aria-labelledby") ||
        group.getAttribute("aria-describedby") !== modeDescription.id ||
        radios?.length !== 3 || !["system", "light", "dark"].every(value =>
          radios.some(radio => radio.getAttribute("data-value") === value))) return null;
    colorFilterCache = { breadcrumb, scroll, filterHeader, filterTitle, filterDescription, modeHeader, modeDescription, group, trigger };
    return colorFilterCache;
  }

  function colorPreviewFrameFor(surface) {
    if (!surface) return null;
    const frames = surface.scroll.querySelectorAll('iframe[title="Color sample preview"][tabindex="-1"]');
    if (frames.length !== 1) return null;
    const frame = frames[0];
    const container = frame.parentElement;
    const wrapper = container?.parentElement;
    const heading = wrapper?.firstElementChild;
    if (!container?.matches("div") || container.children.length !== 1 || container.firstElementChild !== frame ||
        wrapper?.children.length !== 2 || wrapper.lastElementChild !== container ||
        !heading?.matches("h2") || !["Preview", dictionary.Preview].includes(heading.textContent.trim())) return null;
    return frame;
  }

  function colorPreviewContent(frame) {
    if (!frame?.isConnected || frame.getAttribute("title") !== "Color sample preview" ||
        frame.getAttribute("tabindex") !== "-1") return null;
    const frameDocument = frame.contentDocument;
    const main = frameDocument?.querySelector('main[data-theme-preview-content]');
    const mains = frameDocument?.querySelectorAll('main[data-theme-preview-content]');
    const content = main?.firstElementChild;
    const section = content?.firstElementChild;
    const heading = section?.firstElementChild;
    const list = section?.lastElementChild;
    if (!frameDocument?.body || mains?.length !== 1 || main.parentElement !== frameDocument.body ||
        main.children.length !== 1 || !content?.matches("div") || content.children.length !== 1 ||
        !section?.matches('section[aria-labelledby]') || section.children.length !== 2 ||
        !heading?.matches("h2") || !heading.id || section.getAttribute("aria-labelledby") !== heading.id ||
        heading.textContent.trim() !== "Pull requests" || !list?.matches("ul") ||
        list.children.length !== 5 || ![...list.children].every(item => item.matches("li"))) return null;
    const expected = ["Open", "Closed", "Merged", "Draft", "Queued"];
    const labels = new Map();
    for (const [index, item] of [...list.children].entries()) {
      const wrapper = item.firstElementChild;
      const label = wrapper?.firstElementChild;
      if (item.children.length !== 1 || !wrapper?.matches("span") || wrapper.children.length !== 1 ||
          !label?.matches("span") || label.childElementCount || label.childNodes.length !== 1 ||
          label.firstChild.nodeType !== 3 ||
          ![expected[index], dictionary[expected[index]]].includes(label.firstChild.nodeValue.trim())) return null;
      labels.set(label, expected[index]);
    }
    return { list, labels };
  }

  function removeColorPreviewObservation() {
    colorPreviewObserver?.disconnect();
    colorPreviewObserver = null;
    if (colorPreviewList) {
      for (const [node, entry] of tracked) {
        if (colorPreviewList.contains(node)) restore(node, entry);
      }
    }
    colorPreviewList = null;
    colorPreviewLabels = new Map();
  }

  function syncColorPreview() {
    const frame = colorPreviewFrameFor(colorFilterSurface());
    if (frame !== colorPreviewFrame) {
      removeColorPreviewObservation();
      if (colorPreviewFrame && colorPreviewFrameLoad) {
        colorPreviewFrame.removeEventListener("load", colorPreviewFrameLoad);
      }
      colorPreviewFrame = frame;
      colorPreviewFrameLoad = frame ? () => syncColorPreview() : null;
      if (frame) frame.addEventListener("load", colorPreviewFrameLoad);
    }
    if (!frame) return;
    const preview = colorPreviewContent(frame);
    if (!preview) {
      removeColorPreviewObservation();
      return;
    }
    if (preview.list !== colorPreviewList) {
      removeColorPreviewObservation();
      colorPreviewList = preview.list;
      colorPreviewLabels = preview.labels;
      colorPreviewObserver = new document.defaultView.MutationObserver(() => {
        const updated = colorPreviewContent(colorPreviewFrame);
        if (!updated) {
          colorPreviewLabels = new Map();
          for (const [node, entry] of tracked) {
            if (colorPreviewList.contains(node)) restore(node, entry);
          }
          return;
        }
        colorPreviewLabels = updated.labels;
        scan(updated.list, "settings");
      });
      colorPreviewObserver.observe(preview.list, { subtree: true, childList: true, characterData: true });
      scan(preview.list, "settings");
    } else {
      colorPreviewLabels = preview.labels;
    }
  }

  function isColorPreviewText(element, text) {
    const original = colorPreviewLabels.get(element);
    return !!original && [original, dictionary[original]].includes(text);
  }

  function isColorFilterText(element, text) {
    const surface = colorFilterSurface();
    if (!surface) return false;
    if (surface.breadcrumb.contains(element)) {
      const crumb = element.closest("button,h1");
      if (!crumb || crumb.parentElement !== surface.breadcrumb) return false;
      return ["Accessibility", "Color filters"].some(value => [value, dictionary[value]].includes(text));
    }
    if (!surface.scroll.contains(element)) return false;
    if (surface.trigger.contains(element)) {
      return ["No adjustment", "Red color blind (Protanopia)", "Green color blind (Deuteranopia)",
        "Blue-yellow color blind (Tritanopia)"].some(value => [value, dictionary[value]].includes(text));
    }
    if (surface.group.contains(element)) {
      const radio = element.closest('button[role="radio"][data-value]');
      const label = { system: "System", light: "Light", dark: "Dark" }[radio?.getAttribute("data-value")];
      return !!radio?.contains(element) && [label, dictionary[label]].includes(text);
    }
    const block = element.closest("h2,p");
    if (block?.matches("h2") && surface.scroll.contains(block)) {
      return ["Color filter", "High contrast", "Mode", "Palette", "Preview"]
        .some(value => [value, dictionary[value]].includes(text));
    }
    const header = block?.closest("[data-settings-header]");
    if (!block || !header || !surface.scroll.contains(header)) return false;
    return ["Makes colors easier to distinguish with color blindness.",
      "Strengthen text, borders, and controls.", "Light or dark appearance."]
      .some(value => [value, dictionary[value]].includes(text));
  }

  function shortcutCountNodes(element) {
    const span = element?.matches("span") ? element : element?.parentElement;
    const section = span?.parentElement?.parentElement?.parentElement?.parentElement;
    if (!span?.matches("span") || !section?.matches('section[data-section-id="accessibility-keyboard"]') ||
        !dialog?.contains(section) || span.childNodes.length !== 5) return null;
    const nodes = [...span.childNodes];
    if (nodes.some(node => node.nodeType !== 3) || nodes[1].nodeValue !== " " ||
        !["action", "actions", "项操作"].includes(nodes[2].nodeValue) ||
        ![" ", ""].includes(nodes[3].nodeValue) ||
        !["without shortcut", "without shortcuts", "未设置快捷键"].includes(nodes[4].nodeValue)) return null;
    return nodes;
  }

  function isShortcutCountNumber(node) {
    return shortcutCountNodes(node.parentElement)?.[0] === node;
  }

  function translateShortcutCount(node) {
    const nodes = shortcutCountNodes(node.parentElement);
    if (!nodes || (nodes[2] !== node && nodes[4] !== node)) return false;
    const existing = tracked.get(node);
    if (existing?.group) {
      if (validGroup(existing.group)) return true;
      restore(node, existing);
    }
    const staticNodes = nodes.slice(1);
    const originals = staticNodes.map(item => item.nodeValue);
    const group = {
      kind: "shortcutCount",
      root: node.parentElement,
      nodes: staticNodes,
      elements: [node.parentElement],
      children: [[...node.parentElement.childNodes]],
      parents: staticNodes.map(item => item.parentElement),
      originals,
      translated: [" ", "项操作", "", "未设置快捷键"]
    };
    for (let index = 0; index < staticNodes.length; index++) {
      tracked.set(staticNodes[index], {
        original: originals[index],
        translated: group.translated[index],
        group
      });
    }
    for (let index = 0; index < staticNodes.length; index++) {
      if (originals[index] !== group.translated[index]) staticNodes[index].nodeValue = group.translated[index];
    }
    return true;
  }

  function projectServerReadySlots(section) {
    const heading = section.querySelector(":scope > h2[data-section-heading='true']");
    const label = heading?.querySelector(':scope > label[for="project-server-ready-pattern"]');
    const paragraph = section.querySelector(":scope > p");
    const input = section.querySelector(':scope > input#project-server-ready-pattern[aria-describedby]');
    const description = input && document.getElementById(input.getAttribute("aria-describedby"));
    const nodes = paragraph && [...paragraph.childNodes];
    if (!heading || !label || !paragraph || !input || label.htmlFor !== input.id ||
        description !== paragraph || heading.nextElementSibling !== paragraph ||
        paragraph.nextElementSibling !== input ||
        nodes.length !== 4 || nodes[0].nodeType !== 3 || nodes[1].nodeType !== 3 ||
        !nodes[2].matches("code") || nodes[3].nodeType !== 3) return null;
    return { heading, label, paragraph };
  }

  function removalSummarySlot(node) {
    const paragraph = node?.parentElement;
    const section = paragraph?.closest('section[data-section-id="project-removal"]');
    const content = section?.firstElementChild;
    const heading = content?.firstElementChild?.querySelector(":scope > h2[data-section-heading='true']");
    const button = content?.querySelector(':scope > button');
    const header = heading?.parentElement;
    const legacy = paragraph?.parentElement === content && content?.children.length === 3 &&
      content.children[0] === header && content.children[1] === button && content.children[2] === paragraph;
    const native = paragraph?.parentElement === header && content?.children.length === 2 &&
      content.children[0] === header && content.children[1] === button &&
      header.children.length === 2 && header.children[0] === heading && header.children[1] === paragraph;
    if (!node?.isConnected || !dialog?.contains(section) || !paragraph?.matches("p") ||
        paragraph.closest("[data-user-content],[contenteditable]") ||
        !(legacy || native) || !heading || !button ||
        paragraph.childNodes.length !== 3 ||
        [...paragraph.childNodes].some(child => child.nodeType !== 3 || child.parentElement !== paragraph)) return null;
    const index = [...paragraph.childNodes].indexOf(node);
    return index >= 0 ? { index } : null;
  }

  function textStartsWith(node, value) {
    return node.length >= value.length && node.substringData(0, value.length) === value;
  }

  function textEndsWith(node, value) {
    return node.length >= value.length && node.substringData(node.length - value.length, value.length) === value;
  }

  function translateRemovalSummary(node) {
    const slot = removalSummarySlot(node);
    if (!slot) return false;
    if (slot.index === 1) return true;
    const saved = tracked.get(node);
    if (slot.index === 0) {
      const originalPrefix = "Removes ";
      const originalSuffix = " from the sidebar. The repository on your machine stays, but session worktrees are deleted and recovering uncommitted work from them is manual.";
      const translatedPrefix = dictionary["Removes "];
      const translatedSuffix = dictionary[originalSuffix];
      const prefixOwned = textStartsWith(node, originalPrefix) ||
        saved?.kind === "removalSummary" && saved.prefixOwned && textStartsWith(node, translatedPrefix);
      const suffixOwned = textEndsWith(node, originalSuffix) ||
        saved?.kind === "removalSummary" && saved.suffixOwned && textEndsWith(node, translatedSuffix);
      if (!prefixOwned && !suffixOwned) {
        if (saved?.kind === "removalSummary") tracked.delete(node);
        return true;
      }
      let ownsPrefix = false;
      let ownsSuffix = false;
      if (textStartsWith(node, originalPrefix)) {
        node.replaceData(0, originalPrefix.length, translatedPrefix);
        ownsPrefix = true;
      } else if (saved?.kind === "removalSummary" && saved.prefixOwned &&
          textStartsWith(node, translatedPrefix)) {
        ownsPrefix = true;
      }
      if (textEndsWith(node, originalSuffix)) {
        node.replaceData(node.length - originalSuffix.length, originalSuffix.length, translatedSuffix);
        ownsSuffix = true;
      } else if (saved?.kind === "removalSummary" && saved.suffixOwned &&
          textEndsWith(node, translatedSuffix)) {
        ownsSuffix = true;
      }
      tracked.set(node, {
        kind: "removalSummary", originalPrefix, translatedPrefix, prefixOwned: ownsPrefix,
        originalSuffix, translatedSuffix, suffixOwned: ownsSuffix
      });
      return true;
    }
    const original = "Its sessions, including ones started in Copilot CLI, are permanently deleted with their history. This can't be undone.";
    const translated = dictionary[original];
    if (saved && node.nodeValue === saved.translated) return true;
    if (node.nodeValue !== original) {
      if (saved) tracked.delete(node);
      return true;
    }
    tracked.set(node, { original, translated });
    node.nodeValue = translated;
    return true;
  }

  function isProjectMcpText(element, text) {
    const mcp = element.closest('section[data-testid="project-mcp-section"]');
    if (mcp?.matches('section[data-section-id="project-mcp"][data-testid="project-mcp-section"]') &&
        dialog?.contains(mcp)) {
      const empty = mcp.children[2]?.firstElementChild?.firstElementChild;
      const leaves = empty?.children.length === 3 ? [empty.children[1], empty.children[2]] : [];
      if (mcp.children.length === 5 && mcp.children[0].matches("div") &&
          mcp.children[1].matches("div") && mcp.children[2].matches("div") &&
          mcp.children[3].matches('div[data-testid="project-plugins"]') &&
          mcp.children[4].matches("div") && empty?.matches("div") &&
          mcp.children[2].children.length === 1 &&
          mcp.children[2].firstElementChild.children.length === 1 &&
          empty.children[0].matches("div") &&
          empty.children[0].querySelector(":scope > svg") &&
          leaves.every(leaf => leaf.matches("div") && leaf.childNodes.length === 1 && leaf.firstChild.nodeType === 3)) {
        if (element === leaves[0] && ["No repository MCP servers", dictionary["No repository MCP servers"]].includes(text) ||
            element === leaves[1] && ["Add servers to .mcp.json or .github/mcp.json, then refresh.",
              dictionary["Add servers to .mcp.json or .github/mcp.json, then refresh."]].includes(text)) return true;
      }
      const header = [mcp.firstElementChild, mcp.firstElementChild?.firstElementChild]
        .find(node => node?.querySelector(":scope > h2") && node.querySelector(":scope > p"));
      const title = header?.querySelector(":scope > h2");
      const summary = header?.querySelector(":scope > p");
      if (element === title && ["Repository customizations", dictionary["Repository customizations"]].includes(text) ||
          element === summary && ["Folder trust for repository plugins, hooks, and MCP servers.",
            dictionary["Folder trust for repository plugins, hooks, and MCP servers."]].includes(text)) return true;

      const owner = mcp.children[1]?.querySelector(':scope > div[data-settings-row="true"]');
      const rowHeader = owner?.firstElementChild;
      const heading = rowHeader?.querySelector(":scope > h3");
      const description = rowHeader?.querySelector(":scope > p");
      const refresh = owner?.lastElementChild?.querySelector(
        'button[aria-describedby][data-trigger-disabled] > span[data-component="content"] > span[data-component="label"]'
      );
      if (element === heading && ["MCP servers", dictionary["MCP servers"]].includes(text) ||
          element === description && ["Servers defined by this repository in .mcp.json or .github/mcp.json. Refresh reloads repository MCP servers, not plugins.",
            dictionary["Servers defined by this repository in .mcp.json or .github/mcp.json. Refresh reloads repository MCP servers, not plugins."]].includes(text) ||
          element === refresh && ["Refresh", dictionary.Refresh].includes(text)) {
        return owner?.parentElement === mcp.children[1];
      }
    }
    const plugins = element.closest('div[data-testid="project-plugins"]');
    if (plugins && dialog?.contains(plugins) &&
        plugins.closest('section[data-testid="project-mcp-section"]')) {
      const row = plugins.children[0];
      const header = row?.firstElementChild;
      const heading = header?.querySelector(":scope > h3");
      const description = header?.querySelector(":scope > p");
      const marketplaces = plugins.children[2]?.querySelector(":scope > h4");
      if (element === heading && ["Plugins", dictionary.Plugins].includes(text) ||
          element === description && ["Plugins and marketplaces effective for this repository, including ones inherited from your user settings and organization. Status reflects configuration, not whether a plugin started.",
            dictionary["Plugins and marketplaces effective for this repository, including ones inherited from your user settings and organization. Status reflects configuration, not whether a plugin started."]].includes(text)) {
        return row?.matches('div[data-settings-row="true"]');
      }
      if (element === marketplaces && !marketplaces.childElementCount &&
          ["Marketplaces", dictionary.Marketplaces].includes(text)) return true;
    }

    const legacyPlugins = element.closest('section[data-testid="project-plugins"]');
    if (!legacyPlugins || !dialog?.contains(legacyPlugins)) return false;
    const owner = legacyPlugins.firstElementChild;
    const header = owner?.firstElementChild;
    const heading = header?.querySelector(":scope > h3");
    const description = header?.querySelector(":scope > p");
    return owner?.matches('div[data-settings-row="true"]') &&
      (element === heading && ["Plugins", dictionary.Plugins].includes(text) ||
        element === description && ["Plugins and marketplaces effective for this repository, including ones inherited from your user settings and organization. Status reflects configuration, not whether a plugin started.",
          dictionary["Plugins and marketplaces effective for this repository, including ones inherited from your user settings and organization. Status reflects configuration, not whether a plugin started."]].includes(text));
  }

  function isProjectSettingsText(element, text) {
    if (isProjectMcpText(element, text)) return true;
    const section = element.closest("section[data-section-id]");
    const id = section?.getAttribute("data-section-id");
    if (!projectSections.has(id) || !dialog?.contains(section)) return false;
    const header = element.closest("[data-settings-header]");
    const block = element.closest("h2,h3,p");
    if (id === "project-branch-prefix" && element.closest('p[id$="-branch-prefix-preview"]')) {
      return element.matches("p") && text === "Preview:";
    }
    if (block && !block.closest("button,a,ul,li") && header?.parentElement === section &&
        block.parentElement.parentElement === header) return true;
    if (id === "project-instructions" && block?.parentElement === section &&
        [...section.children].some(node => isProjectInstructionInput(node) &&
          (node.getAttribute("aria-labelledby") === block.id || node.getAttribute("aria-describedby") === block.id))) return true;
    if (["project-default-branch", "project-branch-prefix"].includes(id) &&
        block?.parentElement?.parentElement?.parentElement === section &&
        (block.matches("h2,p") || element.matches("label"))) return true;
    if (id === "project-code-search" && ["Full text", "Semantic"].includes(text) &&
        element.matches("span") && !element.childElementCount && header?.parentElement === section) return true;
    if (id === "project-repository-configuration") {
      const host = element.closest('[data-testid="repo-config-host-local"]');
      if (host && section.contains(host) &&
          ["Repository configuration",
            "Current and future configuration, hooks, and extensions can run code without review across all repository environments.",
            "Revoking app trust does not revoke plugin or MCP server folder trust, even for new sessions.",
            "Repository trusted", "Revoke all trust", "Create config file"].includes(text)) return true;
      const instruction = element.closest("p");
      const code = instruction?.childNodes[2];
      return instruction?.parentElement === section && instruction.childNodes.length === 5 &&
        instruction.childNodes[0].nodeType === 3 && instruction.childNodes[1].nodeType === 3 &&
        code?.matches("code") && code.textContent === ".worktreeinclude" &&
        instruction.childNodes[3].nodeType === 3 && instruction.childNodes[4].nodeType === 3;
    }
    if (id === "project-server-ready-pattern") {
      const slots = projectServerReadySlots(section);
      if (slots && (element === slots.heading &&
          ["Server ready pattern", dictionary["Server ready pattern"]].includes(text) ||
          element === slots.label && ["Server ready pattern", dictionary["Server ready pattern"]].includes(text) ||
          element === slots.paragraph)) return true;
    }
    if (id === "project-sandbox-policy") {
      const policyContent = section.children[1];
      const policyFootnote = policyContent?.lastElementChild;
      if (element === policyFootnote &&
          ["Runtime and managed constraints may further restrict the effective policy. Changes apply to new sessions and after a session restarts; they do not change a currently running session.",
            dictionary["Runtime and managed constraints may further restrict the effective policy. Changes apply to new sessions and after a session restarts; they do not change a currently running session."]].includes(text)) return true;
      const row = element.closest('[data-settings-row="true"][data-subsetting-id="sandbox-new-sessions"]');
      if (row && section.contains(row) && block?.matches("h3,p")) return true;
      if (text === "Configured policy summary" && element.matches("h3") &&
          element.parentElement?.parentElement?.parentElement === section) return true;
      if ([0, 2, 3].includes(policyItem(element))) {
        return ["Workspace and current working directory: Read/write",
          "Network: Internet allowed · Local network allowed", "Credentials: Git allowed · GitHub CLI allowed"].includes(text);
      }
      const policyRow = sandboxPolicyRow(element);
      if (policyRow) {
        const descriptions = {
          "additional-read-write": "Folders the sandbox may read and modify.",
          "additional-read-only": "Folders the sandbox may read but not modify.",
          "denied-folders": "Folders the sandbox cannot access. A more-specific denied subfolder remains denied.",
          "outbound-internet": "Allow connections to internet services such as GitHub and package registries.",
          "local-network": "Allow loopback and local-network connections, including local development servers.",
          "git-credentials": "Allow authenticated HTTPS Git operations inside the sandbox.",
          "github-cli-credentials": "Allow the GitHub CLI to authenticate inside the sandbox."
        };
        const description = descriptions[policyRow.id];
        if (element === policyRow.heading &&
            [policyRow.title, dictionary[policyRow.title]].includes(text)) return true;
        if (element === policyRow.description && description &&
            [description, dictionary[description]].includes(text)) return true;
        if (policyRow.folderOrder !== undefined) {
          const folderGroup = sandboxFolderGroup(element);
          if (folderGroup && element === folderGroup.empty &&
              ["No additional folders.", dictionary["No additional folders."]].includes(text)) return true;
          if (element.firstChild === policyRow.label &&
              ["Add folder", dictionary["Add folder"]].includes(text)) return true;
        }
      } else {
        const folderGroup = sandboxFolderGroup(element);
        if (folderGroup && element === folderGroup.empty &&
            ["No additional folders.", dictionary["No additional folders."]].includes(text)) return true;
      }
    }
    if (id === "project-github-account") {
      const header = section.firstElementChild?.firstElementChild;
      return header?.contains(element) && (
        element === header.querySelector("h2") &&
        ["GitHub Account", dictionary["GitHub Account"]].includes(text) ||
        element === header.querySelector("p") &&
        ["Account this repository bills to and uses for API calls and agent tools.",
          dictionary["Account this repository bills to and uses for API calls and agent tools."]].includes(text)
      );
    }
    if (id === "project-scripts") {
      const content = section.firstElementChild;
      const header = content?.firstElementChild;
      const heading = header?.querySelector(":scope > h2");
      const description = header?.querySelector(":scope > p");
      const addScript = content?.lastElementChild?.querySelector(
        'button > span[data-component="content"] > span[data-component="label"]'
      );
      if (element === heading && ["Scripts", dictionary.Scripts].includes(text) ||
          element === description && ["Commands that run during workspace lifecycle events.",
            dictionary["Commands that run during workspace lifecycle events."]].includes(text)) return true;
      return element === addScript && addScript?.firstChild?.nodeType === 3 &&
        ["Add script", dictionary["Add script"]].includes(text);
    }
    if (id === "project-sparse-checkout") {
      const header = section.children[0]?.firstElementChild;
      const title = header?.querySelector(":scope > h2");
      const description = header?.querySelector(":scope > p");
      if (element === title && ["Worktree sparse-checkout", dictionary["Worktree sparse-checkout"]].includes(text) ||
          element === description && ["Limit which directories are checked out in new session worktrees (requires git 2.27+).",
            dictionary["Limit which directories are checked out in new session worktrees (requires git 2.27+)."]].includes(text)) return true;
      const group = section.children[1]?.querySelector(':scope > [role="radiogroup"]');
      if (group?.children.length === 4) {
        for (const [index, label] of [[0, "Exclude"], [2, "Include only"]]) {
          const button = group.children[index];
          const described = group.children[index + 1];
          const buttonLabel = button?.querySelector(":scope > span > span");
          const descriptionId = button?.getAttribute("aria-describedby");
          if (element === buttonLabel && described?.matches("span") && described.id === descriptionId &&
              [label, dictionary[label]].includes(text)) return true;
          const textByLabel = {
            Exclude: "Check out everything except the listed directories.",
            "Include only": "Check out only the listed directories."
          };
          if (element === described && [textByLabel[label], dictionary[textByLabel[label]]].includes(text)) return true;
        }
      }
      const row = section.children[2]?.firstElementChild;
      const rowTitle = row?.querySelector(":scope > h3");
      const rowDescription = row?.querySelector(":scope > p");
      if (element === rowTitle && ["Wait for checkout on new sessions", dictionary["Wait for checkout on new sessions"]].includes(text) ||
          element === rowDescription && ["Hold a new session's first turn until its worktree is checked out, so repository configuration, hooks, extensions, canvases, and language-server configuration are available. Setup scripts still run asynchronously. This can be slow on large repositories.",
            dictionary["Hold a new session's first turn until its worktree is checked out, so repository configuration, hooks, extensions, canvases, and language-server configuration are available. Setup scripts still run asynchronously. This can be slow on large repositories."]].includes(text)) return true;
    }
    if (id === "project-automation") {
      const header = section.firstElementChild;
      const title = header?.querySelector(":scope > h2");
      const description = header?.querySelector(":scope > p");
      const labels = section.lastElementChild?.firstElementChild?.firstElementChild?.querySelectorAll(":scope > p");
      if (element === title && ["Automation", dictionary.Automation].includes(text) ||
          element === description && ["Configure repository-level automation defaults.",
            dictionary["Configure repository-level automation defaults."]].includes(text)) return true;
      return labels?.length === 2 && (
        element === labels[0] && ["Auto-start issue sessions", dictionary["Auto-start issue sessions"]].includes(text) ||
        element === labels[1] && ["Start a session with issue context automatically.",
          dictionary["Start a session with issue context automatically." ]].includes(text)
      );
    }
    if (id === "project-removal") {
      const content = section.firstElementChild;
      const heading = content?.firstElementChild?.querySelector(":scope > h2[data-section-heading='true']");
      const buttonLabel = content?.querySelector(
        ':scope > button > span[data-component="content"] > span[data-component="label"]'
      );
      return element === heading && ["Remove repository", dictionary["Remove repository"]].includes(text) ||
        element === buttonLabel && ["Remove repository", dictionary["Remove repository"]].includes(text);
    }
    if (element.matches('span[data-switch-state-label="true"]') && ["On", "Off"].includes(text)) return true;
    if (id === "project-branch-update-strategy" && ["Merge commit", "Rebase"].includes(text)) {
      const radio = element.closest('button[role="radio"][aria-describedby]');
      const group = radio?.parentElement;
      const title = group?.getAttribute("aria-labelledby") && document.getElementById(group.getAttribute("aria-labelledby"));
      const description = group?.getAttribute("aria-describedby") && document.getElementById(group.getAttribute("aria-describedby"));
      return !!group?.matches('[role="radiogroup"]') && title?.matches("h2") && description?.matches("p") &&
        section.contains(title) && section.contains(description) && header?.parentElement === section;
    }
    return id === "project-reusable-worktrees" && text === "Clear reusable worktree" &&
      element.matches('span[data-component="label"]') &&
      !!element.closest('button')?.closest('[data-settings-row="true"]');
  }

  function isFixedRowText(element, text = element.textContent.trim()) {
    if (isProjectSettingsText(element, text)) return true;
    if (isColorFilterText(element, text)) return true;
    const section = element.closest("[data-section-id]");
    if (!section || !fixedSections.has(section.getAttribute("data-section-id"))) return false;
    if (section.getAttribute("data-section-id") === "accessibility-announcements") {
      const item = element.closest("li[data-subsetting-id]");
      const list = item?.parentElement;
      const heading = list?.getAttribute("aria-labelledby") &&
        document.getElementById(list.getAttribute("aria-labelledby"));
      const id = item?.getAttribute("data-subsetting-id");
      if (Object.hasOwn(activityLabels, id) && list.matches("ul[role=list]") &&
          heading && section.contains(heading) &&
          ["Session activity announcements", dictionary["Session activity announcements"]].includes(visibleMenuLabel(heading))) {
        if (element.parentElement === item && element.matches("div") && text === activityLabels[id]) return true;
        if (["On", "Off"].includes(text) && element.closest("button[role=switch],[data-switch-state-label]")) return true;
      }
      if (item) return false;
    }
    if (section.getAttribute("data-section-id") === "accessibility-keyboard" &&
        shortcutLabels.includes(text) && element.matches("span,div,label") && !element.closest("li")) return true;
    if (section.getAttribute("data-section-id") === "accessibility-keyboard" &&
        shortcutLabels.includes(text) && element.matches("p") && element.childElementCount === 0) {
      const item = element.closest("li");
      if (item && item.parentElement.matches("ul[role=list]") && section.contains(item.parentElement)) return true;
      if (text === "Activate voice transcription" && element.parentElement.matches("button")) {
        let owner = element.parentElement;
        for (let depth = 0; depth < 6; depth++) owner = owner.parentElement;
        if (owner === section) return true;
      }
    }
    if (section.getAttribute("data-section-id") === "accessibility-keyboard" && text === "Assign…" &&
        element.matches("span") && !element.childElementCount) {
      const button = element.closest('button[data-base-ui-tooltip-trigger][id]');
      let owner = button;
      for (let depth = 0; depth < 8; depth++) owner = owner?.parentElement;
      if (button?.contains(element) && owner === section && button.parentElement.parentElement.parentElement
          .parentElement.matches("li") && button.parentElement.parentElement.parentElement.parentElement.parentElement
          .matches("ul[role=list]")) return true;
    }
    if (section.getAttribute("data-section-id") === "accessibility-keyboard" && element.closest("li")) return false;
    if (themeSectionIds.has(section.getAttribute("data-section-id")) &&
        ["System", "Light", "Dark"].includes(text)) {
      const radio = element.closest('button[role="radio"][aria-checked][data-value]');
      const group = radio?.parentElement;
      const heading = group?.getAttribute("aria-labelledby") && document.getElementById(group.getAttribute("aria-labelledby"));
      const expected = { system: "System", light: "Light", dark: "Dark" };
      const id = section.getAttribute("data-section-id");
      const title = id === "themes-mode" ? "Mode" : "Terminal appearance";
      if (["themes-mode", "themes-terminal"].includes(id) && expected[radio?.getAttribute("data-value")] === text &&
          group?.matches('[role="radiogroup"]') && heading?.matches("h2") && section.contains(heading) &&
          group.closest("[data-settings-header=true]") &&
          (id !== "themes-mode" || heading.hasAttribute("data-section-heading")) &&
          (id !== "themes-terminal" || group.closest('[data-subsetting-id="mode"]')) &&
          [title, dictionary[title]].includes(visibleMenuLabel(heading))) return true;
      const control = element.closest('button,[role="radio"],[role="tab"],[role="option"]');
      const row = element.closest("[data-settings-row]");
      if (control && row && row.contains(control) && section.contains(row)) return true;
    }
    const headingOrDescription = element.closest("h2,h3,p");
    if (headingOrDescription && section.contains(headingOrDescription) &&
        !headingOrDescription.closest("button,a,[data-user-content]")) return true;
    if (element.closest("[data-switch-state-label],button[role=switch] .sr-only")) return true;
    const row = element.closest("[data-settings-row]");
    if (!row) return false;
    const title = row.querySelector(":scope > div:first-child > h3");
    const descriptions = row.querySelectorAll(":scope > div:first-child > p");
    return !!(title && title.contains(element)) ||
      [...descriptions].some(item => item.contains(element)) ||
      !!element.closest("[data-switch-state-label]") ||
      !!element.closest("button[role=switch] .sr-only");
  }

  function isFixedHeader(element) {
    if (element.closest("[data-settings-topbar] h1")) return true;
    const text = element.closest("h2,h3,p");
    if (!text || text.closest("button,a,ul,li")) return false;
    const scroll = text.closest("[data-settings-scroll]");
    if (!scroll) return false;
    if (scroll.getAttribute("aria-label") === "Computer Use" && scroll.querySelector("p") === text) return true;
    if (scroll.getAttribute("aria-label") === "Accounts") {
      const header = text.parentElement;
      const container = header?.parentElement?.parentElement;
      return !!container?.querySelector(":scope > ul[role=list]") &&
        container.firstElementChild?.firstElementChild === header;
    }
    const section = text.closest("[data-section-id]");
    if (section && ["general-workspace-location", "general-theme", "voice-mode-models", "computer-use-app-permissions",
      "sessions-default-model", "sessions-branch-prefix", "sessions-worktree-location", "themes-palette",
      "sessions-instructions"].includes(section.getAttribute("data-section-id"))) {
      if (section.getAttribute("data-section-id") === "sessions-instructions") {
        const header = text.parentElement;
        const title = header?.querySelector(":scope > h3");
        const titleText = title?.textContent.trim();
        const staticTitles = ["App instructions", "File-backed instructions"];
        if (title && staticTitles.some(value => titleText === value || titleText === dictionary[value]) &&
            (text === title || (text.tagName === "P" && text.previousElementSibling === title))) return true;
        const owner = header?.parentElement;
        const ownerTitle = owner?.querySelector(":scope > h3");
        const ownerText = ownerTitle?.textContent.trim();
        if (text.tagName === "P" && header?.children.length === 1 && header.firstElementChild === text &&
            ownerTitle && (ownerText === "File-backed instructions" || ownerText === dictionary["File-backed instructions"]) &&
            owner?.children[2] === header) return true;
      }
      return section.querySelector("h2")?.parentElement === text.parentElement;
    }
    if (section?.getAttribute("data-section-id") === "model-providers-providers") {
      return section.firstElementChild?.firstElementChild === text.parentElement;
    }
    if (section?.getAttribute("data-section-id") === "environments-list") {
      return text.tagName === "P" && section.children[1]?.firstElementChild === text.parentElement;
    }
    return false;
  }

  function specialTranslation(node, text) {
    const element = node.parentElement;
    if (text === "Preview" &&
        element.matches('li[id$="-option-computer-use"] > button > div[data-trailing-visual] > span')) {
      return "预览";
    }
    if (text === "Plan" && (element.closest('[data-testid="customize-category-filter"]') || element.id === "browse-integrations-heading")) {
      return "规划";
    }
    return null;
  }

  function isFixedAction(element, text) {
    const button = element.closest("button");
    if (!button || button.closest("ul,li,[role=list]")) return false;
    const section = button.closest("[data-section-id]")?.getAttribute("data-section-id");
    if (Object.hasOwn(actionWords, section) && actionWords[section].includes(text)) return true;
    return text === "Add account" && !!button.closest('[data-settings-scroll][aria-label="Accounts"]');
  }

  function ownedPopup(element) {
    if (!element?.closest?.(popupAncestorSelector)) return false;
    const contextPopup = element.closest('div[role="menu"][id][data-rootownerid]');
    const contextOwner = contextPopup && sessionContextOwner(contextPopup);
    if (contextOwner) return contextOwner;
    const copySubmenu = element.closest('div[role="menu"][id][aria-labelledby]');
    if (copySubmenu) {
      const triggerId = copySubmenu.getAttribute("aria-labelledby");
      const copyTrigger = triggerId && document.getElementById(triggerId);
      const parentMenu = copyTrigger?.closest('div[role="menu"][id][data-rootownerid]');
      if (parentMenu && sessionContextOwner(parentMenu)) {
        const leaf = copyTrigger.querySelector("span > span");
        const triggerLabel = leaf ? leaf.textContent.trim() : copyTrigger.textContent.trim();
        if (triggerLabel === "Copy" || triggerLabel === dictionary.Copy) {
          return { popup: copySubmenu, words: ["Session name", "Session ID", "Project name", "Project ID", "Path", "Copy branch"], kind: "sessionCopySubmenu" };
        }
      }
    }
    const commandPaletteDialog = element.closest('div[role="dialog"]');
    if (commandPaletteDialog) {
      const combobox = commandPaletteDialog.querySelector('input[role="combobox"]');
      const placeholder = combobox?.getAttribute("placeholder") || "";
      if (placeholder.startsWith("Search projects, repositories") || placeholder.startsWith("Search sessions, repos") ||
          placeholder === dictionary["Search projects, repositories, PRs, issues, or paste a URL…"] ||
          placeholder === dictionary["Search sessions, repos, PRs, issues, or paste a URL…"]) {
        const option = element.closest('[role="option"]');
        if (element === commandPaletteDialog || (option && commandPaletteDialog.contains(option))) {
          return {
            popup: commandPaletteDialog,
            words: ["Switch model", "Set thinking effort", "Check for updates", "Resume remote session", "Resume session by ID", "New session", "New project", "New issue", "Undo"],
            kind: "commandPalette"
          };
        }
      }
    }
    const feedbackPopup = element.closest('[role="dialog"][id][data-f6-focus-trap]');
    const feedbackOwner = feedbackPopup && feedbackPopupOwner(feedbackPopup);
    if (feedbackOwner) return feedbackOwner;
    const usagePopup = element.closest('[role="dialog"][id][aria-labelledby]');
    const usageOwner = usagePopup && usagePopupOwner(usagePopup);
    if (usageOwner) return usageOwner;
    const tooltip = element.closest('[role="tooltip"][id]');
    if (tooltip?.closest("[data-base-ui-portal]")) {
      for (const root of chromeRoots) {
        if (!root.matches(annotationToolbar)) continue;
        for (const button of root.querySelectorAll('button[data-base-ui-tooltip-trigger][aria-describedby]')) {
          const words = annotationButtonWords(button);
          if (words && (button.getAttribute("aria-describedby") || "").split(/\s+/).includes(tooltip.id)) {
            return { popup: tooltip, words, kind: "annotationTooltip" };
          }
        }
      }
      return null;
    }
    const hoverTooltip = hoverTooltipOwner(element);
    if (hoverTooltip) return hoverTooltip;
    const details = element.closest('[role="dialog"][data-auto-tier-details-overlay]');
    if (details) {
      const presentation = details.parentElement;
      const portalWrapper = presentation?.parentElement;
      const hasOpenModelMenu = [...document.querySelectorAll('[role="menu"][id][aria-labelledby]')]
        .some(menu => ownedPopup(menu)?.kind === "composerModel");
      if (details.id && details.getAttribute("aria-labelledby") && hasOpenModelMenu &&
          details.hasAttribute("data-open") &&
          presentation?.matches('[role="presentation"][data-open]') &&
          portalWrapper?.matches("[data-base-ui-portal]")) {
        return { popup: details, words: chromeWords.composerModel, kind: "composerModelDetails" };
      }
      return null;
    }
    const selectionPopup = element.closest('[role="menu"],[role="dialog"],[role="toolbar"]');
    const selectionOwner = selectionPopup && selectionMenuOwner(selectionPopup);
    if (selectionOwner) return selectionOwner;
    const popup = element.closest('[role="listbox"][id],[role="menu"][aria-labelledby]');
    if (!popup) return null;
    const role = popup.getAttribute("role");
    if (role === "listbox" && dialog && !popup.hasAttribute("aria-labelledby")) {
      const triggers = [...dialog.querySelectorAll(
        'section[data-section-id="sessions-worktree-location"] button[role="combobox"][aria-haspopup="listbox"][id][aria-expanded="true"][aria-controls]'
      )].filter(trigger => trigger.getAttribute("aria-controls") === popup.id);
      if (triggers.length === 1 && settingsPortalPopup(popup, 2)) {
        return { popup, words: popupWords["sessions-worktree-location"],
          section: "sessions-worktree-location", kind: "settings" };
      }
    }
    if (role === "listbox" && dialog) {
      const colorSurface = colorFilterSurface();
      const trigger = colorSurface?.trigger;
      const controls = trigger?.getAttribute("aria-controls");
      const linkedTriggers = controls && [...dialog.querySelectorAll(
        '[role="combobox"][aria-haspopup="listbox"][aria-expanded="true"][aria-controls]'
      )].filter(item => item.getAttribute("aria-controls") === popup.id);
      if (trigger && trigger.getAttribute("aria-expanded") === "true" &&
          controls === popup.id && linkedTriggers.length === 1 &&
          popup.getAttribute("aria-labelledby") === colorSurface.filterTitle.id &&
          settingsPortalPopup(popup, 2)) {
        return { popup, words: colorFilterPopupWords, kind: "settingsColorFilter" };
      }
    }
    const id = role === "listbox" && popup.id.endsWith("-list")
      ? popup.id.slice(0, -5) : role === "menu" ? popup.getAttribute("aria-labelledby") : null;
    const trigger = id && document.getElementById(id);
    if (!trigger || trigger.closest("[data-user-content],[contenteditable]") ||
        trigger.getAttribute("aria-expanded") !== "true" ||
        trigger.getAttribute("aria-haspopup") !== role) return null;
    if (dialog?.contains(trigger)) {
      const section = trigger.closest("[data-section-id]")?.getAttribute("data-section-id");
      const colorSurface = colorFilterSurface();
      if (colorSurface?.trigger === trigger && role === "listbox" &&
          popup.getAttribute("aria-labelledby") === colorSurface.filterTitle.id) {
        if (settingsPortalPopup(popup, 2)) {
          return { popup, words: colorFilterPopupWords, kind: "settingsColorFilter" };
        }
      }
      if (role === "menu" && section === "sessions-default-model" &&
          popup.id === trigger.getAttribute("aria-controls") &&
          popup.getAttribute("aria-labelledby") === trigger.id &&
          popup.hasAttribute("data-open") && popup.hasAttribute("data-rootownerid") &&
          settingsPortalPopup(popup, 1)) {
        return { popup, words: popupWords[section], section, kind: "settings" };
      }
      if (role === "menu" && trigger.closest('[data-settings-scroll][aria-label="Accounts"]')) {
        if (!popup.id || trigger.getAttribute("aria-controls") !== popup.id) return null;
        return { popup, words: accountActionWords, kind: "settingsAccountActions" };
      }
      if (Object.hasOwn(popupWords, section)) return { popup, words: popupWords[section], section, kind: "settings" };
    }
    const kind = chromeMenuKind(trigger);
    const presentation = popup.parentElement;
    const portalWrapper = presentation?.parentElement;
    if (kind === "sidebarNewSession" && portalWrapper?.parentElement !== document.body) return null;
    if (kind === "composerEffort") {
      const parentMenu = trigger.closest('[role="menu"]');
      if (!popup.hasAttribute("data-nested") || !presentation?.hasAttribute("data-nested") ||
          popup.getAttribute("data-rootownerid") !== parentMenu?.getAttribute("data-rootownerid")) return null;
    }
    if (kind && popup.getAttribute("role") === "menu" && popup.id &&
        trigger.getAttribute("aria-controls") === popup.id &&
        popup.getAttribute("aria-labelledby") === trigger.id &&
        popup.hasAttribute("data-open") && popup.hasAttribute("data-rootownerid") &&
        presentation?.matches('[role="presentation"][data-open]') &&
        portalWrapper?.matches("[data-base-ui-portal]")) {
      return { popup, words: chromeWords[kind], kind };
    }
    return null;
  }

  function popupForTrigger(trigger) {
    if (!trigger?.id || trigger.getAttribute("aria-expanded") !== "true") return null;
    const role = trigger.getAttribute("aria-haspopup");
    if (role === "listbox" && dialog?.contains(trigger)) {
      if (colorFilterSurface()?.trigger === trigger) {
        const id = trigger.getAttribute("aria-controls");
        const popup = id && document.getElementById(id);
        const linkedTriggers = id && [...dialog.querySelectorAll(
          '[role="combobox"][aria-haspopup="listbox"][aria-expanded="true"][aria-controls]'
        )].filter(item => item.getAttribute("aria-controls") === id);
        return linkedTriggers?.length === 1 && popup && ownedPopup(popup) ? popup : null;
      }
      if (trigger.closest('section[data-section-id="sessions-worktree-location"]')) {
        const id = trigger.getAttribute("aria-controls");
        const candidates = id ? [...dialog.querySelectorAll(
          'section[data-section-id="sessions-worktree-location"] button[role="combobox"][aria-haspopup="listbox"][aria-expanded="true"][aria-controls]'
        )].filter(item => item.getAttribute("aria-controls") === id) : [];
        const controlled = id && document.getElementById(id);
        if (candidates.length === 1 && controlled && ownedPopup(controlled)) return controlled;
        return null;
      }
      const popup = document.getElementById(trigger.id + "-list");
      return popup && ownedPopup(popup) ? popup : null;
    }
    if (role === "menu") {
      if (chromeMenuKind(trigger)) {
        const controlledId = trigger.getAttribute("aria-controls");
        const popup = controlledId && document.getElementById(controlledId);
        return popup && ownedPopup(popup) ? popup : null;
      }
      const popup = [...portal.querySelectorAll('[role="menu"][aria-labelledby]')]
        .find(menu => menu.getAttribute("aria-labelledby") === trigger.id);
      return popup && ownedPopup(popup) ? popup : null;
    }
    return null;
  }

  function isFixedChoice(element, text) {
    const trigger = element.closest('[aria-haspopup="listbox"],[aria-haspopup="menu"]');
    if (!trigger || !dialog.contains(trigger)) return false;
    const section = trigger.closest("[data-section-id]")?.getAttribute("data-section-id");
    return isSettingsChoice(section, text);
  }

  function eligible(node) {
    const element = node.parentElement;
    if (!element || !node.isConnected || (dialog && !dialog.isConnected)) return false;
    if (element.closest("input,textarea,select,code,kbd,samp,pre,[contenteditable],[data-user-content],#shortcut-announce-polite,#shortcut-announce-assertive")) return false;
    const prior = tracked.get(node);
    const text = (prior && node.nodeValue === prior.translated ? prior.original : node.nodeValue).trim();
    if (!text) return false;
    if (isColorPreviewText(element, text)) return true;
    const inDialog = !!dialog?.contains(element);
    if (inDialog) {
      if (element.closest('p[data-selectable="true"],[aria-live], [data-testid$="announce"],' +
          'section[data-testid="project-mcp-section"] ul,section[data-testid="project-plugins"] ul,' +
          'div[data-testid="project-plugins"] ul,' +
          'section[data-section-id="project-scripts"] ul')) return false;
      const projectSection = element.closest("section[data-section-id]");
      const projectId = projectSection?.getAttribute("data-section-id");
      if (projectId === "project-github-account" &&
          !projectSection.firstElementChild?.firstElementChild?.contains(element)) return false;
      if (projectId === "project-scripts") {
        const owner = projectSection.firstElementChild;
        const header = owner?.firstElementChild;
        const action = owner?.lastElementChild?.querySelector(
          'button > span[data-component="content"] > span[data-component="label"]'
        );
        if (!header?.contains(element) && element !== action) return false;
      }
      if (projectId === "project-default-branch" &&
          !projectSection.firstElementChild?.firstElementChild?.contains(element)) return false;
      if (projectId === "project-branch-prefix") {
        const preview = element.closest('p[id$="-branch-prefix-preview"]');
        if (preview ? element !== preview : !projectSection.firstElementChild?.firstElementChild?.contains(element)) return false;
      }
      if (projectId === "project-sandbox-policy" && element.closest("li") && policyItem(element) === null) return false;
      if (projectId === "project-sparse-checkout" && element.closest("ul,li")) return false;
      if (policyItem(element) === 1) return false;
      if (element.closest('[data-testid^="github-account-card-"]') && !accountFixedSlot(element)) return false;
      const removalSlot = removalSummarySlot(node);
      if (removalSlot) return removalSlot.index !== 1;
      const scroll = element.closest("[data-settings-scroll]");
      if (scroll && !scroll.hasAttribute("aria-label") &&
          !projectSections.has(projectId) &&
          !element.closest('[data-section-id="accessibility-announcements"],section[data-testid="project-mcp-section"],section[data-testid="project-plugins"]')) return false;
      const splitRoot = element.closest("p,h3");
      const splitSection = splitRoot?.closest("[data-section-id]")?.getAttribute("data-section-id");
      const splitPattern = splitPatterns.find(pattern => pattern.section === splitSection &&
        pattern.tag === splitRoot?.tagName && pattern.original.some(fragment => fragment.trim() === text));
      if (splitPattern) {
        const walker = document.createTreeWalker(splitRoot, 4);
        const fragments = [];
        while (walker.nextNode()) fragments.push(walker.currentNode);
        if (fragments.length !== splitPattern.parents.length ||
            !fragments.every((fragment, index) =>
              fragment.parentElement.matches(splitPattern.parents[index].toLowerCase()) &&
              (fragment.nodeValue === splitPattern.original[index] || fragment.nodeValue === splitPattern.translated[index]))) return false;
      }
      if (text === "Auto") {
        const button = element.parentElement?.parentElement;
        return element.matches('span[data-component="label"]') &&
          element.parentElement.matches('span[data-component="content"]') &&
          !!button?.matches('button[aria-haspopup="dialog"][id]') &&
          !!button.closest('section[data-section-id="voice-mode-language"]');
      }
      if (isAccountSettingsText(element, text) || isNavLabel(element) || isFixedRowText(element, text) || isFixedHeader(element) ||
          isFixedChoice(element, text) || isFixedAction(element, text)) return true;
    }
    if (isChromeText(element, text)) return true;
    const owner = ownedPopup(element);
    if (owner?.kind === "sessionContext") return owner.labels.get(element)?.includes(text) || false;
    if (owner?.kind === "feedback") return owner.labels.get(element) === text;
    if (owner?.kind === "settingsColorFilter") return isColorFilterPopupText(owner, element, text);
    if (owner?.kind === "settings" && owner.section === "sessions-default-model") {
      return isModelPopupChoice(element, text);
    }
    if (owner?.kind === "settings" && owner.section === "sessions-worktree-location") {
      return isStoragePopupChoice(owner, element, text);
    }
    if (owner?.kind === "settings") return isSettingsChoice(owner.section, text);
    return chromePopupText(owner, element, text);
  }

  function restore(node, entry) {
    if (entry.group) {
      for (const member of entry.group.nodes) {
        const saved = tracked.get(member);
        if (saved && saved.group === entry.group) {
          if (saved.translated !== saved.original && member.nodeValue === saved.translated) member.nodeValue = saved.original;
          tracked.delete(member);
        }
      }
      return;
    }
    if (entry.kind === "removalSummary") {
      if (entry.prefixOwned && textStartsWith(node, entry.translatedPrefix)) {
        node.replaceData(0, entry.translatedPrefix.length, entry.originalPrefix);
      }
      if (entry.suffixOwned && textEndsWith(node, entry.translatedSuffix)) {
        node.replaceData(node.length - entry.translatedSuffix.length, entry.translatedSuffix.length, entry.originalSuffix);
      }
      tracked.delete(node);
      return;
    }
    if (node.nodeValue === entry.translated) node.nodeValue = entry.original;
    tracked.delete(node);
  }

  function splitScope(root, section) {
    if (!dialog || !root.isConnected || !dialog.contains(root) ||
        root.closest("input,textarea,select,[contenteditable],[data-user-content]") ||
        root.closest("[data-section-id]")?.getAttribute("data-section-id") !== section) return false;
    const scroll = root.closest("[data-settings-scroll]");
    if (scroll && !scroll.hasAttribute("aria-label") && !projectSections.has(section)) return false;
    return isFixedRowText(root) || isFixedHeader(root);
  }

  function validGroup(group) {
    if (group.kind === "shortcutCount") {
      const nodes = shortcutCountNodes(group.root);
      return !!nodes && group.elements[0] === group.root &&
        group.root.childNodes.length === group.children[0].length &&
        group.children[0].every((child, index) => group.root.childNodes[index] === child) &&
        group.nodes.every((member, index) => member === nodes[index + 1] &&
          member.parentElement === group.parents[index] && tracked.get(member)?.group === group &&
          member.nodeValue === tracked.get(member).translated);
    }
    if (group.kind === "policySummary") {
      const slots = policySummaryLine(group.root.firstChild);
      return !!slots && slots.index === group.index &&
        group.root.childNodes.length === group.children[0].length &&
        group.children[0].every((child, index) => group.root.childNodes[index] === child) &&
        group.nodes.every((member, index) => member === slots.nodes[index] &&
          member.parentElement === group.parents[index] && tracked.get(member)?.group === group &&
          member.nodeValue === tracked.get(member).translated);
    }
    return splitScope(group.root, group.section) &&
      group.elements.every((element, index) => group.root.contains(element) &&
        element.childNodes.length === group.children[index].length &&
        group.children[index].every((child, position) => element.childNodes[position] === child)) &&
      group.nodes.every((member, index) => member.parentElement === group.parents[index] &&
        tracked.get(member)?.group === group && member.nodeValue === tracked.get(member).translated);
  }

  function translateSplitParagraph(node) {
    const root = node.parentElement?.closest("p,h3");
    const section = root?.closest("[data-section-id]")?.getAttribute("data-section-id");
    const pattern = splitPatterns.find(item => item.section === section && item.tag === root?.tagName);
    if (!pattern || !splitScope(root, section)) return false;
    const walker = document.createTreeWalker(root, 4);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (nodes.length !== pattern.original.length ||
        !nodes.every((item, index) => item.nodeValue === pattern.original[index] &&
          item.parentElement.matches(pattern.parents[index].toLowerCase()))) return false;
    const elements = [root, ...root.querySelectorAll("*")];
    const group = { nodes, root, section, elements,
      parents: nodes.map(item => item.parentElement), children: elements.map(item => [...item.childNodes]) };
    for (let i = 0; i < nodes.length; i++) {
      tracked.set(nodes[i], { original: pattern.original[i], translated: pattern.translated[i], group });
    }
    for (let i = 0; i < nodes.length; i++) {
      if (pattern.original[i] !== pattern.translated[i]) nodes[i].nodeValue = pattern.translated[i];
    }
    return true;
  }

  function translate(node) {
    if (node.nodeType !== 3) return;
    const tierItem = node.parentElement?.closest("[data-auto-tier-id]");
    if (tierItem && modelTierLabel(tierItem)?.leaf !== node.parentElement) return;
    const inDialog = !!dialog?.contains(node.parentElement);
    if (inDialog) {
      if (translateRemovalSummary(node)) return;
      if (translatePolicySummarySlot(node)) return;
      if (isShortcutCountNumber(node)) return;
      if (translateShortcutCount(node)) return;
      if (translatePolicySummaryLine(node)) return;
    }
    const prior = tracked.get(node);
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed && !prior) return;
    if (prior?.group) {
      if (validGroup(prior.group)) return;
      restore(node, prior);
    }
    if (!inDialog && !prior && !options.measure &&
        !Object.hasOwn(dictionary, trimmed) &&
        !Object.hasOwn(modeTitles, trimmed) &&
        !Object.hasOwn(permissionTitles, trimmed)) {
      return;
    }
    if (!eligible(node)) {
      const saved = tracked.get(node);
      if (saved) restore(node, saved);
      return;
    }
    const saved = tracked.get(node);
    if (saved && raw === saved.translated) return;
    if (saved) tracked.delete(node);
    if (inDialog && translateSplitParagraph(node)) return;
    const parts = /^(\s*)(.*?)(\s*)$/s.exec(raw);
    const owner = ownedPopup(node.parentElement);
    const modeTitle = parts && Object.hasOwn(modeTitles, parts[2]) &&
      (owner?.kind === "composerMode" || composerMenuKind(node.parentElement) === "composerMode")
      ? modeTitles[parts[2]] : null;
    const labels = owner?.kind === "composerMode" && nestedMenuLabels(node.parentElement.closest('[role="menuitem"]'));
    const selectedPermission = labels?.[1] === node.parentElement &&
      ["Tool permissions", dictionary["Tool permissions"]].includes(visibleMenuLabel(labels[0]));
    const permissionTitle = parts && (owner?.kind === "composerPermissions" || selectedPermission) &&
      Object.hasOwn(permissionTitles, parts[2]) ? permissionTitles[parts[2]] : null;
    const special = parts && specialTranslation(node, parts[2]);
    const value = modeTitle || permissionTitle || special || (parts && (Object.hasOwn(dictionary, parts[2])
      ? dictionary[parts[2]] : null));
    if (!value || value === parts[2]) {
      if (options.measure && parts?.[2] && !Object.hasOwn(dictionary, parts[2]) && !unmatched.has(node)) {
        unmatched.add(node);
        stats.unmatchedFixedNodes++;
      }
      return;
    }
    const accountFragment = inDialog && node.parentElement.matches("p") && accountFixedSlot(node.parentElement)?.includes(parts[2]);
    const translated = (accountFragment && /^[，。！？；：]/u.test(value) ? "" : parts[1]) + value + parts[3];
    tracked.set(node, { original: node.nodeValue, translated });
    node.nodeValue = translated;
  }

  const chromeAriaLabels = new Set([
    "Configure sessions",
    "Share feedback",
    "Share feedback, Control + Enter",
    "Back",
    "Back, Ctrl + Left bracket",
    "Forward",
    "Forward, Ctrl + Right bracket",
    "Toggle sidebar",
    "Toggle sidebar, Ctrl + B",
    "Search",
    "Search, Ctrl + K",
    "Settings",
    "Settings, Ctrl + Comma",
    "Resize sidebar",
    "New session",
    "New chat",
    "Environment: This computer",
    "Environment: Cloud",
    "Repository: Chat",
    "Mode: Interactive, Ctrl + Shift + M",
    "Start voice recording, Control + Alt + Space",
    "More response actions",
    "More options",
    "Dismiss Copilot Fusion Standard, High, and Max promotion"
  ]);

  function translateAttribute(element, name) {
    if (name === "aria-label" &&
        (usageTriggers.has(element) || isUsageTriggerCandidate(element))) {
      usageTriggerOwner(element);
      return;
    }
    const prior = attributes.get(element)?.get(name);
    const pageRule = pageControls.get(element);
    const pageRuleCandidate = pageRule?.attribute === name;
    const settingsField = dialog?.contains(element) &&
      (element.matches('nav input[role="searchbox"]') ||
        element.matches("button") && element.closest("[data-settings-topbar],[data-section-id=general-workspace-location]"));
    const repositoryInstructions = name === "placeholder" && isProjectInstructionInput(element);
    const feedbackField = name === "placeholder" && feedbackPopupOwner(element.closest('[role="dialog"]'))?.textarea === element;
    const chromeButtonCandidate = !stopped && name === "aria-label" &&
      !element.closest('[data-user-content],[contenteditable],[data-testid="conversation-body"]') &&
      (element.matches('button,div[role="separator"],[data-sidebar-resize-handle]') ||
        chromeRoots.has(element) || chromeRootFor(element));
    const commandInputCandidate = !stopped && name === "placeholder" &&
      element.matches('div[role="dialog"] input[role="combobox"]');
    if (!prior && !settingsField && !repositoryInstructions && !feedbackField && !pageRuleCandidate && !chromeButtonCandidate && !commandInputCandidate) return;

    const current = element.getAttribute(name);
    if (!current) return;
    const original = prior && current === prior.translated ? prior.original : current;
    const chromeButton = chromeButtonCandidate && chromeAriaLabels.has(original);
    const commandInput = commandInputCandidate &&
      (original.startsWith("Search projects, repositories") || original.startsWith("Search sessions, repos") ||
        original === "Search projects, repositories, PRs, issues, or paste a URL…");
    if (!prior && !settingsField && !repositoryInstructions && !feedbackField && !chromeButton && !commandInput && !pageRuleCandidate) return;
    const search = element.matches('nav input[role="searchbox"]') &&
      ["placeholder", "aria-label"].includes(name);
    const close = name === "aria-label" && original === "Close dialog" &&
      element.matches("button") && element.closest("[data-settings-topbar]");
    const locationAction = name === "aria-label" &&
      ["Reset to default location", "Copy path", "Show in Explorer"].includes(original) &&
      element.matches("button") && element.closest('[data-section-id="general-workspace-location"]');
    const eligible = !stopped && (repositoryInstructions || feedbackField || chromeButton || commandInput ||
      (dialog && dialog.contains(element) && (search || close || locationAction)) ||
      (pageRule?.attribute === name && validPageControl(element, pageRule) &&
        pageRule.words.includes(original) && !element.closest("[data-user-content],[data-testid=conversation-body]")));
    if (!eligible) {
      if (prior && current === prior.translated) element.setAttribute(name, prior.original);
      attributes.get(element)?.delete(name);
      if (!attributes.get(element)?.size) attributes.delete(element);
      return;
    }
    if (prior && current === prior.translated) return;
    attributes.get(element)?.delete(name);
    if (!attributes.get(element)?.size) attributes.delete(element);
    if (!Object.hasOwn(dictionary, current) || dictionary[current] === current) return;
    if (!attributes.has(element)) attributes.set(element, new Map());
    attributes.get(element).set(name, { original: current, translated: dictionary[current] });
    element.setAttribute(name, dictionary[current]);
  }

  function scan(node, kind) {
    if (!node) return;
    if (kind === "portal" && (node.nodeType === 1 || node.nodeType === 3)) {
      const element = node.nodeType === 3 ? node.parentElement : node;
      const owner = ownedPopup(element);
      if (owner?.kind === "sidebarNewSession" && !sidebarSessionLabels(owner.popup).has(element)) {
        observeChromePopup(owner.popup);
        for (const label of sidebarSessionLabels(owner.popup).keys()) scan(label, kind);
        return;
      }
      if (owner?.kind === "sidebar" && !element.closest('[role="menuitem"]')) {
        if (node.nodeType === 1) {
          for (const item of node.querySelectorAll('[role="menuitem"]')) {
            if (item.closest('[role="menu"]') === owner.popup) scan(item, kind);
          }
        }
        return;
      }
    }
    if (kind === "settings") stats.settingsScans++;
    else if (kind === "chrome") stats.chromeScans++;
    else stats.portalScans++;
    if (node.nodeType !== 1 && node.nodeType !== 3) return;
    if (queued.has(node)) return;
    queued.add(node);
    queue.push({ node, walker: node.nodeType === 1 && !pageControls.get(node)?.attribute
      ? document.createTreeWalker(node, 5) : null, rootProcessed: false, verifiedEpoch: 0 });
    scheduleDrain();
  }

  let drainEpoch = 0;
  function drain() {
    timer = null;
    const epoch = ++drainEpoch;
    const clock = document.defaultView.performance;
    const start = clock.now();
    const budgetMs = initialDrainDone ? 5 : 12;
    let remaining = initialDrainDone ? 400 : 1200;
    initialDrainDone = true;
    while (queueHead < queue.length && remaining > 0 && clock.now() - start < budgetMs) {
      const task = queue[queueHead];
      if (!task) { queueHead++; continue; }
      const element = task.node.nodeType === 3 ? task.node.parentElement : task.node;
      if (!task.node.isConnected) {
        queue[queueHead++] = null;
        queued.delete(task.node);
        continue;
      }
      if (task.verifiedEpoch !== epoch) {
        if (!dialog?.contains(element) && !chromeRootFor(element) && !ownedPopup(element) &&
            !(colorPreviewFrame?.isConnected && colorPreviewList?.contains(element))) {
          queue[queueHead++] = null;
          queued.delete(task.node);
          continue;
        }
        task.verifiedEpoch = epoch;
      }
      if (task.node.nodeType === 3) {
        translate(task.node);
        queue[queueHead++] = null;
        queued.delete(task.node);
        remaining--;
        continue;
      }
      if (!task.rootProcessed) {
        task.rootProcessed = true;
        const rule = pageControls.get(task.node);
        if (rule?.attribute) translateAttribute(task.node, rule.attribute);
        if (task.node.hasAttributes() && task.node.matches(attrTargetSelector)) {
          for (const name of ["placeholder", "aria-label", "data-placeholder"]) {
            if (task.node.hasAttribute(name)) translateAttribute(task.node, name);
          }
        }
      }
      const node = task.walker?.nextNode();
      if (!node) { queue[queueHead++] = null; queued.delete(task.node); continue; }
      if (node.nodeType === 3) translate(node);
      else if (node.hasAttributes() && node.matches(attrTargetSelector)) {
        for (const name of ["placeholder", "aria-label", "data-placeholder"]) {
          if (node.hasAttribute(name)) translateAttribute(node, name);
        }
      }
      remaining--;
    }
    if (queueHead >= queue.length) {
      queue.length = 0;
      queueHead = 0;
    } else if (queueHead > 128) {
      queue.splice(0, queueHead);
      queueHead = 0;
    }
    if (options.measure) {
      stats.batchMs.push(clock.now() - start);
      if (stats.batchMs.length > 512) stats.batchMs.shift();
    }
    if (queueHead < queue.length && !stopped) scheduleDrain();
  }

  function ownedPopupForTrigger(trigger) {
    if (trigger.matches('button[data-testid="sidebar-feedback-button"][aria-haspopup="dialog"][aria-expanded="true"][aria-controls]')) {
      const popup = document.getElementById(trigger.getAttribute("aria-controls"));
      return popup && feedbackPopupOwner(popup)?.trigger === trigger ? popup : null;
    }
    const usageTrigger = usageTriggerOwner(trigger);
    if (usageTrigger && trigger.getAttribute("aria-expanded") === "true") {
      const controlled = trigger.getAttribute("aria-controls");
      const popup = controlled && document.getElementById(controlled);
      return popup && usagePopupOwner(popup)?.trigger === trigger ? popup : null;
    }
    if (chromeMenuKind(trigger)) return popupForTrigger(trigger);
    if (!dialog || !dialog.contains(trigger) || !trigger.id ||
        trigger.getAttribute("aria-expanded") !== "true") return null;
    if (colorFilterSurface()?.trigger === trigger) return popupForTrigger(trigger);
    const section = trigger.closest("[data-section-id]")?.getAttribute("data-section-id");
    const accountMenu = trigger.getAttribute("aria-haspopup") === "menu" &&
      !!trigger.closest('[data-settings-scroll][aria-label="Accounts"]');
    if (!Object.hasOwn(popupWords, section) && !accountMenu) return null;
    return popupForTrigger(trigger);
  }

  function findDialog(node) {
    if (node.nodeType !== 1) return null;
    return node.matches("[data-settings-dialog-root][role=dialog]")
      ? node : node.querySelector("[data-settings-dialog-root][role=dialog]");
  }

  function restoreTracked() {
    queue.length = 0;
    queueHead = 0;
    queued.clear();
    if (timer !== null) document.defaultView.clearTimeout(timer);
    timer = null;
    for (const [node, entry] of tracked) restore(node, entry);
    for (const [element, entries] of attributes) {
      for (const [name, entry] of entries) {
        if (element.getAttribute(name) === entry.translated) element.setAttribute(name, entry.original);
      }
    }
    attributes.clear();
  }

  function activate(next) {
    if (dialog === next) return;
    restoreTracked();
    dialog = next;
    colorFilterCache = null;
    colorFilterCacheDirty = true;
    for (const root of chromeRoots) scan(root, "chrome");
    for (const popup of chromePopupObservers.keys()) {
      if (ownedPopup(popup)) scanOwnedPopup(popup);
    }
    if (dialog) {
      scan(dialog, "settings");
      for (const trigger of dialog.querySelectorAll('[aria-expanded="true"][aria-haspopup]')) {
        const popup = ownedPopupForTrigger(trigger);
        if (popup && ownedPopup(popup)) scanOwnedPopup(popup);
      }
    }
    syncColorPreview();
  }

  function mutations(records) {
    if (stopped) return;
    const started = options.measure ? document.defaultView.performance.now() : 0;
    stats.callbacks++;
    if (dialog && (!dialog.isConnected || !dialog.matches("[data-settings-dialog-root][role=dialog]"))) activate(null);
    const changedText = new Set();
    let ownershipChanged = false;
    let popupOwnershipChanged = false;
    let refreshColorPreview = false;
    let needsRefreshPage = false;
    let needsPruneChrome = false;
    for (const record of records) {
      const contextPopup = sessionContextPopups.size
        ? [...sessionContextPopups].find(popup => popup.contains(record.target)) : null;
      if (contextPopup) {
        if (sessionContextOwner(contextPopup)) scanOwnedPopup(contextPopup);
        else stopObservingChromePopup(contextPopup);
        continue;
      }
      const feedbackPopup = feedbackPopups.size
        ? [...feedbackPopups].find(popup => popup.contains(record.target)) : null;
      if (feedbackPopup) {
        if (feedbackPopupOwner(feedbackPopup)) scanOwnedPopup(feedbackPopup);
        else stopObservingChromePopup(feedbackPopup);
        continue;
      }
      if (dialog?.contains(record.target) && (record.type === "childList" || record.type === "attributes")) {
        colorFilterCache = null;
        colorFilterCacheDirty = true;
        refreshColorPreview = true;
      }
      if (sidebarStaticRoots.has(record.target) && !sidebarStaticKind(record.target)) {
        ownershipChanged = true;
        const sidebar = record.target.closest("[data-sidebar-live-width]");
        if (sidebar) discoverSidebarStatic(sidebar);
        needsPruneChrome = true;
        continue;
      }
      if (pageBoundaryObservers.has(record.target) || emptyMessageRoots.has(record.target.parentElement)) {
        ownershipChanged = true;
        needsRefreshPage = true;
        continue;
      }
      if (sidebarBoundaryObservers.has(record.target)) {
        ownershipChanged = true;
        const sidebar = record.target.closest("[data-sidebar-live-width]");
        if (sidebar) discoverSidebarNavigation(sidebar);
        needsPruneChrome = true;
        continue;
      }
      if (record.type === "childList" && colorPreviewList?.contains(record.target)) {
        const updated = colorPreviewContent(colorPreviewFrame);
        if (updated?.list === colorPreviewList) {
          colorPreviewLabels = updated.labels;
          scan(updated.list, "settings");
        } else {
          colorPreviewLabels = new Map();
          for (const [node, entry] of tracked) {
            if (colorPreviewList.contains(node)) restore(node, entry);
          }
        }
      }
      if (!dialog && record.type === "childList" &&
          (record.target === portal || [...record.addedNodes].some(node => node === portal))) {
        for (const node of record.addedNodes) {
          const found = findDialog(node);
          if (found) { activate(found); break; }
        }
      }
      if (record.type === "characterData") {
        const policySlot = dialog ? policySummarySlot(record.target) : null;
        if ([1, 4, 7].includes(policySlot?.index)) continue;
        const pageRule = pageControls.get(record.target.parentElement);
        if (pageRule?.workHeading || pageRule?.customizeHeading) {
          ownershipChanged = true;
          needsRefreshPage = true;
        }
        const item = record.target.parentElement?.closest('[role="menuitem"][aria-haspopup="menu"][id]');
        if (nestedMenuLabels(item)?.includes(record.target.parentElement)) ownershipChanged = true;
        const prior = tracked.get(record.target);
        const translationStillPresent = prior?.kind === "removalSummary"
          ? (!prior.prefixOwned || textStartsWith(record.target, prior.translatedPrefix)) &&
            (!prior.suffixOwned || textEndsWith(record.target, prior.translatedSuffix))
          : prior && record.target.nodeValue === prior.translated;
        if (!translationStillPresent) changedText.add(record.target);
      } else if (record.type === "childList") {
        if (record.removedNodes.length) ownershipChanged = true;
        if (record.target.nodeType === 1 && dialog?.contains(record.target) &&
            (record.target.closest('section[data-section-id="sessions-worktree-location"],section[data-section-id="sessions-default-model"]') ||
              record.target.closest('section[data-settings-scroll="true"][aria-label="Accessibility"]'))) {
          ownershipChanged = true;
        }
        const sessionOwner = ownedPopup(record.target);
        if (sessionOwner?.kind === "sidebarNewSession") {
          observeChromePopup(sessionOwner.popup);
          scan(sessionOwner.popup, "portal");
          continue;
        }
        if (record.target.nodeType === 1 && record.removedNodes.length &&
            record.target.matches(annotationMountSelectors[0])) needsPruneChrome = true;
        if (portal && portal.contains(record.target) && record.target.nodeType === 1 && discoverAnnotationMounts(record.target)) {
          needsPruneChrome = true;
          continue;
        }
        if (record.target === portal) {
          for (const node of record.addedNodes) if (node.nodeType === 1) discoverChromeRoots(node);
          needsPruneChrome = true;
        }
        if (record.target === document.body) {
          for (const node of record.addedNodes) {
            scanChromePortal(node);
            if (node.nodeType === 1 && !node.matches("[data-base-ui-portal]")) discoverChromeRoots(node);
          }
          if (!needsPruneChrome && record.removedNodes.length) {
            for (const node of record.removedNodes) {
              if (node.nodeType === 1 && !node.matches("[data-base-ui-portal]")) {
                needsPruneChrome = true;
                break;
              }
            }
          }
          for (const popup of chromePopupObservers.keys()) {
            if (!popup.isConnected) stopObservingChromePopup(popup);
          }
          for (const [popup, boundaryObserver] of sessionContextBoundaryObservers) {
            if (!popup.isConnected) {
              boundaryObserver.disconnect();
              sessionContextBoundaryObservers.delete(popup);
            }
          }
          continue;
        }
        if (record.target === mainRoot) {
          for (const node of record.addedNodes) {
            if (node.nodeType === 1) discoverChromeRoots(node);
          }
          needsPruneChrome = true;
          continue;
        }
        for (const node of record.addedNodes) {
          if (dialog?.contains(node)) scan(node, "settings");
          else if (chromeRootFor(record.target)) scan(node, "chrome");
          else if (sessionOwner?.kind === "usage") scanOwnedPopup(sessionOwner.popup);
          else if (sessionOwner) scan(node, "portal");
          else if (node.nodeType === 1) {
            if (node.matches("[data-base-ui-portal]")) {
              scanChromePortal(node);
              continue;
            }
            if (!record.target.closest?.('[data-user-content],[contenteditable]')) {
              const popups = node.matches('[role="listbox"],[role="menu"],[role="dialog"],[role="toolbar"]')
                ? [node]
                : node.querySelectorAll('[role="listbox"],[role="menu"],[role="dialog"],[role="toolbar"]');
              for (const popup of popups) {
                if (ownedPopup(popup)) {
                  observeChromePopup(popup);
                  scan(popup, "portal");
                }
              }
            }
          }
        }
      } else if (record.type === "attributes") {
        if (portal && portal.contains(record.target) &&
            ["role", "data-testid", "data-open", "data-image-preview-dialog", "data-window-dialog-position",
              "data-user-content", "contenteditable"].includes(record.attributeName)) {
          discoverAnnotationMounts(record.target);
          if (record.target.parentElement) discoverAnnotationMounts(record.target.parentElement);
        }
        if (!needsPruneChrome && pageOwnerAttrSet.has(record.attributeName)) {
          for (const root of chromeRoots) {
            if (record.target === root || record.target.contains(root)) {
              needsPruneChrome = true;
              if (pageControls.has(root)) needsRefreshPage = true;
              break;
            }
          }
        }
        if (pageControls.has(record.target) &&
            record.attributeName !== pageControls.get(record.target).attribute) needsRefreshPage = true;
        if (record.attributeName === "data-selected" &&
            record.target.matches("button[data-sidebar-nav-item][data-command]")) needsRefreshPage = true;
        const quotaLabel = record.attributeName === "aria-label" &&
          (usageTriggers.has(record.target) || isUsageTriggerCandidate(record.target));
        const hoverOnlyAttr = ["tabindex", "data-side", "data-align", "data-kbd-chord"].includes(record.attributeName) ||
          (record.attributeName === "aria-describedby" && !pageControls.has(record.target) && !dialog?.contains(record.target));
        if (record.attributeName === "data-popup-open" || hoverOnlyAttr) {
          popupOwnershipChanged = true;
          if (record.attributeName === "data-popup-open") scanHoverTooltipForTrigger(record.target);
        } else if (!["placeholder", "aria-label"].includes(record.attributeName) ||
            (record.attributeName === "aria-label" && record.target.hasAttribute("data-settings-scroll")) ||
            quotaLabel) {
          ownershipChanged = true;
        }
        if (["placeholder", "aria-label"].includes(record.attributeName) && !quotaLabel) {
          translateAttribute(record.target, record.attributeName);
        }
        if (record.attributeName === "data-placeholder") translateAttribute(record.target, record.attributeName);
        const popup = record.target.hasAttribute("aria-haspopup") ? ownedPopupForTrigger(record.target) : null;
        if (popup && ownedPopup(popup)) {
          if (chromeMenuKind(record.target)) observeChromePopup(popup);
          scanOwnedPopup(popup);
        } else if (record.target.matches('button[aria-haspopup="menu"][id]')) {
          const controlled = record.target.getAttribute("aria-controls");
          const inactivePopup = controlled && document.getElementById(controlled);
          if (inactivePopup && chromePopupObservers.has(inactivePopup)) stopObservingChromePopup(inactivePopup);
          for (const activePopup of chromePopupObservers.keys()) {
            if (!ownedPopup(activePopup)) stopObservingChromePopup(activePopup);
          }
        }
        if (record.target.getAttribute("role") === "tooltip" && record.target.hasAttribute("id") &&
            ownedPopup(record.target)) {
          observeChromePopup(record.target);
          scan(record.target, "portal");
        }
        if ((record.attributeName === "aria-describedby" || record.attributeName === "role") &&
            record.target.matches('button[data-base-ui-tooltip-trigger][aria-describedby]')) {
          observeAnnotationTooltips(record.target);
        }
        if ((record.target.getAttribute("role") === "menu" && record.target.hasAttribute("aria-labelledby")) ||
            ((record.attributeName === "data-open" || record.attributeName === "role") &&
              record.target.matches('[role="menu"],[role="dialog"],[role="toolbar"]'))) {
          const owner = ownedPopup(record.target);
          if (owner) {
            if (owner.kind === "selectionMenu") observeChromePopup(record.target);
            scan(record.target, "portal");
          } else if (chromePopupObservers.has(record.target)) {
            stopObservingChromePopup(record.target);
          }
        }
        if (chromePopupObservers.size) {
          const sessionPopup = record.target.closest('[role="menu"][aria-labelledby]');
          if (ownedPopup(sessionPopup)?.kind === "sidebarNewSession") scan(sessionPopup, "portal");
        }
        if (dialog?.contains(record.target) && record.attributeName === "data-section-id") {
          scan(record.target, "settings");
        }
        if (dialog?.contains(record.target) && record.attributeName === "data-subsetting-id") {
          scan(record.target, "settings");
        }
        if (dialog?.contains(record.target) && record.attributeName === "aria-label" &&
            record.target.hasAttribute("data-settings-scroll") && record.target.hasAttribute("aria-label")) {
          scan(record.target, "settings");
        }
        if (["data-command", "data-sidebar-nav-item", "data-sidebar-file-drop-kind",
          "data-user-content", "contenteditable"].includes(record.attributeName) && chromeRootFor(record.target)) {
          scan(record.target, "chrome");
        }
      }
    }
    if (needsRefreshPage) refreshPageControls();
    if (needsPruneChrome) removeDisconnectedChromeRoots(false);
    if (refreshColorPreview) syncColorPreview();
    for (const node of changedText) {
      if (dialog && dialog.contains(node)) scan(node, "settings");
      else {
        const owner = ownedPopup(node.parentElement);
        if (owner?.kind === "usage") scanOwnedPopup(owner.popup);
        else if (owner) scan(node, "portal");
        else if (chromeRootFor(node.parentElement)) scan(node, "chrome");
      }
    }
    if (ownershipChanged || popupOwnershipChanged) {
      for (const popup of chromePopupObservers.keys()) {
        if (!popup.isConnected || !ownedPopup(popup)) stopObservingChromePopup(popup);
      }
    }
    if (ownershipChanged) {
      for (const [node, entry] of tracked) {
        if (entry.group ? !validGroup(entry.group) : !eligible(node)) {
          restore(node, entry);
        }
      }
      for (const [element, entries] of attributes) {
        for (const name of entries.keys()) translateAttribute(element, name);
      }
    }
    if (options.measure) {
      stats.callbackMs.push(document.defaultView.performance.now() - started);
      if (stats.callbackMs.length > 512) stats.callbackMs.shift();
    }
  }

  const observer = new document.defaultView.MutationObserver(mutations);
  function attachMainRoot(candidate) {
    if (!candidate?.isConnected) return false;
    const isNew = mainRoot !== candidate;
    mainRoot = candidate;
    if (!observedMainRoots.has(mainRoot)) {
      observedMainRoots.add(mainRoot);
      observer.observe(mainRoot, { childList: true });
    }
    if (isNew) discoverChromeRoots(mainRoot);
    return true;
  }
  discoverChromeRoots(document);
  initialized = true;
  observer.observe(portal, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ["aria-expanded", "aria-controls", "aria-haspopup", "data-settings-dialog-root",
      "data-section-id", "data-subsetting-id", "data-settings-row", "data-user-content",
      "contenteditable", "role", "id", "aria-labelledby", "aria-label", "placeholder",
      "data-value", "data-settings-header", "data-section-heading", "data-testid", "data-open",
      "data-image-preview-dialog", "data-window-dialog-position", "aria-describedby", "title"]
  });
  observer.observe(document.body, { childList: true });
  if (mainRoot) attachMainRoot(mainRoot);
  const bootstrapShellReady = () =>
    !!mainRoot?.isConnected &&
    !!document.querySelector("[data-sidebar-live-width]") &&
    !!document.querySelector('[data-rich-composer-footer],[data-testid="composer-pills"]');
  let bootstrapObserver = null;
  let bootstrapTimer = null;
  if (!bootstrapShellReady()) {
    const shellSelector = 'main[data-app-shell-main],[data-sidebar-live-width],[data-rich-composer-footer],[data-testid="composer-pills"],[data-testid="conversation-composer-area"],nav[data-sidebar-footer]';
    const observedShellContainers = new WeakSet();
    const watchShellContainer = (node, depth = 0) => {
      if (!node || node.nodeType !== 1 || node === portal || observedShellContainers.has(node) ||
          node.matches('[data-base-ui-portal],[data-testid="conversation-body"],#chat,.chat,[data-user-content],[contenteditable],[data-settings-dialog-root]')) return;
      observedShellContainers.add(node);
      bootstrapObserver?.observe(node, { childList: true });
      if (depth < 2) {
        for (const child of node.children) watchShellContainer(child, depth + 1);
      }
    };
    bootstrapObserver = new document.defaultView.MutationObserver(records => {
      if (stopped) return;
      for (const record of records) {
        if (record.target.nodeType === 1 &&
            record.target.closest('[data-testid="conversation-body"],#chat,.chat,[data-user-content],[contenteditable],[data-settings-dialog-root]')) {
          continue;
        }
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (!mainRoot?.isConnected) {
            const foundMain = node.matches("main[data-app-shell-main]")
              ? node : node.querySelector("main[data-app-shell-main]");
            if (foundMain) attachMainRoot(foundMain);
          }
          if (node.matches(shellSelector) || node.querySelector(shellSelector)) {
            discoverChromeRoots(node);
          } else {
            watchShellContainer(node);
          }
        }
      }
      if (bootstrapShellReady()) {
        bootstrapObserver?.disconnect();
        bootstrapObserver = null;
        if (bootstrapTimer !== null) {
          document.defaultView.clearTimeout(bootstrapTimer);
          bootstrapTimer = null;
        }
      }
    });
    for (const child of document.body.children) watchShellContainer(child);
    if (mainRoot?.isConnected) watchShellContainer(mainRoot);
    bootstrapTimer = document.defaultView.setTimeout(() => {
      bootstrapObserver?.disconnect();
      bootstrapObserver = null;
      bootstrapTimer = null;
    }, 15000);
    bootstrapTimer?.unref?.();
  }
  activate(findDialog(portal));
  for (const portalNode of document.querySelectorAll("[data-base-ui-portal]")) {
    if (portalNode.parentElement === document.body || portalNode.parentElement === portal) {
      scanChromePortal(portalNode);
    }
  }
  return {
    stats,
    stop() {
      if (stopped) return;
      stopped = true;
      bootstrapObserver?.disconnect();
      bootstrapObserver = null;
      if (bootstrapTimer !== null) {
        document.defaultView.clearTimeout(bootstrapTimer);
        bootstrapTimer = null;
      }
      if (timer !== null) {
        document.defaultView.clearTimeout(timer);
        timer = null;
      }
      drainInFlight = false;
      drainChannel?.port1.close();
      drainChannel?.port2.close();
      observer.disconnect();
      for (const rootObserver of chromeRootObservers.values()) rootObserver.disconnect();
      chromeRootObservers.clear();
      for (const [popup, popupObserver] of chromePopupObservers) {
        popupObserver.disconnect();
        sidebarSessionBoundaries.delete(popup);
        restoreUsagePopup(popup);
      }
      chromePopupObservers.clear();
      feedbackPopups.clear();
      sessionContextPopups.clear();
      for (const boundaryObserver of sessionContextBoundaryObservers.values()) boundaryObserver.disconnect();
      sessionContextBoundaryObservers.clear();
      usagePopupObserverStates.clear();
      for (const boundaryObserver of sidebarBoundaryObservers.values()) boundaryObserver.disconnect();
      sidebarBoundaryObservers.clear();
      sidebarStaticBoundaries.clear();
      for (const boundary of pageBoundaryObservers.values()) boundary.disconnect();
      pageBoundaryObservers.clear();
      pageRouteBoundaries.clear();
      emptyMessageRoots.clear();
      pageControls.clear();
      removeColorPreviewObservation();
      if (colorPreviewFrame && colorPreviewFrameLoad) {
        colorPreviewFrame.removeEventListener("load", colorPreviewFrameLoad);
      }
      colorPreviewFrame = null;
      colorPreviewFrameLoad = null;
      restoreTracked();
      dialog = null;
    }
  };
}

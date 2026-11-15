export function startSettingsTranslation(document, dictionary, options = {}) {
  const portal = document.getElementById("portal-root");
  if (!portal) throw new Error("Copilot portal root was not found");
  const navPages = new Set([
    "general", "account", "sessions", "themes", "accessibility", "voice",
    "computer-use", "model-providers", "experimental", "environments", "repositories"
  ]);
  const fixedSections = new Set([
    "general-auto-update", "general-launch-at-login", "general-tray-menu",
    "general-delete-chat-confirmation", "general-delete-view-confirmation",
    "general-find-in-workspace-position", "general-notification-sound",
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
    "voice-mode-shortcut", "voice-mode-recording-behavior",
    "experimental-experiments", "themes-mode", "themes-terminal", "computer-use-general"
  ]);
  const popupWords = {
    "general-find-in-workspace-position": ["Top right", "Top left", "Bottom right", "Bottom left", "Center"],
    "sessions-verbosity": ["Minimal", "Balanced", "Detailed", "Collapse completed turn details behind a summary panel",
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
  const actionWords = {
    "general-about": ["Check for updates"],
    "general-workspace-location": ["Change location…"],
    "general-theme": ["Change theme"],
    "sessions-manage-sessions": ["Manage sessions"],
    "voice-mode-input-device": ["Learn more", "Open preferences", "Test mic"],
    "model-providers-providers": ["Add provider"]
  };
  const splitPatterns = [
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
  const tracked = new Map();
  const attributes = new Map();
  const stats = { settingsScans: 0, portalScans: 0, callbacks: 0, unmatchedFixedNodes: 0, batchMs: [], callbackMs: [] };
  const unmatched = new WeakSet();
  const queue = [];
  const queued = new Set();
  let timer = null;
  let dialog = null;
  let stopped = false;

  function isNavLabel(element) {
    const item = element.closest("nav li[id]");
    if (!item || !dialog.contains(item)) return false;
    const id = item.id.split("-option-")[1];
    if (!id || !element.closest("button")) return false;
    let parts;
    try { parts = decodeURIComponent(id).split(":"); } catch { return false; }
    return navPages.has(parts[0]) && (parts.length === 1 ||
      fixedSections.has(parts[1]) || Object.hasOwn(actionWords, parts[1]));
  }

  function isFixedRowText(element) {
    const section = element.closest("[data-section-id]");
    if (!section || !fixedSections.has(section.getAttribute("data-section-id"))) return false;
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

  function isUpdateStatus(element) {
    if (!element.matches('p[id]') || element.childNodes.length !== 1 ||
        element.firstChild.nodeType !== 3 ||
        !element.closest('[data-section-id="general-about"]')) return false;
    const heading = element.previousElementSibling;
    return !!heading && heading.tagName === "H3" &&
      /^GitHub v\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(heading.textContent.trim());
  }

  function specialTranslation(node, text) {
    const element = node.parentElement;
    if (text === "Preview" &&
        element.matches('li[id$="-option-computer-use"] > button > div[data-trailing-visual] > span')) {
      return "预览";
    }
    if (!isUpdateStatus(element)) return null;
    const match = /^Up to date\. Last checked on ((?:January|February|March|April|May|June|July|August|September|October|November|December) (?:[1-9]|[12]\d|3[01]), \d{4}, at (?:[1-9]|1[0-2]):[0-5]\d (?:AM|PM))\.$/.exec(text);
    return match ? `已是最新版本。上次检查：${match[1]}。` : null;
  }

  function isFixedAction(element, text) {
    const button = element.closest("button");
    if (!button || button.closest("ul,li,[role=list]")) return false;
    const section = button.closest("[data-section-id]")?.getAttribute("data-section-id");
    if (Object.hasOwn(actionWords, section) && actionWords[section].includes(text)) return true;
    return text === "Add account" && !!button.closest('[data-settings-scroll][aria-label="Accounts"]');
  }

  function ownedPopup(element) {
    if (!element) return false;
    const popup = element.closest('[role="listbox"][id],[role="menu"][aria-labelledby]');
    if (!popup || !dialog) return null;
    const role = popup.getAttribute("role");
    const id = role === "listbox" && popup.id.endsWith("-list")
      ? popup.id.slice(0, -5) : role === "menu" ? popup.getAttribute("aria-labelledby") : null;
    const trigger = id && document.getElementById(id);
    const section = trigger?.closest("[data-section-id]")?.getAttribute("data-section-id");
    if (!trigger || !dialog.contains(trigger) || trigger.getAttribute("aria-expanded") !== "true" ||
        trigger.getAttribute("aria-haspopup") !== role || !Object.hasOwn(popupWords, section)) return null;
    return { popup, words: popupWords[section] };
  }

  function isFixedChoice(element, text) {
    const trigger = element.closest('[aria-haspopup="listbox"],[aria-haspopup="menu"]');
    if (!trigger || !dialog.contains(trigger)) return false;
    const section = trigger.closest("[data-section-id]")?.getAttribute("data-section-id");
    return Object.hasOwn(popupWords, section) && popupWords[section].includes(text);
  }

  function eligible(node) {
    const element = node.parentElement;
    if (!element || !node.isConnected || !dialog || !dialog.isConnected) return false;
    if (element.closest("input,textarea,select,code,kbd,samp,pre,[contenteditable],[data-user-content]")) return false;
    const scroll = element.closest("[data-settings-scroll]");
    if (scroll && !scroll.hasAttribute("aria-label")) return false;
    const prior = tracked.get(node);
    const text = (prior && node.nodeValue === prior.translated ? prior.original : node.nodeValue).trim();
    return dialog.contains(element)
      ? isNavLabel(element) || isFixedRowText(element) || isFixedHeader(element) ||
        isFixedChoice(element, text) || isFixedAction(element, text) || isUpdateStatus(element)
      : !!ownedPopup(element)?.words.includes(text);
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
    if (node.nodeValue === entry.translated) node.nodeValue = entry.original;
    tracked.delete(node);
  }

  function splitScope(root, section) {
    if (!dialog || !root.isConnected || !dialog.contains(root) ||
        root.closest("input,textarea,select,[contenteditable],[data-user-content]") ||
        root.closest("[data-section-id]")?.getAttribute("data-section-id") !== section) return false;
    const scroll = root.closest("[data-settings-scroll]");
    if (scroll && !scroll.hasAttribute("aria-label")) return false;
    return isFixedRowText(root) || isFixedHeader(root);
  }

  function validGroup(group) {
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
    const prior = tracked.get(node);
    if (prior?.group) {
      if (validGroup(prior.group)) return;
      restore(node, prior);
    }
    if (!eligible(node)) {
      const saved = tracked.get(node);
      if (saved) restore(node, saved);
      return;
    }
    const saved = tracked.get(node);
    if (saved && node.nodeValue === saved.translated) return;
    if (saved) tracked.delete(node);
    if (translateSplitParagraph(node)) return;
    const parts = /^(\s*)(.*?)(\s*)$/s.exec(node.nodeValue);
    const value = parts && (Object.hasOwn(dictionary, parts[2])
      ? dictionary[parts[2]] : specialTranslation(node, parts[2]));
    if (!value || value === parts[2]) {
      if (options.measure && parts?.[2] && !Object.hasOwn(dictionary, parts[2]) && !unmatched.has(node)) {
        unmatched.add(node);
        stats.unmatchedFixedNodes++;
      }
      return;
    }
    const translated = parts[1] + value + parts[3];
    tracked.set(node, { original: node.nodeValue, translated });
    node.nodeValue = translated;
  }

  function translateAttribute(element, name) {
    const prior = attributes.get(element)?.get(name);
    const current = element.getAttribute(name);
    const original = prior && current === prior.translated ? prior.original : current;
    const search = element.matches('nav input[role="searchbox"]') &&
      ["placeholder", "aria-label"].includes(name);
    const close = name === "aria-label" && original === "Close dialog" &&
      element.matches("button") && element.closest("[data-settings-topbar]");
    const locationAction = name === "aria-label" &&
      ["Reset to default location", "Copy path", "Show in Explorer"].includes(original) &&
      element.matches("button") && element.closest('[data-section-id="general-workspace-location"]');
    const eligible = dialog && dialog.contains(element) && (search || close || locationAction);
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
    if (kind === "settings") stats.settingsScans++;
    else stats.portalScans++;
    if (node.nodeType !== 1 && node.nodeType !== 3) return;
    if (queued.has(node)) return;
    queued.add(node);
    queue.push({ node, walker: node.nodeType === 1 ? document.createTreeWalker(node, 5) : null, rootProcessed: false });
    if (timer === null) timer = document.defaultView.setTimeout(drain, 0);
  }

  function drain() {
    timer = null;
    const clock = document.defaultView.performance;
    const start = clock.now();
    let remaining = 150;
    while (queue.length && remaining > 0 && clock.now() - start < 4) {
      const task = queue[0];
      if (!task.node.isConnected || !dialog) { queue.shift(); queued.delete(task.node); continue; }
      if (task.node.nodeType === 3) {
        translate(task.node);
        queue.shift();
        queued.delete(task.node);
        remaining--;
        continue;
      }
      if (!task.rootProcessed) {
        task.rootProcessed = true;
        if (task.node.matches('input[role="searchbox"],button[aria-label]')) {
          for (const name of ["placeholder", "aria-label"]) translateAttribute(task.node, name);
        }
      }
      const node = task.walker.nextNode();
      if (!node) { queue.shift(); queued.delete(task.node); continue; }
      if (node.nodeType === 3) translate(node);
      else if (node.matches('input[role="searchbox"],button[aria-label]')) {
        for (const name of ["placeholder", "aria-label"]) translateAttribute(node, name);
      }
      remaining--;
    }
    if (options.measure) {
      stats.batchMs.push(clock.now() - start);
      if (stats.batchMs.length > 512) stats.batchMs.shift();
    }
    if (queue.length && !stopped) timer = document.defaultView.setTimeout(drain, 0);
  }

  function ownedPopupForTrigger(trigger) {
    if (!dialog || !dialog.contains(trigger) || !trigger.id ||
        trigger.getAttribute("aria-expanded") !== "true") return null;
    const section = trigger.closest("[data-section-id]")?.getAttribute("data-section-id");
    if (!Object.hasOwn(popupWords, section)) return null;
    if (trigger.getAttribute("aria-haspopup") === "listbox") return document.getElementById(trigger.id + "-list");
    if (trigger.getAttribute("aria-haspopup") === "menu") {
      return [...portal.querySelectorAll('[role="menu"][aria-labelledby]')]
        .find(menu => menu.getAttribute("aria-labelledby") === trigger.id) || null;
    }
    return null;
  }

  function findDialog(node) {
    if (node.nodeType !== 1) return null;
    return node.matches("[data-settings-dialog-root][role=dialog]")
      ? node : node.querySelector("[data-settings-dialog-root][role=dialog]");
  }

  function activate(next) {
    if (dialog === next) return;
    queue.length = 0;
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
    dialog = next;
    if (dialog) {
      scan(dialog, "settings");
      for (const trigger of dialog.querySelectorAll('[aria-expanded="true"][aria-haspopup]')) {
        const popup = ownedPopupForTrigger(trigger);
        if (popup && ownedPopup(popup)) scan(popup, "portal");
      }
    }
  }

  function mutations(records) {
    if (stopped) return;
    const started = options.measure ? document.defaultView.performance.now() : 0;
    stats.callbacks++;
    if (dialog && (!dialog.isConnected || !dialog.matches("[data-settings-dialog-root][role=dialog]"))) activate(null);
    const changedText = new Set();
    let ownershipChanged = false;
    for (const record of records) {
      if (!dialog && record.type === "childList") {
        for (const node of record.addedNodes) {
          const found = findDialog(node);
          if (found) { activate(found); break; }
        }
      }
      if (!dialog) continue;
      if (record.type === "characterData") {
        const prior = tracked.get(record.target);
        if (!prior || record.target.nodeValue !== prior.translated) changedText.add(record.target);
      } else if (record.type === "childList") {
        if (record.removedNodes.length) ownershipChanged = true;
        for (const node of record.addedNodes) {
          if (dialog.contains(node)) scan(node, "settings");
          else if (node.nodeType === 1) {
            const popups = node.matches('[role="listbox"],[role="menu"]') ? [node] : node.querySelectorAll('[role="listbox"],[role="menu"]');
            for (const popup of popups) {
              if (ownedPopup(popup)) scan(popup, "portal");
            }
          }
        }
      } else if (record.type === "attributes") {
        if (!["placeholder", "aria-label"].includes(record.attributeName) ||
            (record.attributeName === "aria-label" && record.target.hasAttribute("data-settings-scroll"))) {
          ownershipChanged = true;
        }
        if (["placeholder", "aria-label"].includes(record.attributeName)) {
          translateAttribute(record.target, record.attributeName);
        }
        const popup = ownedPopupForTrigger(record.target);
        if (popup && ownedPopup(popup)) scan(popup, "portal");
        if (dialog.contains(record.target) && record.attributeName === "data-section-id") {
          scan(record.target, "settings");
        }
        if (dialog.contains(record.target) && record.attributeName === "aria-label" &&
            record.target.hasAttribute("data-settings-scroll") && record.target.hasAttribute("aria-label")) {
          scan(record.target, "settings");
        }
      }
    }
    for (const node of changedText) {
      if (dialog && dialog.contains(node)) scan(node, "settings");
      else if (ownedPopup(node.parentElement)) scan(node, "portal");
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
  observer.observe(portal, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ["aria-expanded", "data-settings-dialog-root", "data-section-id", "data-settings-row", "data-user-content",
      "contenteditable", "role", "class", "id", "aria-labelledby", "aria-label", "placeholder"]
  });
  activate(findDialog(portal));
  return {
    stats,
    stop() {
      if (stopped) return;
      stopped = true;
      observer.disconnect();
      activate(null);
    }
  };
}

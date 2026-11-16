import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { dictionary } from "../src/dictionary.js";
import { startSettingsTranslation } from "../src/overlay.js";

async function waitFor(predicate) {
  const end = Date.now() + 4000;
  while (!predicate() && Date.now() < end) await new Promise(resolve => setTimeout(resolve, 0));
  assert.ok(predicate(), "timed out waiting for overlay");
}

test("legacy fixed Settings variants translate inside existing owners without widening them", async () => {
  const title = "Keep awake while agent is running";
  const description = "Include sessions created by the Copilot CLI in the sidebar. Choose how far back to surface them, or turn this off to hide CLI-created sessions entirely.";
  const dom = new JSDOM(`<body><main><h3>${title}</h3></main>
    <div id="portal-root"><div role="dialog" data-settings-dialog-root>
      <section data-settings-scroll aria-label="Sessions">
        <section data-section-id="sessions-keep-awake"><h3>${title}</h3></section>
        <section data-section-id="sessions-cli-sessions"><p>${description}</p></section>
        <section data-section-id="fictional"><h3>${title}</h3></section>
      </section>
    </div></div></body>`);
  const { document } = dom.window;
  const heading = document.querySelector('[data-section-id="sessions-keep-awake"] h3');
  const paragraph = document.querySelector('[data-section-id="sessions-cli-sessions"] p');
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => heading.textContent === dictionary[title] && paragraph.textContent === dictionary[description]);
  assert.equal(document.querySelector("main h3").textContent, title);
  assert.equal(document.querySelector('[data-section-id="fictional"] h3').textContent, title);
  overlay.stop();
  assert.equal(heading.textContent, title);
  assert.equal(paragraph.textContent, description);
  dom.window.close();
});

test("legacy shortcut action variants reuse the exact Accessibility list owner", async () => {
  const labels = ["Open review changes", "Run current session", "Stop running", "Submit pull request review"];
  const dom = new JSDOM(`<body><main><p>${labels[0]}</p></main>
    <div id="portal-root"><div role="dialog" data-settings-dialog-root>
      <section data-settings-scroll aria-label="Accessibility">
        <section data-section-id="accessibility-keyboard"><ul role="list">
          ${labels.map(label => `<li><button><p>${label}</p><kbd>F1</kbd></button></li>`).join("")}
        </ul></section>
        <section data-section-id="fictional"><ul><li><p>${labels[0]}</p></li></ul></section>
      </section>
    </div></div></body>`);
  const { document } = dom.window;
  const actions = [...document.querySelectorAll('[data-section-id="accessibility-keyboard"] p')];
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => actions.every((node, index) => node.textContent === dictionary[labels[index]]));
  assert.equal(document.querySelector("main p").textContent, labels[0]);
  assert.equal(document.querySelector('[data-section-id="fictional"] p').textContent, labels[0]);
  assert.deepEqual([...document.querySelectorAll("kbd")].map(node => node.textContent), ["F1", "F1", "F1", "F1"]);
  overlay.stop();
  assert.deepEqual(actions.map(node => node.textContent), labels);
  dom.window.close();
});

test("legacy experiment copy translates only in the existing fixed Settings owner", async () => {
  const title = "Unified model controls";
  const description = "Combine model, reasoning effort, and context window selection into one composer menu.";
  const dom = new JSDOM(`<body><main><h3>${title}</h3><p>${description}</p><p>Thinking…</p></main>
    <div id="portal-root"><div role="dialog" data-settings-dialog-root>
      <section data-settings-scroll aria-label="Experimental">
        <section data-section-id="experimental-experiments">
          <div data-settings-row><div><h3>${title}</h3><p>${description}</p></div>
            <button role="switch" aria-checked="true"></button></div>
          <div data-user-content><h3>${title}</h3></div>
          <pre><code>${description}</code></pre><input value="${title}">
        </section>
        <section data-section-id="fictional-data"><h3>${title}</h3></section>
      </section>
    </div></div></body>`);
  const { document } = dom.window;
  const owner = document.querySelector('[data-section-id="experimental-experiments"]');
  const heading = owner.querySelector("[data-settings-row] h3");
  const paragraph = owner.querySelector("[data-settings-row] p");
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => heading.textContent === "统一模型控件" &&
    paragraph.textContent === dictionary[description]);
  assert.equal(document.querySelector("main h3").textContent, title);
  assert.equal(document.querySelector("main p").textContent, description);
  assert.equal(document.querySelector("main p:last-child").textContent, "Thinking…");
  assert.equal(owner.querySelector("[data-user-content] h3").textContent, title);
  assert.equal(owner.querySelector("code").textContent, description);
  assert.equal(owner.querySelector("input").value, title);
  assert.equal(owner.querySelector("button").getAttribute("aria-checked"), "true");
  assert.equal(document.querySelector('[data-section-id="fictional-data"] h3').textContent, title);
  owner.setAttribute("data-user-content", "");
  await waitFor(() => heading.textContent === title && paragraph.textContent === description);
  overlay.stop();
  assert.equal(heading.textContent, title);
  dom.window.close();
});

function fixture() {
  const dom = new JSDOM(`<body><main>Thinking</main><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll aria-label="Sessions">
      <section data-section-id="sessions-default-model"><div><div><h2>Default model for new sessions</h2><p>Choose whether new sessions use the latest model selected in any session or a preferred model.</p></div><div><button>Personal model</button></div></div></section>
      <section data-section-id="sessions-instructions">
        <div><div><h2>Instructions</h2><p><span>Preferences that apply to every session across all repositories. Copilot may also load instructions from files on this machine.</span></p></div></div>
        <div><div><h3>App instructions</h3><p>Editable instructions stored by this app and added to new sessions.</p><textarea>App instructions</textarea></div></div>
        <div><div><h3>File-backed instructions</h3><p>These files are discovered by the Copilot runtime and applied when enabled. Edit the source file to change them.</p><div><p>No file-backed instructions were found.</p></div></div></div>
        <ul><li><h3>App instructions</h3></li></ul>
      </section>
      <section data-section-id="sessions-auto-approve"><div><div><h2>Tool permissions</h2><p><span id="permissions"></span></p></div></div></section>
      <section data-section-id="sessions-commit-attribution"><div><div><h2>Commit attribution</h2><p><span id="commit"></span></p></div></div></section>
      <section data-section-id="sessions-branch-prefix"><div><div><h2>Default branch prefix</h2><p><span id="branch"></span></p></div></div><input value="fictional-user"></section>
      <section data-section-id="sessions-worktree-location"><div><div><h2>Worktree location</h2><p><span id="worktree"></span></p></div></div><p>Example: C:\\fictional\\path</p></section>
    </section>
    <section data-settings-scroll aria-label="Themes">
      <section data-section-id="themes-mode">
        <div data-settings-row><div><h3>App appearance</h3><div role="group">
          <button role="radio" aria-checked="true"><span>System</span></button>
          <button role="radio" aria-checked="false"><span>Light</span></button>
          <button role="radio" aria-checked="false"><span>Dark</span></button>
        </div></div></div>
        <button role="radio">Dark</button>
      </section>
      <section data-section-id="themes-terminal"><div data-settings-row><div><h3>Terminal appearance</h3><div role="group">
        <button role="radio" aria-checked="true">System</button>
        <button role="radio" aria-checked="false">Light</button>
        <button role="radio" aria-checked="false">Dark</button>
      </div></div></div></section>
      <section data-section-id="themes-palette"><div><div><h2>Palettes</h2><p id="palette"></p></div></div><ul><li>Palettes</li></ul></section>
    </section>
    <section data-settings-scroll aria-label="Accessibility"><section data-section-id="accessibility-keyboard-shortcuts-toggle"><div data-settings-row><div><h3 id="shortcut"></h3><p>Sets Copilot to Interactive, Plan, or Autopilot. Requires Use keyboard shortcuts enabled.</p></div></div></section></section>
    <section data-settings-scroll aria-label="Voice dictation"><section data-section-id="voice-mode-input-device"><div><h2>Input device</h2><p>Choose which microphone Voice dictation should use when recording.</p></div><button>Personal microphone</button></section></section>
    <section data-settings-scroll aria-label="Computer Use"><p>Computer Use lets Copilot interact with desktop apps by clicking controls, entering text, and using visual context.</p><section data-section-id="computer-use-general"></section></section>
  </div></div></body>`);
  const { document } = dom.window;
  function pieces(id, items) {
    const root = document.getElementById(id);
    for (const [tag, text] of items) {
      if (!tag) root.append(document.createTextNode(text));
      else {
        const element = document.createElement(tag);
        element.textContent = text;
        root.append(element);
      }
    }
  }
  pieces("permissions", [[null, "Choose when new local sessions ask before running tools. Once a session has started,"], [null, " "],
    ["code", "/permissions manual|assisted|allow-all"], [null, " "],
    [null, "sets a session-specific override. Managed settings can restrict modes or set a different starting mode without changing this saved preference."]]);
  pieces("commit", [[null, "Include a "], ["code", "Co-authored-by"], [null, " "],
    [null, "trailer in commit messages written by Copilot."]]);
  pieces("branch", [[null, "Prefix added to generated branch names. Use"], [null, " "],
    ["code", "%username%"], [null, " "], [null, "for your GitHub login."]]);
  pieces("worktree", [[null, "Store new worktrees under the"], [null, " "]]);
  const link = document.createElement("button");
  const linkContent = document.createElement("span");
  linkContent.setAttribute("data-component", "content");
  const linkText = document.createElement("span");
  linkText.setAttribute("data-component", "label");
  linkText.textContent = "global storage location";
  linkContent.append(linkText);
  link.append(linkContent);
  document.getElementById("worktree").append(link, document.createTextNode("."));
  pieces("palette", [[null, "Configure additional options in "], ["button", "Accessibility"], [null, "."]]);
  const shortcut = document.getElementById("shortcut");
  shortcut.append(document.createTextNode("Cycle agent modes with"), document.createTextNode(" "));
  const glyphs = document.createElement("span");
  for (const text of ["⇧", "⇥"]) {
    const kbd = document.createElement("kbd");
    kbd.textContent = text;
    glyphs.append(kbd);
  }
  const label = document.createElement("span");
  label.textContent = "Shift + Tab";
  shortcut.append(glyphs, label);
  return { dom, document };
}

test("translates observed fixed settings while preserving code, shortcuts and personal data", async () => {
  const { dom, document } = fixture();
  const button = document.querySelector("#worktree button");
  let clicked = false;
  button.addEventListener("click", () => { clicked = true; });
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.getElementById("shortcut").textContent.includes("循环切换代理模式") &&
    document.querySelector('[aria-label="Computer Use"] > p').textContent.startsWith("计算机使用功能允许"));
  assert.equal(document.querySelector('[data-section-id="sessions-default-model"] h2').textContent, "新会话的默认模型");
  assert.equal(document.querySelector('[data-section-id="sessions-default-model"] p').textContent, "选择新会话使用任意会话最近选择的模型，还是首选模型。");
  assert.equal(document.querySelector('[data-section-id="sessions-default-model"] button').textContent, "Personal model");
  assert.equal(document.querySelector('[data-section-id="sessions-instructions"] h2').textContent, "指令");
  assert.equal(document.querySelector('[data-section-id="sessions-instructions"] h2 + p').textContent, "适用于所有仓库中每个会话的偏好设置。Copilot 也可能从此计算机上的文件加载指令。");
  assert.deepEqual([...document.querySelectorAll('[data-section-id="sessions-instructions"] h3 + p')].map(e => e.textContent),
    ["由此应用存储并添加到新会话的可编辑指令。", "这些文件由 Copilot 运行时发现，并在启用时应用。如需修改，请编辑源文件。"]);
  assert.equal(document.querySelector('[data-section-id="sessions-instructions"] textarea').value, "App instructions");
  assert.equal(document.querySelector('[data-section-id="sessions-instructions"] li h3').textContent, "App instructions");
  assert.equal(document.querySelector('[data-section-id="sessions-instructions"] div div div p').textContent, "未找到基于文件的指令。");
  assert.equal(document.getElementById("permissions").querySelector("code").textContent, "/permissions manual|assisted|allow-all");
  assert.match(document.getElementById("permissions").textContent, /^选择新本地会话/);
  assert.equal(document.getElementById("commit").querySelector("code").textContent, "Co-authored-by");
  assert.equal(document.getElementById("commit").textContent, "在 Copilot 编写的提交消息中包含 Co-authored-by 署名。");
  assert.equal(document.getElementById("branch").querySelector("code").textContent, "%username%");
  assert.equal(document.getElementById("branch").textContent, "添加到生成分支名称的前缀。使用 %username% 表示你的 GitHub 登录名。");
  assert.equal(document.querySelector('[data-section-id="sessions-branch-prefix"] input').value, "fictional-user");
  assert.equal(document.querySelector('[data-section-id="sessions-worktree-location"] > p').textContent, "Example: C:\\fictional\\path");
  assert.equal(button.textContent, "全局存储位置");
  assert.equal(document.getElementById("worktree").textContent, "将新工作树存储在 全局存储位置下。");
  button.click();
  assert.equal(clicked, true);
  assert.equal(document.getElementById("palette").textContent, "在辅助功能中配置更多选项。");
  assert.deepEqual([...document.querySelectorAll('[data-section-id="themes-mode"] [data-settings-row] [role=radio]')].map(node =>
    [node.textContent, node.getAttribute("aria-checked")]), [
    ["系统", "true"], ["浅色", "false"], ["深色", "false"]
  ]);
  assert.deepEqual([...document.querySelectorAll('[data-section-id="themes-terminal"] [role=radio]')].map(node =>
    [node.textContent, node.getAttribute("aria-checked")]), [
    ["系统", "true"], ["浅色", "false"], ["深色", "false"]
  ]);
  assert.equal(document.querySelector('[data-section-id="themes-mode"] > button').textContent, "Dark");
  assert.equal(document.querySelector('[data-section-id="themes-palette"] li').textContent, "Palettes");
  assert.deepEqual([...document.querySelectorAll("#shortcut kbd")].map(e => e.textContent), ["⇧", "⇥"]);
  assert.equal(document.querySelector('[data-section-id="accessibility-keyboard-shortcuts-toggle"] p').textContent,
    "将 Copilot 设置为 Interactive、Plan 或 Autopilot 模式。需要启用键盘快捷键。");
  assert.equal(document.querySelector('[data-section-id="voice-mode-input-device"] h2').textContent, "输入设备");
  assert.equal(document.querySelector('[data-section-id="voice-mode-input-device"] p').textContent, "选择语音听写录音时使用的麦克风。");
  assert.equal(document.querySelector('[data-section-id="voice-mode-input-device"] button').textContent, "Personal microphone");
  assert.match(document.querySelector('[aria-label="Computer Use"] > p').textContent, /^计算机使用功能允许/);
  overlay.stop();
  assert.equal(document.querySelector('[data-section-id="themes-mode"] [role=radio]').textContent, "System");
  assert.equal(button.textContent, "global storage location");
  assert.equal(document.getElementById("branch").querySelector("code").textContent, "%username%");
  dom.window.close();
});

test("translates session activity settings while preserving switches and excluding chat activity", async () => {
  const { dom, document } = fixture();
  const page = document.querySelector('[data-settings-scroll][aria-label="Accessibility"]');
  const section = document.createElement("section");
  section.setAttribute("data-section-id", "accessibility-announcements");
  const labels = ["Reasoning", "Tool calls", "Code search", "Reading files", "Creating files", "Editing files",
    "Running CLI commands", "CLI commands finish running", "Changing models and agents", "Compacting the conversation"];
  const translatedLabels = ["推理", "工具调用", "代码搜索", "读取文件", "创建文件", "编辑文件",
    "运行 CLI 命令", "CLI 命令运行完成", "切换模型和代理", "压缩对话上下文"];
  section.innerHTML = `<h2>Session activity announcements</h2><p>Set what types of Copilot activity are announced.</p>${
    labels.map((label, index) => `<div data-settings-row><div><h3>${label}</h3></div>
      <button role="switch" aria-checked="${index % 2 === 0}"><span class="sr-only">${index % 2 === 0 ? "On" : "Off"}</span></button>
      <span data-switch-state-label>${index % 2 === 0 ? "On" : "Off"}</span></div>`).join("")
  }`;
  page.append(section);
  const other = document.createElement("section");
  other.setAttribute("data-section-id", "accessibility-notifications");
  other.innerHTML = '<div data-settings-row><button role="switch" aria-checked="true"><span class="sr-only">On</span></button><span data-switch-state-label>On</span></div>';
  page.append(other);
  document.querySelector("main").textContent = "Reasoning · Thinking… · Thought for 2 seconds · Sent message to user";
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => [...section.querySelectorAll("[data-switch-state-label]")].at(-1).textContent === "关闭");
  assert.equal(section.querySelector("h2").textContent, "会话活动播报");
  assert.equal(section.querySelector("p").textContent, "设置要播报的 Copilot 活动类型。");
  assert.deepEqual([...section.querySelectorAll("h3")].map(node => node.textContent), translatedLabels);
  assert.deepEqual([...section.querySelectorAll("[data-switch-state-label]")].map(node => node.textContent),
    labels.map((_, index) => index % 2 === 0 ? "开启" : "关闭"));
  assert.equal(document.querySelector("main").textContent,
    "Reasoning · Thinking… · Thought for 2 seconds · Sent message to user");
  const heading = section.querySelector("h3");
  heading.firstChild.nodeValue = "Tool calls";
  await waitFor(() => heading.textContent === "工具调用");
  assert.deepEqual([...section.querySelectorAll('[role="switch"]')].map(node => node.getAttribute("aria-checked")),
    labels.map((_, index) => String(index % 2 === 0)));
  other.setAttribute("data-section-id", "unverified-section");
  await waitFor(() => other.querySelector("[data-switch-state-label]").textContent === "On");
  assert.equal(other.querySelector('[role="switch"]').getAttribute("aria-checked"), "true");
  overlay.stop();
  assert.equal(section.querySelector("h2").textContent, "Session activity announcements");
  assert.equal(heading.textContent, "Tool calls");
  assert.equal(other.querySelector("[data-switch-state-label]").textContent, "On");
  dom.window.close();
});

test("reordered split content is restored without undoing host structural changes", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  const root = document.getElementById("worktree");
  const button = root.querySelector("button");
  await waitFor(() => button.textContent === "全局存储位置");
  root.append(root.firstChild);
  await waitFor(() => button.textContent === "global storage location");
  assert.equal(root.lastChild.nodeValue, "Store new worktrees under the");
  overlay.stop();
  dom.window.close();
});

test("activity list subsettings require their heading and exact keys, not synthetic settings-row markup", async () => {
  const keys = ["reasoning", "tool-calls", "code-search", "reading-files", "creating-files", "editing-files",
    "cli-commands", "cli-exit", "model-change", "compaction"];
  const labels = ["Reasoning", "Tool calls", "Code search", "Reading files", "Creating files", "Editing files",
    "Running CLI commands", "CLI commands finish running", "Changing models and agents", "Compacting the conversation"];
  const shortcuts = ["Go back", "Go forward", "Previous session", "Next session", "Previous region", "Next region",
    "Toggle sidebar", "Go to selection actions", "Collapse or expand thinking", "Expand tables", "Previous artifact", "Next artifact"];
  const dom = new JSDOM(`<body><main><p>Reasoning · Collapse or expand thinking · Thinking</p></main><div id="portal-root">
    <div role="dialog" data-settings-dialog-root><section data-settings-scroll="true">
      <section data-section-id="accessibility-announcements"><div><h2 id="fictional-activities">Session activity announcements</h2>
        <p>Set what types of Copilot activity are announced.</p></div><div><ul role="list" aria-labelledby="fictional-activities">
        ${keys.map((key, index) => `<li data-subsetting-id="${key}"><div>${labels[index]}</div>
          <button role="switch" aria-checked="true"><span class="sr-only">On</span></button></li>`).join("")}</ul></div>
        <ul role="list" aria-labelledby="fictional-unrelated"><li data-subsetting-id="reasoning"><div>Reasoning</div></li></ul>
      </section></section><section data-settings-scroll aria-label="Accessibility"><section data-section-id="accessibility-keyboard">
        ${shortcuts.map(label => `<div><span>${label}</span><kbd>Ctrl+F6</kbd></div>`).join("")}
        <div data-user-content><span>Go back</span></div>
      </section></section><h2 id="fictional-unrelated">Fictional heading</h2></div></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const list = document.querySelector('[aria-labelledby="fictional-activities"]');
  await waitFor(() => list.lastElementChild.firstElementChild.textContent === "压缩对话上下文" &&
    list.lastElementChild.querySelector(".sr-only").textContent === "开启");
  assert.deepEqual([...list.querySelectorAll("li > div")].map(node => node.textContent), labels.map(label => dictionary[label]));
  assert.ok([...list.querySelectorAll(".sr-only")].every(node => node.textContent === "开启"));
  assert.ok([...list.querySelectorAll("[role=switch]")].every(node => node.getAttribute("aria-checked") === "true"));
  assert.equal(document.querySelector('[aria-labelledby="fictional-unrelated"] li').textContent, "Reasoning");
  const keyboard = document.querySelector('[data-section-id="accessibility-keyboard"]');
  await waitFor(() => keyboard.children[11].querySelector("span").textContent === "下一个产物");
  assert.deepEqual([...keyboard.querySelectorAll(":scope > div:not([data-user-content]) > span")].map(node => node.textContent),
    shortcuts.map(label => dictionary[label]));
  assert.ok([...keyboard.querySelectorAll("kbd")].every(node => node.textContent === "Ctrl+F6"));
  keyboard.firstElementChild.querySelector("span").firstChild.nodeValue = "On";
  list.firstElementChild.setAttribute("data-subsetting-id", "unverified-subsetting");
  await waitFor(() => list.firstElementChild.firstElementChild.textContent === "Reasoning");
  assert.equal(list.firstElementChild.querySelector(".sr-only").textContent, "On");
  assert.equal(keyboard.firstElementChild.querySelector("span").textContent, "On");
  assert.equal(document.querySelector("main p").textContent, "Reasoning · Collapse or expand thinking · Thinking");
  overlay.stop();
  assert.equal(list.lastElementChild.firstElementChild.textContent, "Compacting the conversation");
  dom.window.close();
});

test("worktree link translation requires the observed component ownership", async () => {
  const { dom, document } = fixture();
  const label = document.querySelector('#worktree [data-component="label"]');
  label.setAttribute("data-component", "other");
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.getElementById("shortcut").textContent.includes("循环切换代理模式"));
  assert.equal(document.getElementById("worktree").textContent,
    "Store new worktrees under the global storage location.");
  assert.equal(label.textContent, "global storage location");
  overlay.stop();
  dom.window.close();
});

test("observed theme radiogroups use section heading ownership without synthetic settings rows", async () => {
  const values = ["system", "light", "dark"];
  const labels = ["System", "Light", "Dark"];
  const group = id => `<div role="radiogroup" aria-labelledby="${id}">${values.map((value, index) =>
    `<button role="radio" data-value="${value}" aria-checked="${index === 0}"><span><span>${labels[index]}</span></span></button>`).join("")}</div>`;
  const dom = new JSDOM(`<body><main><button>Dark</button></main><div id="portal-root">
    <div role="dialog" data-settings-dialog-root><section data-settings-scroll aria-label="Themes">
      <section data-section-id="themes-mode"><div><div data-settings-header="true">
        <h2 id="fictional-app-heading" data-section-heading>Mode</h2><div><div>${group("fictional-app-heading")}</div></div>
      </div></div></section>
      <section data-section-id="themes-terminal"><div><h2 id="fictional-terminal-heading">Terminal appearance</h2>
        <div data-subsetting-id="mode"><div data-settings-header="true"><div>${group("fictional-terminal-heading")}</div></div></div>
        <div>${group("fictional-user-heading")}</div><h2 id="fictional-user-heading">Fictional font</h2>
      </div></section>
    </section></div></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const groups = document.querySelectorAll('[role="radiogroup"]');
  await waitFor(() => groups[1].lastElementChild.textContent === "深色");
  for (const group of [groups[0], groups[1]]) {
    assert.deepEqual([...group.children].map(node => node.textContent), ["系统", "浅色", "深色"]);
    assert.deepEqual([...group.children].map(node => node.getAttribute("aria-checked")), ["true", "false", "false"]);
  }
  assert.deepEqual([...groups[2].children].map(node => node.textContent), labels);
  groups[0].setAttribute("aria-labelledby", "fictional-user-heading");
  groups[1].firstElementChild.setAttribute("data-value", "fictional-user-value");
  await waitFor(() => groups[0].lastElementChild.textContent === "Dark" &&
    groups[1].firstElementChild.textContent === "System");
  assert.equal(document.querySelector("main button").textContent, "Dark");
  overlay.stop();
  assert.deepEqual([...groups[1].children].map(node => node.textContent), labels);
  dom.window.close();
});

test("real Accessibility shortcut action paragraphs translate inside buttons without translating binding values", async () => {
  const labels = ["Command palette", "Find previous match", "Go back", "Add repositories", "Save widget repositories",
    "Toggle Pick & Polish", "Open plan panel", "Attach selection to prompt with comment"];
  const dom = new JSDOM(`<body><main><p>Command palette</p></main><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll aria-label="Accessibility"><section data-section-id="accessibility-keyboard"><div><div>
    <ul role="list">${labels.map((label,index) => `<li><div>${index % 2 ? `<div><p>${label}</p></div>` :
        `<button><p>${label}</p></button>`}<kbd>Ctrl+F6</kbd></div></li>`).join("")}
        <li><div><p>High</p><span>New chat</span></div></li>
        <li data-user-content><button><p>Open settings</p></button></li>
    </ul></div></div><div><div><div><div><div><button><p>Activate voice transcription</p></button></div></div></div></div></div>
      <div id="shortcut-announce-polite">Go back</div><div id="shortcut-announce-assertive">Command palette</div>
    </section></section></div></div></body>`);
  const { document } = dom.window;
  const section = document.querySelector("[data-section-id]");
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => section.querySelector("li:nth-child(8) p").textContent === dictionary[labels[7]] &&
    [...section.querySelectorAll("p")].some(node => node.textContent === "启动语音转录"));
  assert.deepEqual([...section.querySelectorAll("li p")].slice(0, labels.length).map(node => node.textContent),
    labels.map(label => dictionary[label]));
  assert.equal(section.querySelector("li:nth-child(9)").textContent, "HighNew chat");
  assert.equal(section.querySelector("li[data-user-content] p").textContent, "Open settings");
  assert.ok([...section.querySelectorAll("kbd")].every(node => node.textContent === "Ctrl+F6"));
  assert.equal(document.querySelector("main p").textContent, "Command palette");
  assert.equal(document.getElementById("shortcut-announce-polite").textContent, "Go back");
  assert.equal(document.getElementById("shortcut-announce-assertive").textContent, "Command palette");
  section.setAttribute("data-section-id", "fictional-user-shortcuts");
  await waitFor(() => section.querySelector("li p").textContent === "Command palette");
  overlay.stop();
  dom.window.close();
});

test("dictation Auto maps only its owned label and leaves language values and model names unchanged", async () => {
  const description = "Choose a language or use Auto to detect it. Applies to your next recording.";
  const microphone = "Allow desktop apps to access your microphone in Settings.";
  const dom = new JSDOM(`<body><main><p>Auto</p></main><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll aria-label="Voice">
      <section data-section-id="voice-mode-language"><div data-settings-header="true"><div>
        <h2>Dictation language</h2><p id="fictional-language-description">${description}</p>
      </div></div><button id="fictional-language-trigger" aria-haspopup="dialog" aria-expanded="false" data-value="auto">
        <span data-component="content"><span data-component="label">Auto</span>
        <span data-component="trailingVisual" aria-hidden="true">Auto</span></span>
      </button></section>
      <section data-section-id="voice-mode-input-device"><div><div data-settings-row="true" data-subsetting-id="microphone-permissions">
        <div><p><span>${microphone}</span></p></div>
      </div></div></section>
      <section data-section-id="voice-mode-models"><div><h2>Auto</h2><p>Auto</p></div></section>
    </section></div><div role="dialog" id="fictional-language-popup"><span>Auto</span></div></div></body>`);
  const { document } = dom.window;
  const trigger = document.getElementById("fictional-language-trigger");
  const label = trigger.querySelector('[data-component="label"]');
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => label.textContent === "自动" && document.querySelector('[data-subsetting-id] span').textContent === dictionary[microphone]);
  assert.equal(document.querySelector('[data-section-id="voice-mode-language"] h2').textContent, "听写语言");
  assert.equal(document.getElementById("fictional-language-description").textContent, dictionary[description]);
  assert.equal(trigger.getAttribute("data-value"), "auto");
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(trigger.querySelector('[data-component="trailingVisual"]').textContent, "Auto");
  assert.equal(document.querySelector('[data-section-id="voice-mode-models"] h2').textContent, "Auto");
  assert.equal(document.querySelector("main p").textContent, "Auto");
  assert.equal(document.getElementById("fictional-language-popup").textContent, "Auto");
  label.firstChild.nodeValue = "English";
  await waitFor(() => label.textContent === "English");
  overlay.stop();
  assert.equal(label.textContent, "English");
  assert.equal(document.querySelector('[data-subsetting-id] span').textContent, microphone);
  dom.window.close();
});

test("repository Settings translate fixed controls while preserving repository values and dynamic policy data", async () => {
  const placeholder = "e.g., Use pnpm, not npm. Prefix branch names with feat/ or fix/. Run lint before committing.";
  const dom = new JSDOM(`<body><main><p>Merge commit</p></main><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll="true" aria-label="Repositories">
      <section data-section-id="project-copilot-account"><div data-settings-header><div>
        <h2 data-section-heading>Copilot account</h2><p>Account that provides Copilot and pays for usage. Change this when your Copilot seat is on a different account than your repositories.</p>
      </div></div></section>
      <section data-section-id="project-sidebar"><div data-settings-header><div>
        <h2 data-section-heading>Show in sidebar</h2><p>Show this repository and its sessions in the sidebar.</p>
      </div></div></section>
      <section data-section-id="project-code-search"><div data-settings-header><div>
        <h2 data-section-heading>Remote index</h2><p>GitHub's code search index for this repository. Agents use it for full-text and semantic search.</p>
        <div><div><span>Full text</span><span>Semantic</span></div></div>
      </div></div></section>
      <section data-section-id="project-repository-configuration"><div><div><div data-settings-header><div>
        <h2 data-section-heading>Repository configuration</h2>
        <div data-testid="repo-config-host-local"><p><span>Current and future configuration, hooks, and extensions can run code without review across all repository environments.</span><span> Revoking app trust does not revoke plugin or MCP server folder trust, even for new sessions.</span></p>
          <span>Repository trusted</span><button>Revoke all trust</button><button>Create config file</button></div>
      </div></div></div></div><p>Add a <code>.worktreeinclude</code> file to the repo root to auto-copy gitignored files into new worktrees.</p></section>
      <div><section data-section-id="project-sandbox-policy"><div data-settings-header><div>
        <h2 data-section-heading>Sandbox</h2><p>Configure the local sandbox for sessions in this repository.</p>
      </div></div><div>
        <div data-settings-row="true" data-subsetting-id="sandbox-new-sessions"><div><h3>Sandbox new sessions</h3><p>Request sandboxing by default when a new local session starts.</p></div><span data-switch-state-label="true">On</span></div>
        <div><h3>Configured policy summary</h3><ul>
          <li>Workspace and current working directory: Read/write</li>
          <li id="fictional-additional-folders"></li>
          <li id="fictional-network"></li>
          <li id="fictional-credentials"></li>
        </ul></div>
        <div><div data-settings-row="true" data-subsetting-id="additional-read-write"><div><h3>Additional read/write</h3><p>Folders the sandbox may read and modify.</p></div><div><button><span data-component="content"><span data-component="label">Add folder</span></span></button></div></div><p>No additional folders.</p></div>
        <div><div data-settings-row="true" data-subsetting-id="additional-read-only"><div><h3>Additional read-only</h3><p>Folders the sandbox may read but not modify.</p></div><div><button><span data-component="content"><span data-component="label">Add folder</span></span></button></div></div><p>No additional folders.</p></div>
        <div><div data-settings-row="true" data-subsetting-id="denied-folders"><div><h3>Denied</h3><p>Folders the sandbox cannot access. A more-specific denied subfolder remains denied.</p></div><div><button><span data-component="content"><span data-component="label">Add folder</span></span></button></div></div><p>No additional folders.</p></div>
        <div><div data-settings-row="true" data-subsetting-id="outbound-internet"><div><h3>Outbound internet</h3><p>Allow connections to internet services such as GitHub and package registries.</p></div><div></div></div></div>
        <div><div data-settings-row="true" data-subsetting-id="local-network"><div><h3>Local network</h3><p>Allow loopback and local-network connections, including local development servers.</p></div><div></div></div></div>
        <div><div data-settings-row="true" data-subsetting-id="git-credentials"><div><h3>Git credentials</h3><p>Allow authenticated HTTPS Git operations inside the sandbox.</p></div><div></div></div></div>
        <div><div data-settings-row="true" data-subsetting-id="github-cli-credentials"><div><h3>GitHub CLI credentials</h3><p>Allow the GitHub CLI to authenticate inside the sandbox.</p></div><div></div></div></div>
        <p>Runtime and managed constraints may further restrict the effective policy. Changes apply to new sessions and after a session restarts; they do not change a currently running session.</p>
      </div>
      </section></div>
      <section data-section-id="project-instructions">
        <h2 id="fictional-instructions-heading" data-section-heading>Instructions</h2><p id="fictional-instructions-description">Per-repository instructions added to every session, alongside global ones.</p><textarea aria-labelledby="fictional-instructions-heading" aria-describedby="fictional-instructions-description" placeholder="${placeholder}">fictional draft</textarea></section>
      <section data-section-id="project-default-branch"><div><div><h2 data-section-heading>Default branch</h2><p>New sessions will branch off from this branch by default.</p></div></div><p>fictional-user-branch</p><div data-user-content>C:\\fictional\\private</div></section>
      <section data-section-id="project-branch-prefix"><div><div><h2 id="project-branch-prefix-heading" data-section-heading>Branch prefix override</h2><p>Use a custom branch prefix for this repository.</p></div></div><p id="fictional-branch-prefix-preview">Preview: <span>fictional-user-branch</span></p><input value="%username%-"></section>
      <section data-section-id="project-branch-update-strategy"><div data-settings-header><div>
        <h2 id="fictional-strategy-heading">Branch update strategy</h2><p id="fictional-strategy-description">Choose how session branches incorporate incoming changes. Used for subsequent branch updates.</p>
        <div role="radiogroup" aria-labelledby="fictional-strategy-heading" aria-describedby="fictional-strategy-description">
          <button role="radio" aria-describedby="fictional-strategy-description"><span><span>Merge commit</span></span></button>
          <button role="radio" aria-describedby="fictional-strategy-description"><span><span>Rebase</span></span></button>
        </div>
      </div></div></section>
      <section data-section-id="project-reusable-worktrees"><div data-settings-header><div>
        <h2 data-section-heading>Reusable worktree</h2><p>After you use a worktree session, Copilot keeps one sanitized worktree ready for the next session.</p>
      </div></div><div data-settings-row="true"><div><button><span data-component="label"><span data-component="content">Clear reusable worktree</span></span></button></div></div><p>Estimated 8 GB</p></section>
      <section data-section-id="project-github-account"><div><div><h2>GitHub Account</h2><p>Account this repository bills to and uses for API calls and agent tools.</p></div><p>Fictional account name</p></div></section>
      <section data-section-id="project-scripts"><div><div><h2>Scripts</h2><p>Commands that run during workspace lifecycle events.</p></div><div><button><span data-component="content"><span data-component="label">Add script</span></span></button></div></div><ul><li>Fictional user command</li></ul></section>
      <section data-section-id="project-server-ready-pattern"><h2 data-section-heading="true"><label for="project-server-ready-pattern">Server ready pattern</label></h2><p id="fictional-server-ready-description"></p><input id="project-server-ready-pattern" aria-describedby="fictional-server-ready-description" value="fictional-pattern"></section>
      <section data-section-id="project-sparse-checkout"><div><div><h2>Worktree sparse-checkout</h2><p>Limit which directories are checked out in new session worktrees (requires git 2.27+).</p></div></div><div><div role="radiogroup">
        <button role="radio" aria-describedby="sparse-exclude"><span><span>Exclude</span></span></button><span id="sparse-exclude">Check out everything except the listed directories.</span>
        <button role="radio" aria-describedby="sparse-include"><span><span>Include only</span></span></button><span id="sparse-include">Check out only the listed directories.</span>
      </div></div><div><div><h3>Wait for checkout on new sessions</h3><p>Hold a new session's first turn until its worktree is checked out, so repository configuration, hooks, extensions, canvases, and language-server configuration are available. Setup scripts still run asynchronously. This can be slow on large repositories.</p></div><span data-switch-state-label="true">Off</span></div></section>
      <section data-section-id="project-automation"><div><h2>Automation</h2><p>Configure repository-level automation defaults.</p></div><div><div><div><p>Auto-start issue sessions</p><p>Start a session with issue context automatically.</p></div><span data-switch-state-label="true">Off</span></div></div></section>
      <section data-section-id="project-removal"><div><div><h2 data-section-heading="true">Remove repository</h2></div><button><span data-component="content"><span data-component="label">Remove repository</span></span></button><p></p></div></section>
      <section data-section-id="project-mcp" data-testid="project-mcp-section">
        <div data-settings-header><div><h2>Repository customizations</h2><p>Folder trust for repository plugins, hooks, and MCP servers.</p></div></div>
        <div><div data-settings-row="true"><div><h3>MCP servers</h3><p>Servers defined by this repository in .mcp.json or .github/mcp.json. Refresh reloads repository MCP servers, not plugins.</p></div><div><button aria-describedby="refresh-tip" data-trigger-disabled><span data-component="content"><span data-component="label">Refresh</span></span></button></div></div></div>
        <div><div><div><div><svg></svg></div><div>No repository MCP servers</div><div>Add servers to .mcp.json or .github/mcp.json, then refresh.</div></div></div></div>
        <div data-testid="project-plugins"><div data-settings-row="true"><div><h3>Plugins</h3><p>Plugins and marketplaces effective for this repository, including ones inherited from your user settings and organization. Status reflects configuration, not whether a plugin started.</p></div></div><div></div><div><h4>Marketplaces</h4><ul><li>Fictional marketplace value</li></ul></div></div>
        <div data-testid="project-mcp-refresh-announce"></div>
      </section>
      <section data-section-id="accessibility-keyboard">      <div><div><ul role="list">
        <li><div><div><div><button id="fictional-assign" data-base-ui-tooltip-trigger><span>Assign…</span><kbd>Ctrl+A</kbd></button></div></div></div></li>
      </ul></div></div><div><div><div><div><div><button><p>Activate voice transcription</p></button></div></div></div></div></div></section>
    </section>
  </div></div></body>`);
  const { document } = dom.window;
  const additionalFolders = document.getElementById("fictional-additional-folders");
  for (const part of ["Additional folders: ", "12", " read/write,", " ", "4", " read-only,", " ", "2", " denied"]) {
    additionalFolders.append(document.createTextNode(part));
  }
  const configSentence = document.querySelector('[data-section-id="project-repository-configuration"] > p');
  const configCode = configSentence.querySelector("code");
  configSentence.replaceChildren(document.createTextNode("Add a"), document.createTextNode(" "),
    configCode, document.createTextNode(" "),
    document.createTextNode("file to the repo root to auto-copy gitignored files into new worktrees."));
  for (const [id, parts] of [
    ["fictional-network", ["Network:", " ", "Internet allowed", " · ", "Local network allowed"]],
    ["fictional-credentials", ["Credentials: Git", " ", "allowed", " · ", "GitHub CLI", " ", "allowed"]]
  ]) {
    const item = document.getElementById(id);
    for (const part of parts) item.append(document.createTextNode(part));
    assert.deepEqual([...item.childNodes].map(node => node.nodeValue), parts);
  }
  const serverPattern = document.querySelector('[data-section-id="project-server-ready-pattern"] > p');
  const exampleCode = document.createElement("code");
  exampleCode.textContent = "serverReadyAction.pattern";
  for (const child of [
    document.createTextNode("Regex used to detect a dev server URL in Run output. Matches VS Code's"),
    document.createTextNode(" "), exampleCode,
    document.createTextNode(". Clear the field and save to go back to the default detector.")
  ]) serverPattern.append(child);
  const serverReadyInput = document.getElementById("project-server-ready-pattern");
  serverReadyInput.value = "fictional-user-pattern";
  const removalParagraph = document.querySelector('[data-section-id="project-removal"] p');
  const removalName = "fixture-only-repository";
  const removalPrefix = "Removes ";
  const removalSuffix = " from the sidebar. The repository on your machine stays, but session worktrees are deleted and recovering uncommitted work from them is manual.";
  const removalTail = "Its sessions, including ones started in Copilot CLI, are permanently deleted with their history. This can't be undone.";
  removalParagraph.replaceChildren(
    document.createTextNode(`${removalPrefix}${removalName}${removalSuffix}`),
    document.createTextNode(" "),
    document.createTextNode(removalTail)
  );
  const removalNodes = [...removalParagraph.childNodes];
  const overlay = startSettingsTranslation(document, dictionary);
  const userText = document.querySelector('[data-section-id="project-default-branch"] > p');
  const textarea = document.querySelector("textarea");
  const userBranch = document.querySelector("#fictional-branch-prefix-preview span");
  await waitFor(() => document.querySelector('[data-section-id="project-reusable-worktrees"] h2').textContent === "可复用工作树" &&
    document.getElementById("fictional-assign").querySelector("span").textContent === "分配…" &&
    document.querySelector('[data-section-id="accessibility-keyboard"] p').textContent === "启动语音转录" &&
    textarea.getAttribute("placeholder") === dictionary[placeholder]);
  await waitFor(() => [...document.querySelectorAll('[data-section-id="project-sandbox-policy"] h3')]
    .some(node => node.textContent === "其他可读写文件夹"));
  await waitFor(() => document.getElementById("fictional-network").textContent ===
    dictionary["Network: Internet allowed · Local network allowed"]);
  await waitFor(() => document.querySelector('[data-section-id="project-sparse-checkout"] h2').textContent === "工作树稀疏检出");
  assert.equal(document.querySelector('[data-section-id="project-copilot-account"] h2').textContent, "Copilot 账户");
  assert.equal(document.querySelector('[data-section-id="project-code-search"] h2').textContent, "远程索引");
  assert.deepEqual([...document.querySelector('[data-section-id="project-code-search"]').querySelectorAll("span")].map(node => node.textContent),
    ["全文", "语义"]);
  assert.equal(document.querySelector('[data-testid="repo-config-host-local"] button').textContent, "撤销全部信任");
  assert.equal(document.querySelector('[data-testid="repo-config-host-local"] p').textContent,
    dictionary["Current and future configuration, hooks, and extensions can run code without review across all repository environments."] +
      " " + dictionary["Revoking app trust does not revoke plugin or MCP server folder trust, even for new sessions."]);
  assert.equal(document.querySelector('[data-section-id="project-repository-configuration"] code').textContent, ".worktreeinclude");
  assert.equal(configSentence.textContent,
    "在仓库根目录添加 .worktreeinclude 文件，以自动将被 gitignore 忽略的文件复制到新工作树。");
  assert.equal(configSentence.querySelector("code").textContent, ".worktreeinclude");
  assert.equal(document.querySelector('[data-section-id="project-sandbox-policy"] li:first-child').textContent,
    "工作区和当前工作目录：可读写");
  assert.equal(document.querySelector('[data-section-id="project-sandbox-policy"] li:nth-child(3)').textContent,
    dictionary["Network: Internet allowed · Local network allowed"]);
  assert.equal(document.querySelector('[data-section-id="project-sandbox-policy"] li:nth-child(4)').textContent,
    dictionary["Credentials: Git allowed · GitHub CLI allowed"]);
  assert.equal(serverReadyInput.value, "fictional-user-pattern");
  assert.equal(document.querySelector('[data-subsetting-id="additional-read-write"] h3').textContent, "其他可读写文件夹");
  assert.equal(document.querySelector('[data-subsetting-id="additional-read-write"] p').textContent,
    "沙盒可读取和修改的文件夹。");
  assert.equal(document.querySelector('[data-subsetting-id="additional-read-only"] p').textContent,
    "沙盒可读取但不能修改的文件夹。");
  assert.equal(document.querySelector('[data-subsetting-id="denied-folders"] h3').textContent, "拒绝访问");
  assert.equal(document.querySelector('[data-subsetting-id="outbound-internet"] h3').textContent, "出站互联网");
  assert.equal(document.querySelector('[data-subsetting-id="local-network"] p').textContent,
    "允许环回和本地网络连接，包括本地开发服务器。");
  assert.equal(document.querySelector('[data-subsetting-id="git-credentials"] h3').textContent, "Git 凭据");
  assert.equal(document.querySelector('[data-subsetting-id="github-cli-credentials"] h3').textContent, "GitHub CLI 凭据");
  assert.equal(document.querySelector('[data-section-id="project-sandbox-policy"] > div:last-child > p:last-child').textContent,
    dictionary["Runtime and managed constraints may further restrict the effective policy. Changes apply to new sessions and after a session restarts; they do not change a currently running session."]);
  assert.deepEqual([...document.querySelectorAll('[data-section-id="project-sandbox-policy"] button [data-component="content"]')]
    .map(node => node.textContent), ["添加文件夹", "添加文件夹", "添加文件夹"]);
  assert.equal(document.querySelector('[data-subsetting-id="additional-read-write"] + p').textContent, "没有其他文件夹。");
  assert.equal(document.querySelector('[data-section-id="project-default-branch"] [data-user-content]').textContent,
    "C:\\fictional\\private");
  assert.equal(document.querySelector('[data-section-id="project-github-account"] > div > p').textContent, "Fictional account name");
  assert.equal(document.querySelector('[data-section-id="project-github-account"] h2').textContent, "GitHub 账户");
  assert.equal(document.querySelector('[data-section-id="project-instructions"] h2').textContent, "指令");
  assert.equal(document.querySelector('[data-section-id="project-instructions"] p').textContent,
    "与全局指令一起添加到每个会话的仓库专属指令。");
  assert.equal(document.querySelector('[data-section-id="project-scripts"] h2').textContent, "脚本");
  assert.equal(document.querySelector('[data-section-id="project-scripts"] button').textContent, "添加脚本");
  assert.equal(document.querySelector('[data-section-id="project-scripts"] ul').textContent, "Fictional user command");
  assert.equal(document.querySelector('[data-section-id="project-server-ready-pattern"] label').textContent, "服务器就绪模式");
  assert.equal(document.querySelector('[data-section-id="project-server-ready-pattern"] h2').textContent, "服务器就绪模式");
  assert.equal(serverPattern.textContent, "用于检测运行输出中开发服务器 URL 的正则表达式。与 VS Code 的 serverReadyAction.pattern。清空字段并保存即可恢复默认检测器。");
  assert.equal(exampleCode.textContent, "serverReadyAction.pattern");
  assert.equal(serverReadyInput.value, "fictional-user-pattern");
  assert.deepEqual([...document.querySelectorAll('[data-section-id="project-sparse-checkout"] [role="radiogroup"] > :is(button,span)')]
    .map(node => node.textContent), ["排除", "检出除所列目录外的所有内容。", "仅包含", "仅检出所列目录。"]);
  assert.equal(document.querySelector('[data-section-id="project-sparse-checkout"] h3').textContent, "新会话等待检出完成");
  assert.equal(document.querySelector('[data-section-id="project-automation"] h2').textContent, "自动化");
  assert.deepEqual([...document.querySelectorAll('[data-section-id="project-automation"] p')].map(node => node.textContent),
    ["配置仓库级自动化默认设置。", "自动启动议题会话", "自动使用议题上下文启动会话。"]);
  assert.equal(document.querySelector('[data-section-id="project-removal"] button').textContent, "移除仓库");
  assert.equal(removalNodes[0].nodeValue,
    `${dictionary[removalPrefix]}${removalName}${dictionary[removalSuffix]}`);
  assert.equal(removalNodes[1].nodeValue, " ");
  assert.equal(removalNodes[2].nodeValue, dictionary[removalTail]);
  assert.equal(document.querySelector('[data-testid="project-mcp-section"] h2').textContent, "仓库自定义");
  assert.equal(document.querySelector('[data-testid="project-mcp-section"] p').textContent,
    "仓库插件、钩子和 MCP 服务器的文件夹信任。");
  assert.equal(document.querySelector('[data-testid="project-mcp-section"] [data-settings-row] h3').textContent, "MCP 服务器");
  assert.equal(document.querySelector('[data-testid="project-mcp-section"] [data-settings-row] p').textContent,
    "此仓库在 .mcp.json 或 .github/mcp.json 中定义的服务器。“刷新”会重新加载仓库 MCP 服务器，不会重新加载插件。");
  assert.equal(document.querySelector('[data-testid="project-mcp-section"] button').textContent, "刷新");
  assert.equal(document.querySelector('div[data-testid="project-plugins"] h3').textContent, "插件");
  assert.equal(document.querySelector('div[data-testid="project-plugins"] p').textContent,
    dictionary["Plugins and marketplaces effective for this repository, including ones inherited from your user settings and organization. Status reflects configuration, not whether a plugin started."]);
  assert.equal(document.querySelector('div[data-testid="project-plugins"] h4').textContent, "市场");
  assert.equal(document.querySelector('div[data-testid="project-plugins"] ul').textContent, "Fictional marketplace value");
  assert.equal(document.querySelector('[data-testid="project-mcp-section"] > div:nth-child(3) > div > div > div:nth-child(2)').textContent,
    dictionary["No repository MCP servers"]);
  assert.equal(document.querySelector('[data-testid="project-mcp-section"] > div:nth-child(3) > div > div > div:nth-child(3)').textContent,
    dictionary["Add servers to .mcp.json or .github/mcp.json, then refresh."]);
  removalParagraph.setAttribute("title", "synthetic ownership-change trigger");
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(removalNodes[0].nodeValue.startsWith(dictionary[removalPrefix]), true);
  assert.equal(removalNodes[2].nodeValue, dictionary[removalTail]);
  const updatedRemovalCopy = " Updated fixed copy with a synthetic repository value.";
  removalNodes[0].nodeValue = `${removalPrefix}${removalName}${updatedRemovalCopy}`;
  await waitFor(() => removalNodes[0].nodeValue ===
    `${dictionary[removalPrefix]}${removalName}${updatedRemovalCopy}`);
  assert.equal(removalNodes[0].nodeValue.includes(removalName), true);
  removalNodes[0].nodeValue = `${removalPrefix}${removalName}${removalSuffix}`;
  await waitFor(() => removalNodes[0].nodeValue ===
    `${dictionary[removalPrefix]}${removalName}${dictionary[removalSuffix]}`);
  const policyNodes = [...additionalFolders.childNodes];
  assert.deepEqual(policyNodes.map(node => node.nodeValue),
    ["其他文件夹：", "12", " 可读写，", " ", "4", " 只读，", " ", "2", " 禁止访问"]);
  policyNodes[0].nodeValue = "Additional folders: ";
  await waitFor(() => policyNodes[0].nodeValue === "其他文件夹：");
  const scansBeforeCountUpdate = overlay.stats.settingsScans;
  policyNodes[1].nodeValue = "13";
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(policyNodes[1].nodeValue, "13");
  assert.equal(overlay.stats.settingsScans, scansBeforeCountUpdate);
  assert.equal(textarea.getAttribute("placeholder"), dictionary[placeholder]);
  assert.equal(textarea.value, "fictional draft");
  assert.equal(userBranch.textContent, "fictional-user-branch");
  assert.equal(document.querySelector("#fictional-branch-prefix-preview").firstChild.nodeValue, "预览： ");
  assert.equal(document.querySelector('[data-section-id="project-branch-update-strategy"] [role=radio]').textContent, "合并提交");
  assert.equal(document.querySelector('[data-section-id="project-branch-update-strategy"] [role=radio] + button').textContent, "变基");
  assert.equal(document.querySelector('[data-section-id="project-reusable-worktrees"] > p').textContent, "Estimated 8 GB");
  assert.equal(document.getElementById("fictional-assign").querySelector("kbd").textContent, "Ctrl+A");
  assert.equal(document.querySelector("main p").textContent, "Merge commit");
  overlay.stop();
  assert.deepEqual(policyNodes.map(node => node.nodeValue),
    ["Additional folders: ", "13", " read/write,", " ", "4", " read-only,", " ", "2", " denied"]);
  assert.equal(document.querySelector('[data-subsetting-id="additional-read-write"] h3').textContent,
    "Additional read/write");
  assert.equal(document.querySelector('[data-subsetting-id="additional-read-write"] p').textContent,
    "Folders the sandbox may read and modify.");
  assert.equal(document.querySelector('[data-subsetting-id="additional-read-write"] button [data-component="content"]').textContent,
    "Add folder");
  assert.equal(textarea.getAttribute("placeholder"), placeholder);
  assert.deepEqual(removalNodes.map(node => node.nodeValue), [
    `${removalPrefix}${removalName}${removalSuffix}`, " ", removalTail
  ]);
  assert.equal(serverReadyInput.value, "fictional-user-pattern");
  dom.window.close();
});

test("native removal notice translates only bounded fixed text without reading the repository name", async () => {
  const prefix = "Removes ";
  const suffix = " from the sidebar. The repository on your machine stays, but session worktrees are deleted and recovering uncommitted work from them is manual.";
  const tail = "Its sessions, including ones started in Copilot CLI, are permanently deleted with their history. This can't be undone.";
  const dom = new JSDOM(`<body><main><p>Thinking</p></main><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll aria-label="Repository"><section data-section-id="project-removal"><div>
      <div><h2 data-section-heading="true">Remove repository</h2><p></p></div><button>Remove repository</button>
    </div></section></section></div></div></body>`);
  const { document } = dom.window;
  const paragraph = document.querySelector('[data-section-id="project-removal"] p');
  const mixed = document.createTextNode(`${prefix}private-fixture${suffix}`);
  const space = document.createTextNode(" ");
  const ending = document.createTextNode(tail);
  paragraph.append(mixed, space, ending);
  let forbiddenReads = 0;
  Object.defineProperty(mixed, "nodeValue", {
    configurable: true, get() { forbiddenReads++; throw new Error("Opaque repository must not be read"); },
    set() { throw new Error("Opaque repository must not be rewritten as a whole"); }
  });
  const overlay = startSettingsTranslation(document, dictionary);
  const value = () => Object.getOwnPropertyDescriptor(dom.window.Node.prototype, "nodeValue").get.call(mixed);
  await waitFor(() => value() === `${dictionary[prefix]}private-fixture${dictionary[suffix]}` &&
    ending.nodeValue === dictionary[tail]);
  assert.equal(forbiddenReads, 0);
  assert.equal(space.nodeValue, " ");
  const setter = Object.getOwnPropertyDescriptor(dom.window.Node.prototype, "nodeValue").set;
  setter.call(mixed, `${prefix}new-private-fixture${suffix}`);
  await waitFor(() => value() === `${dictionary[prefix]}new-private-fixture${dictionary[suffix]}`);
  assert.equal(forbiddenReads, 0);
  overlay.stop();
  assert.equal(value(), `${prefix}new-private-fixture${suffix}`);
  assert.equal(ending.nodeValue, tail);
  assert.equal(forbiddenReads, 0);
  dom.window.close();
});

test("account settings translate only card-owned fixed leaves and retain identity and dynamic credit values", async () => {
  const creditsDescription = "AI credits are consumed based on model and token usage.";
  const dom = new JSDOM(`<body><main><p>AI credits</p></main><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll aria-label="Accounts"><h2 id="fictional-accounts-heading">Accounts</h2>
      <ul role="list" aria-labelledby="fictional-accounts-heading"><li><div data-testid="github-account-card-fictional-id">
        <div><div><section>
          <h3>Plan</h3><span>Copilot Max</span><h3>Additional usage disabled</h3>
          <p>AI credits are consumed based on model and token usage.</p>
          <p><a>Enable additional usage</a> to continue after plan credits run out.</p>
          <div><div><div><span><span>AI credits</span><span>resets in 12 days · 73%</span></span></div></div></div>
        </section><div><div><p>Fictional account name</p><span>Default</span></div></div></div></div>
      </div></li></ul></section>
      <section data-section-id="account-separate-copilot"><div data-settings-header><div>
        <h2>Separate Copilot account</h2><p>Let a repository run Copilot in local sessions on a different account than the one it uses for GitHub, and pick that account in repository settings.</p>
        <span data-switch-state-label="true">On</span>
      </div></div></section>
    </div></div></body>`);
  const { document } = dom.window;
  const card = document.querySelector('[data-testid^="github-account-card-"]');
  const badgeParent = card.children[0].children[0].children[1].children[0];
  const accountName = badgeParent.children[0];
  let accountNameReads = 0;
  const accountNameText = accountName.textContent;
  Object.defineProperty(accountName, "textContent", { get() { accountNameReads++; return accountNameText; } });
  const overlay = startSettingsTranslation(document, dictionary);
  const badge = badgeParent.children[1];
  const credits = card.querySelector("section div div div span span");
  const dynamicCredits = credits.nextElementSibling;
  await new Promise(resolve => setTimeout(resolve, 50));
  await waitFor(() => card.querySelector("h3").textContent === "套餐" &&
    card.querySelector('[data-testid^="github-account-card-"] section div div div span span').textContent === "AI 点数" &&
    document.querySelector('[data-section-id="account-separate-copilot"] h2').textContent === "独立 Copilot 账户" &&
    card.querySelector("section p").textContent === dictionary[creditsDescription] &&
    document.querySelector('[data-section-id="account-separate-copilot"] [data-switch-state-label]')?.textContent === "开启");
  assert.equal(card.querySelector("section > span").textContent, "Copilot Max");
  assert.equal(card.querySelector("section p").textContent, dictionary[creditsDescription]);
  assert.equal(card.querySelector("section p + p").textContent, "启用额外用量，以便在套餐点数用完后继续使用。");
  assert.equal(accountName.firstChild.nodeValue, "Fictional account name");
  assert.equal(badge.textContent, "默认");
  assert.equal(dynamicCredits.textContent, "resets in 12 days · 73%");
  assert.equal(accountNameReads, 0);
  assert.equal(document.querySelector('[data-section-id="account-separate-copilot"] [data-switch-state-label]').textContent, "开启");
  assert.equal(document.querySelector("main p").textContent, "AI credits");
  overlay.stop();
  assert.equal(badge.textContent, "Default");
  assert.equal(document.querySelector('[data-section-id="account-separate-copilot"] [data-switch-state-label]').textContent, "On");
  dom.window.close();
});

test("color filter child page, linked options, and embedded preview translate only fixed labels", async () => {
  const dom = new JSDOM(`<body><main><p>No adjustment</p><p>Color filters</p><pre>function getStatus() { return "Open"; }</pre></main><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <nav aria-label="Breadcrumb"><button>Accessibility</button><span>/</span><h1>Color filters</h1></nav>
    <section data-settings-scroll="true" aria-label="Accessibility">
      <section><div data-settings-header><div><h2 id="fictional-filter-title">Color filter</h2>
        <p id="fictional-filter-description">Makes colors easier to distinguish with color blindness.</p></div>
        <button id="fictional-filter-trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false"
          aria-describedby="fictional-filter-description fictional-filter-help" aria-controls="fictional-filter-trigger-list">
          <span>No adjustment</span></button></div></section>
      <section><div data-settings-header><div><h2>High contrast</h2>
        <p>Strengthen text, borders, and controls.</p></div></div></section>
      <section><div data-settings-header><div><h2 id="fictional-mode-title">Mode</h2>
        <p id="fictional-mode-description">Light or dark appearance.</p></div>
        <div role="radiogroup" aria-describedby="fictional-mode-description">
          <button role="radio" data-value="system"><span>System</span></button>
          <button role="radio" data-value="light"><span>Light</span></button>
          <button role="radio" data-value="dark"><span>Dark</span></button>
        </div></div></section>
      <section><div data-settings-header><div><h2>Palette</h2></div></div></section>
      <section><h2>Preview</h2><div></div></section>
      <p>Fictional repository name</p>
    </section>
  </div></div></body>`, { pretendToBeVisual: true });
  const { document } = dom.window;
  const previewFrame = document.createElement("iframe");
  previewFrame.title = "Color sample preview";
  previewFrame.tabIndex = -1;
  document.querySelector('[data-settings-scroll] section:last-of-type > div').append(previewFrame);
  previewFrame.contentDocument.body.innerHTML = `<main data-theme-preview-content><div>
    <section aria-labelledby="fictional-preview-heading"><h2 id="fictional-preview-heading">Pull requests</h2><ul>
      ${["Open", "Closed", "Merged", "Draft", "Queued"].map(status => `<li><span><span>${status}</span></span></li>`).join("")}
    </ul></section>
  </div></main>`;
  const previewLabels = [...previewFrame.contentDocument.querySelectorAll("ul > li > span > span")];
  const trigger = document.getElementById("fictional-filter-trigger");
  const portalRoot = document.getElementById("portal-root");
  trigger.setAttribute("aria-controls", "fictional-color-listbox");
  const outerPortal = document.createElement("div");
  outerPortal.setAttribute("data-base-ui-portal", "");
  const innerPortal = document.createElement("div");
  innerPortal.setAttribute("data-base-ui-portal", "");
  const secondPresentation = document.createElement("div");
  secondPresentation.setAttribute("role", "presentation");
  secondPresentation.setAttribute("data-open", "");
  const firstPresentation = document.createElement("div");
  firstPresentation.setAttribute("role", "presentation");
  firstPresentation.setAttribute("data-open", "");
  const popup = document.createElement("div");
  popup.id = "fictional-color-listbox";
  popup.setAttribute("role", "listbox");
  popup.setAttribute("aria-labelledby", "fictional-filter-title");
  const option = (title, description, id) => {
    const item = document.createElement("div");
    item.setAttribute("role", "option");
    const label = document.createElement("span");
    label.id = `${id}-title`;
    label.textContent = title;
    const detail = document.createElement("p");
    detail.id = `${id}-description`;
    detail.textContent = description;
    item.setAttribute("aria-labelledby", label.id);
    item.setAttribute("aria-describedby", detail.id);
    item.append(label, detail);
    popup.append(item);
  };
  option("No adjustment", "Keep the palette's original colors.", "fictional-none");
  option("Red color blind (Protanopia)", "Reds look dark or blend with greens.", "fictional-protanopia");
  option("Green color blind (Deuteranopia)", "Greens blend with reds or browns.", "fictional-deuteranopia");
  option("Blue-yellow color blind (Tritanopia)", "Blues blend with greens; yellows with pinks.", "fictional-tritanopia");
  firstPresentation.append(popup);
  secondPresentation.append(firstPresentation);
  innerPortal.append(secondPresentation);
  outerPortal.append(innerPortal);
  portalRoot.append(outerPortal);
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.querySelector("nav h1").textContent === "颜色滤镜" &&
    document.querySelector('[data-settings-scroll] h2').textContent === "颜色滤镜" &&
    document.querySelector('[data-settings-scroll] section p').textContent === "让色觉障碍用户更容易区分颜色。" &&
    document.querySelector('[data-settings-scroll] section:nth-of-type(3) button[role=radio] span').textContent === "系统" &&
    document.querySelector('[data-settings-scroll] section:nth-of-type(2) h2').textContent === "高对比度" &&
    previewLabels.every((node, index) => node.textContent ===
      ["开放", "已关闭", "已合并", "草稿", "排队中"][index]));
  assert.equal(document.querySelector('[data-settings-scroll] section p').textContent, "让色觉障碍用户更容易区分颜色。");
  assert.equal(document.querySelector('[data-settings-scroll] section:nth-of-type(3) button[role=radio] span').textContent, "系统");
  assert.equal(document.querySelector('[data-settings-scroll] section:nth-of-type(2) h2').textContent, "高对比度");
  assert.equal(document.querySelector('[data-settings-scroll] > p').textContent, "Fictional repository name");
  assert.equal(document.querySelector("main").textContent, 'No adjustmentColor filtersfunction getStatus() { return "Open"; }');
  assert.deepEqual(previewLabels.map(node => node.textContent), ["开放", "已关闭", "已合并", "草稿", "排队中"]);
  assert.equal(previewFrame.contentDocument.querySelector("h2").textContent, "Pull requests");
  previewFrame.title = "Fictional unrelated preview";
  await waitFor(() => previewLabels.every((node, index) => node.textContent ===
    ["Open", "Closed", "Merged", "Draft", "Queued"][index]));
  previewFrame.title = "Color sample preview";
  await waitFor(() => previewLabels.every((node, index) => node.textContent ===
    ["开放", "已关闭", "已合并", "草稿", "排队中"][index]));
  trigger.setAttribute("aria-expanded", "true");
  await waitFor(() => trigger.querySelector("span").textContent === "不调整" &&
    popup.querySelector('[role=option] span').textContent === "不调整" &&
    popup.querySelector('[role=option] p').textContent === "保留配色的原始颜色。" &&
    popup.querySelectorAll('[role=option]')[3].querySelector("span").textContent === "蓝黄色盲（蓝黄色盲型）");
  assert.equal(popup.querySelector('[role=option] span').textContent, "不调整");
  assert.equal(popup.querySelector('[role=option] p').textContent, "保留配色的原始颜色。");
  assert.equal(popup.querySelectorAll('[role=option]')[3].querySelector("span").textContent, "蓝黄色盲（蓝黄色盲型）");
  trigger.querySelector("span").firstChild.nodeValue = "Red color blind (Protanopia)";
  await waitFor(() => trigger.querySelector("span").textContent === "红色盲（红色盲型）");
  overlay.stop();
  assert.equal(document.querySelector("nav h1").textContent, "Color filters");
  assert.equal(popup.querySelector('[role=option] span').textContent, "No adjustment");
  assert.equal(trigger.querySelector("span").textContent, "Red color blind (Protanopia)");
  assert.deepEqual(previewLabels.map(node => node.textContent), ["Open", "Closed", "Merged", "Draft", "Queued"]);
  dom.window.close();
});

test("shortcut count summary preserves its dynamic number while translating only fixed text slots", async () => {
  const dom = new JSDOM(`<body><main><p>5 action without shortcut</p></main><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll="true" aria-label="Accessibility"><section data-section-id="accessibility-keyboard">
      <div><div><div><span></span></div></div></div>
    </section></section>
  </div></div></body>`, { pretendToBeVisual: true });
  const { document } = dom.window;
  const span = document.querySelector('[data-section-id="accessibility-keyboard"] span');
  span.append(document.createTextNode("5"), document.createTextNode(" "),
    document.createTextNode("action"), document.createTextNode(" "),
    document.createTextNode("without shortcut"));
  const count = span.childNodes[0];
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => span.textContent === "5 项操作未设置快捷键");
  count.nodeValue = "7";
  await waitFor(() => span.textContent === "7 项操作未设置快捷键");
  overlay.stop();
  assert.equal(span.textContent, "7 action without shortcut");
  dom.window.close();
});

test("Sessions combobox and model menu translate only relation-owned fixed choices", async () => {
  const dom = new JSDOM(`<body><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll="true" aria-label="Sessions">
      <section data-section-id="sessions-worktree-location">
        <div data-settings-header><div><h2>Worktree location</h2><p>Choose where new worktrees are stored.</p></div>
          <button id="fictional-storage-trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false"
            aria-controls="fictional-storage-popup"><span>Global storage</span></button>
        </div>
      </section>
      <section data-section-id="sessions-default-model">
        <div data-settings-header><div><h2 id="fictional-model-title">Default model</h2>
          <p id="fictional-model-description">Choose the default model for sessions.</p></div>
          <button id="fictional-model-trigger" aria-haspopup="menu" aria-expanded="false"
            aria-labelledby="fictional-model-title fictional-model-trigger"
            aria-describedby="fictional-model-description" aria-controls="fictional-model-popup"><span>Latest used</span></button>
        </div>
      </section>
      <p>Fictional repository name</p><p>Fictional branch name</p>
    </section>
  </div></div></body>`, { pretendToBeVisual: true });
  const { document } = dom.window;
  const portalRoot = document.getElementById("portal-root");
  const storageTrigger = document.getElementById("fictional-storage-trigger");
  const storagePopup = document.createElement("div");
  storagePopup.id = "fictional-storage-popup";
  storagePopup.setAttribute("role", "listbox");
  for (const label of ["Global storage", "Inside repository", "Next to repository", "Custom"]) {
    const option = document.createElement("div");
    option.setAttribute("role", "option");
    const leaf = document.createElement("div");
    leaf.textContent = label;
    option.append(leaf);
    storagePopup.append(option);
  }
  const storageFirst = document.createElement("div");
  storageFirst.setAttribute("role", "presentation");
  storageFirst.setAttribute("data-open", "");
  const storageSecond = document.createElement("div");
  storageSecond.setAttribute("role", "presentation");
  storageSecond.setAttribute("data-open", "");
  const storageInner = document.createElement("div");
  storageInner.setAttribute("data-base-ui-portal", "");
  const storageOuter = document.createElement("div");
  storageOuter.setAttribute("data-base-ui-portal", "");
  storageFirst.append(storagePopup);
  storageSecond.append(storageFirst);
  storageInner.append(storageSecond);
  storageOuter.append(storageInner);
  portalRoot.append(storageOuter);

  const modelTrigger = document.getElementById("fictional-model-trigger");
  const modelPopup = document.createElement("div");
  modelPopup.id = "fictional-model-popup";
  modelPopup.setAttribute("role", "menu");
  modelPopup.setAttribute("aria-labelledby", modelTrigger.id);
  modelPopup.setAttribute("data-open", "");
  modelPopup.setAttribute("data-rootownerid", "fictional-root");
  const modelWrapper = document.createElement("div");
  const modelRadioItems = document.createElement("div");
  modelRadioItems.setAttribute("data-menu-has-radio-item", "");
  const modelGroup = document.createElement("div");
  modelGroup.setAttribute("role", "group");
  for (const label of ["Latest used", "Preferred model", "Fictional model"]) {
    const item = document.createElement("div");
    item.setAttribute("role", "menuitemradio");
    const leaf = document.createElement("span");
    leaf.textContent = label;
    item.append(leaf);
    modelGroup.append(item);
  }
  modelRadioItems.append(modelGroup);
  modelWrapper.append(modelRadioItems);
  modelPopup.append(modelWrapper);
  const modelPresentation = document.createElement("div");
  modelPresentation.setAttribute("role", "presentation");
  modelPresentation.setAttribute("data-open", "");
  const modelInner = document.createElement("div");
  modelInner.setAttribute("data-base-ui-portal", "");
  const modelOuter = document.createElement("div");
  modelOuter.setAttribute("data-base-ui-portal", "");
  modelPresentation.append(modelPopup);
  modelInner.append(modelPresentation);
  modelOuter.append(modelInner);
  portalRoot.append(modelOuter);

  const overlay = startSettingsTranslation(document, dictionary);
  storageTrigger.setAttribute("aria-expanded", "true");
  modelTrigger.setAttribute("aria-expanded", "true");
  await waitFor(() => storageTrigger.textContent === "全局存储" &&
    modelTrigger.textContent === "最近使用" &&
    storagePopup.querySelector('[role=option]').textContent === "全局存储" &&
    modelPopup.querySelector('[role=menuitemradio] span').textContent === "最近使用" &&
    modelPopup.querySelectorAll('[role=menuitemradio] span')[1].textContent === "首选模型");
  assert.equal(modelPopup.querySelectorAll('[role=menuitemradio] span')[2].textContent, "Fictional model");
  assert.equal(document.querySelector('[data-settings-scroll] > p').textContent, "Fictional repository name");
  assert.equal(document.querySelector('[data-settings-scroll] > p + p').textContent, "Fictional branch name");
  const duplicateTrigger = document.createElement("button");
  duplicateTrigger.id = "fictional-duplicate-storage-trigger";
  duplicateTrigger.setAttribute("role", "combobox");
  duplicateTrigger.setAttribute("aria-haspopup", "listbox");
  duplicateTrigger.setAttribute("aria-expanded", "true");
  duplicateTrigger.setAttribute("aria-controls", storagePopup.id);
  document.querySelector('[data-section-id="sessions-worktree-location"]').append(duplicateTrigger);
  await waitFor(() => storagePopup.querySelector('[role=option]').textContent === "Global storage");
  overlay.stop();
  assert.equal(storagePopup.querySelector('[role=option]').textContent, "Global storage");
  assert.equal(modelPopup.querySelector('[role=menuitemradio] span').textContent, "Latest used");
  dom.window.close();
});

test("a host update to protected code restores the surrounding sentence", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  const root = document.getElementById("branch");
  await waitFor(() => root.textContent.startsWith("添加到生成分支名称"));
  root.querySelector("code").textContent = "%changed%";
  await waitFor(() => root.textContent.startsWith("Prefix added to generated branch names."));
  assert.equal(root.querySelector("code").textContent, "%changed%");
  overlay.stop();
  dom.window.close();
});

test("general-about section translates static title, description, and update button and restores cleanly", async () => {
  const dom = new JSDOM(`<body>
    <div id="portal-root"><div role="dialog" data-settings-dialog-root>
      <section data-settings-scroll aria-label="General">
        <section data-section-id="general-about">
          <div>
            <div>
              <h2>About</h2>
              <p>Check for updates to see if a newer version is available</p>
            </div>
            <div>
              <button>Check for updates</button>
            </div>
          </div>
        </section>
      </section>
    </div></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const heading = document.querySelector('[data-section-id="general-about"] h2');
  const paragraph = document.querySelector('[data-section-id="general-about"] p');
  const button = document.querySelector('[data-section-id="general-about"] button');
  await waitFor(() => heading.textContent === "关于" &&
    paragraph.textContent === "检查是否有更新版本可用" &&
    button.textContent === "检查更新");
  overlay.stop();
  assert.equal(heading.textContent, "About");
  assert.equal(paragraph.textContent, "Check for updates to see if a newer version is available");
  assert.equal(button.textContent, "Check for updates");
  dom.window.close();
});

test("newly activated settings panes are translated and restored when hidden", async () => {
  const dom = new JSDOM(`<body><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <section data-settings-scroll><section data-section-id="voice-mode-models"><div><h2>Transcription models</h2><p>Choose an English-only or multilingual model for private, on-device transcription.</p></div></section></section>
  </div></div></body>`);
  const { document } = dom.window;
  const pane = document.querySelector("[data-settings-scroll]");
  const title = pane.querySelector("h2");
  const overlay = startSettingsTranslation(document, dictionary);
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(title.textContent, "Transcription models");
  pane.setAttribute("aria-label", "Voice dictation");
  await waitFor(() => title.textContent === "转录模型");
  pane.removeAttribute("aria-label");
  await waitFor(() => title.textContent === "Transcription models");
  pane.setAttribute("aria-label", "Voice dictation");
  await waitFor(() => title.textContent === "转录模型");
  overlay.stop();
  dom.window.close();
});

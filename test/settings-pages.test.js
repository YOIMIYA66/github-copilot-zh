import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { dictionary } from "../src/dictionary.js";
import { startSettingsTranslation } from "../src/overlay.js";

async function waitFor(predicate) {
  const end = Date.now() + 2000;
  while (!predicate() && Date.now() < end) await new Promise(resolve => setTimeout(resolve, 0));
  assert.ok(predicate(), "timed out waiting for overlay");
}

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
    document.querySelector('[data-section-id="accessibility-keyboard"] div:last-of-type').textContent === "Go back");
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

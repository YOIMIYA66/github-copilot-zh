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

function menu(id, triggerId, content) {
  return `<div data-base-ui-portal><div role="presentation" data-open>
    <div role="menu" id="${id}" data-open data-rootownerid="generated-root"
      aria-labelledby="${triggerId}">${content}</div>
  </div></div>`;
}

function sidebarNavigation() {
  return `<nav><ul>${[
    ["home", "navigation.home", "New"],
    ["pulls", "navigation.pulls", "Pull requests"],
    ["issues", "navigation.issues", "Issues"],
    ["workflows", "navigation.automations", "Automations"],
    ["extensions", "navigation.customize", "Customize"]
  ].map(([item, command, label]) => `<li><button data-sidebar-nav-item="${item}" data-command="${command}"
    ${item === "home" ? 'data-sidebar-file-drop-kind="new"' : ""} data-selected="false">
    <svg aria-hidden="true"></svg><span><span><span><span>${label}</span></span></span></span><kbd>Ctrl+1</kbd>
  </button></li>`).join("")}</ul></nav>`;
}

function sidebarFixture(initial = true) {
  const dom = new JSDOM(`<body><div data-sidebar-live-width><div>
    <div data-testid="sidebar-scroll-viewport" data-offscreen-pause-root="true">
      <div id="fixed-navigation">${initial ? sidebarNavigation() : ""}</div>
      <ul id="session-list"><li><button>New</button></li><li><button>Pull requests</button></li><li><button>Issues</button></li></ul>
    </div></div></div><main data-app-shell-main data-f6-nav><div id="chat"><p>New</p><p>Issues</p></div></main>
    <div id="portal-root"></div></body>`);
  return { dom, document: dom.window.document };
}

function fixture() {
  const dom = new JSDOM(`<body><main data-app-shell-main data-f6-nav>
    <div data-testid="conversation-root">
      <aside data-sidebar-root><div data-testid="sidebar-floating-surface">
        <div data-testid="sidebar-scroll-viewport">
          <nav aria-labelledby="quick-links-heading"><h2 id="quick-links-heading">Quick links</h2><ul>
            <li><button><span>Automations</span></button></li>
            <li><button><span>Customize</span></button></li>
          </ul></nav>
          <ul><li><button>Fictional session</button></li></ul>
        </div>
        <nav data-sidebar-footer>
          <button id="profile-menu-generated" aria-haspopup="menu" aria-expanded="true"
            aria-controls="profile-popup-generated" aria-label="Fictional User, open user menu"></button>
        </nav>
      </div></aside>
      <div data-testid="conversation-composer-area">
        <div data-testid="composer-pills">
          <button data-testid="background-activity-pill" aria-controls="background-activity-list"><span>Background</span><span class="count">4</span></button>
          <button data-testid="artifact-files-pill" aria-controls="artifact-files-list"><span>Artifacts</span><span class="count">2</span></button>
        </div>
        <div data-rich-composer-footer>
          <button id="mode-trigger-generated" aria-haspopup="menu" aria-expanded="true" aria-controls="mode-popup-generated"
            data-base-ui-tooltip-trigger aria-label="Mode: Interactive, Ctrl + Shift + M">Interactive</button>
          <button id="model-trigger-generated" aria-haspopup="menu" aria-expanded="true" aria-controls="model-popup-generated"
            data-base-ui-tooltip-trigger aria-label="Copilot Fusion · Standard, model and reasoning, Ctrl + Shift + E">Copilot Fusion · Standard</button>
          <button id="context-trigger-generated" aria-haspopup="menu" aria-expanded="true" aria-controls="context-popup-generated"
            data-base-ui-tooltip-trigger aria-label="Add context &amp; more"></button>
        </div>
      </div>
      <nav role="tablist" aria-label="Pull requests">
        <button role="tab" aria-selected="true"><span>Authored by me</span><span class="count">3</span></button>
        <button role="tab" aria-selected="false">Assigned to me</button>
        <button role="tab" aria-selected="false">Involves me</button>
        <button role="tab" aria-selected="false">Review requests</button>
        <button role="tab" aria-selected="false">Done</button>
      </nav>
      <nav role="tablist" aria-label="Issues">
        <button role="tab" aria-selected="true">Created by me</button>
        <button role="tab" aria-selected="false">Assigned to me</button>
        <button role="tab" aria-selected="false">Mentioned</button>
        <button role="tab" aria-selected="false">Done</button>
      </nav>
      <div class="chat">
        <p>Background</p><p>Artifacts</p><p>Thinking</p><p>Thought for 2 seconds</p>
        <p>Sent message to user</p><footer>1m ago · Claude Opus 5.5</footer><p>Artifacts 22</p>
      </div>
    </div>
  </main>
  <div id="portal-root"></div>
  ${menu("profile-popup-generated", "profile-menu-generated", `
    <div role="menuitem"><span><span>Manage accounts</span></span></div>
    <div role="menuitem"><span><span>Manage sessions</span></span></div>
    <div role="menuitem"><button id="theme-trigger-generated" aria-haspopup="menu" aria-expanded="true"
      aria-controls="theme-popup-generated">Theme</button></div>
    <div role="menuitem"><span>Keyboard shortcuts</span></div>
    <div role="menuitem"><span>Health check</span></div>
    <div role="menuitem"><span>What's new</span></div>
    <div role="menuitem"><span>About</span></div>
    <div role="menuitem"><span>Help center</span></div>
    <div role="menuitem"><span>Sign out</span></div>
    <div><span><span>AI credits used: 13%</span></span></div>`) }
  ${menu("mode-popup-generated", "mode-trigger-generated", `
    <div role="group" aria-labelledby="mode-title-generated">
      <div id="mode-title-generated">Mode</div>
      <div role="menuitemradio"><span>Interactive</span><span data-menu-description>Step-by-step collaboration</span></div>
      <div role="menuitemradio"><span>Plan</span><span data-menu-description>Plan first, execute when ready</span></div>
      <div role="menuitemradio"><span>Autopilot</span><span data-menu-description>End-to-end execution without interruption</span></div>
    </div>
    <div role="menuitem"><button id="permissions-trigger-generated" aria-haspopup="menu" aria-expanded="true"
      aria-controls="permissions-popup-generated">Tool permissions</button></div>
    <div role="menuitem"><span>Approve all</span></div>`) }
  ${menu("model-popup-generated", "model-trigger-generated", `
    <div role="none"><div>Effort level</div></div>
    <div role="menuitemradio" data-auto-tier-id="standard">Standard</div>
    <div role="menuitemradio" data-auto-tier-id="high">High</div>
    <div role="menuitemradio" data-auto-tier-id="max">Max</div>
    <div role="none"><span id="tier-generated-standard">30% discount until Nov 30</span></div>
    <div role="none"><span id="tier-generated-hydrafusion">15% discount until Nov 15</span></div>
    <div role="none"><span id="tier-generated-max">30% discount until Nov 30</span></div>
    <div role="none"><a href="#learn">Learn more<svg aria-hidden="true"></svg></a></div>`) }
  ${menu("context-popup-generated", "context-trigger-generated", `
    <div role="menuitem"><span><span>Repository file or folder…</span></span><kbd>@</kbd></div>
    <div role="menuitem"><span><span>Session…</span></span></div>
    <div role="menuitem"><span><span>Files…</span></span></div>
    <div role="menuitem"><span><span>Folder…</span></span></div>`) }
  ${menu("theme-popup-generated", "theme-trigger-generated", `
    <div role="menuitemradio"><span>System</span></div>
    <div role="menuitemradio"><span>Light</span></div>
    <div role="menuitemradio"><span>Dark</span></div>
    <div role="menuitem"><span>Open themes settings</span><kbd>@</kbd></div>`) }
  ${menu("permissions-popup-generated", "permissions-trigger-generated", `
    <div role="menuitemradio"><span>Always ask</span><span data-menu-description>Ask before running tools.</span></div>
    <div role="menuitemradio"><span>Assisted</span><span data-menu-description>Uses AI to reduce approval prompts.</span></div>
    <div role="menuitemradio"><span>Approve all</span><span data-menu-description>Run tools without asking.</span></div>`) }
  <div data-base-ui-portal><div role="presentation" data-open>
    <div role="dialog" id="model-details-generated" data-auto-tier-details-overlay data-open
      data-side="right" aria-labelledby="unknown-generated-label">
      <p>Prioritizes capable models for challenging tasks and deeper reasoning.</p>
      <p>15% discount until Nov 15</p>
    </div>
  </div></div>
  <div data-base-ui-portal><div role="presentation" data-open>
    <div role="menu" id="unrelated-popup" data-open data-rootownerid="other" aria-labelledby="unrelated-trigger">
      <div role="menuitem"><span>Manage sessions</span></div>
    </div>
  </div></div>
  <button id="unrelated-trigger" aria-haspopup="menu" aria-expanded="true" aria-controls="unrelated-popup"
    aria-label="Fictional User, open user menu">Profile</button>
  </body>`);
  return { dom, document: dom.window.document };
}

test("translates only verified static chrome and bidirectionally owned menus", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  const modePopup = document.getElementById("mode-popup-generated");
  await waitFor(() => [...modePopup.querySelectorAll("[data-menu-description]")].every((node, index) =>
    node.textContent === ["逐步协作", "先制定计划，准备就绪后执行", "不中断地端到端执行"][index]) &&
    document.getElementById("profile-popup-generated").textContent.includes("管理账户") &&
    document.querySelector('[data-testid="artifact-files-pill"]').textContent.startsWith("产物") &&
    document.querySelector("#model-popup-generated [role=none] div").textContent === "推理强度" &&
    document.querySelector('#model-popup-generated a[href="#learn"]').firstChild.nodeValue === "了解详情" &&
    [...document.querySelectorAll('[role="none"] span[id]')].map(node => node.textContent).join("|") ===
      "30% discount until Nov 30|15% discount until Nov 15|30% discount until Nov 30");
  await waitFor(() => document.querySelector("#model-details-generated p").textContent ===
    "优先为高难度任务和深入推理提供能力更强的模型。" &&
    document.querySelector("#model-details-generated p:last-child").textContent === "15% discount until Nov 15");
  assert.equal(document.querySelector('[aria-labelledby="quick-links-heading"] li:first-child button').textContent, "自动化");
  assert.equal(document.querySelector('[aria-labelledby="quick-links-heading"] li:last-child button').textContent, "扩展中心");
  assert.deepEqual([...document.querySelectorAll('nav[aria-label="Pull requests"] [role=tab]')].map(node =>
    [node.textContent, node.getAttribute("aria-selected")]), [
    ["Authored by me3", "true"], ["Assigned to me", "false"], ["Involves me", "false"], ["Review requests", "false"], ["Done", "false"]
  ]);
  assert.deepEqual([...document.querySelectorAll('nav[aria-label="Issues"] [role=tab]')].map(node =>
    [node.textContent, node.getAttribute("aria-selected")]), [
    ["Created by me", "true"], ["Assigned to me", "false"], ["Mentioned", "false"], ["Done", "false"]
  ]);
  assert.equal(document.querySelector('nav[aria-label="Pull requests"] .count').textContent, "3");
  assert.equal(document.querySelector('[data-testid="background-activity-pill"] .count').textContent, "4");
  assert.equal(document.querySelector('[data-testid="artifact-files-pill"] .count').textContent, "2");
  assert.equal(document.querySelector('[data-testid="background-activity-pill"]').textContent, "后台4");
  assert.equal(document.querySelector('[data-testid="artifact-files-pill"]').textContent, "产物2");
  assert.deepEqual([...modePopup.querySelectorAll("[data-menu-description]")].map(node => node.textContent),
    ["逐步协作", "先制定计划，准备就绪后执行", "不中断地端到端执行"]);
  assert.equal(modePopup.querySelector("#mode-title-generated").textContent, "模式");
  assert.deepEqual([...modePopup.querySelectorAll('[role="menuitemradio"] > span:first-child')].map(node => node.textContent),
    ["Interactive", "Plan", "Autopilot"]);
  assert.equal(document.getElementById("model-popup-generated").querySelector('[role="none"] div').textContent, "推理强度");
  assert.deepEqual([...document.querySelectorAll('[role="none"] span[id]')].map(node => node.textContent),
    ["30% discount until Nov 30", "15% discount until Nov 15", "30% discount until Nov 30"]);
  assert.equal(document.querySelector('#model-popup-generated a[href="#learn"]').firstChild.nodeValue, "了解详情");
  assert.ok(document.querySelector("#model-popup-generated svg"));
  assert.deepEqual([...document.querySelectorAll("#context-popup-generated [role=menuitem] > span > span")].map(node => node.textContent),
    ["仓库文件或文件夹…", "会话…", "文件…", "文件夹…"]);
  assert.equal(document.querySelector("#context-popup-generated kbd").textContent, "@");
  assert.equal(document.querySelector('#profile-popup-generated [role=menuitem] span span').textContent, "管理账户");
  assert.equal(document.querySelector('#profile-popup-generated [role=menuitem]:nth-child(2) span span').textContent, "管理会话");
  assert.equal(document.querySelector("#profile-popup-generated > div:last-child span span").textContent, "AI credits used: 13%");
  assert.deepEqual([...document.querySelectorAll("#theme-popup-generated [role=menuitemradio]")].map(node => node.textContent),
    ["系统", "浅色", "深色"]);
  assert.equal(document.querySelector("#theme-popup-generated [role=menuitem] span").textContent, "打开主题设置");
  assert.equal(document.querySelector("#theme-popup-generated kbd").textContent, "@");
  assert.deepEqual([...document.querySelectorAll("#permissions-popup-generated [role=menuitemradio] > span:first-child")].map(node => node.textContent),
    ["始终询问", "辅助模式", "全部允许"]);
  assert.deepEqual([...document.querySelectorAll("#permissions-popup-generated [data-menu-description]")].map(node => node.textContent),
    ["运行工具前询问。", "使用 AI 减少审批提示。", "运行工具前不再询问。"]);
  assert.equal(document.querySelector("#model-details-generated p:last-child").textContent, "15% discount until Nov 15");
  const discount = document.querySelector("#model-details-generated p:last-child");
  discount.firstChild.nodeValue = "20.5% discount until Nov 16";
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(discount.textContent, "20.5% discount until Nov 16");
  assert.equal(document.querySelector('#unrelated-popup [role=menuitem]').textContent, "Manage sessions");
  assert.equal(document.getElementById("profile-menu-generated").getAttribute("aria-label"), "Fictional User, open user menu");
  assert.deepEqual([...document.querySelector(".chat").children].map(node => node.textContent),
    ["Background", "Artifacts", "Thinking", "Thought for 2 seconds", "Sent message to user", "1m ago · Claude Opus 5.5", "Artifacts 22"]);
  const scans = overlay.stats.settingsScans;
  const callbacks = overlay.stats.callbacks;
  document.querySelector(".chat p").firstChild.nodeValue = "Updated message";
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(overlay.stats.settingsScans, scans);
  assert.equal(overlay.stats.callbacks, callbacks);
  overlay.stop();
  assert.equal(document.querySelector('[data-testid="background-activity-pill"]').textContent, "Background4");
  assert.equal(document.querySelector('[data-testid="artifact-files-pill"]').textContent, "Artifacts2");
  assert.equal(modePopup.querySelector("[data-menu-description]").textContent, "Step-by-step collaboration");
  assert.equal(document.querySelector("#profile-popup-generated > div:last-child span span").textContent, "AI credits used: 13%");
  assert.equal(document.getElementById("model-popup-generated").querySelector('[role="none"] div').textContent, "Effort level");
  assert.equal(document.querySelector("#model-details-generated p:first-child").textContent,
    "Prioritizes capable models for challenging tasks and deeper reasoning.");
  assert.equal(document.querySelector("#permissions-popup-generated [role=menuitemradio] > span:first-child").textContent,
    "Always ask");
  assert.equal(document.querySelector("#theme-popup-generated [role=menuitemradio] span").textContent, "System");
  dom.window.close();
});

test("closed chrome popups and matching chat words do not trigger scans", async () => {
  const { dom, document } = fixture();
  for (const trigger of document.querySelectorAll('[aria-haspopup="menu"]')) trigger.setAttribute("aria-expanded", "false");
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.querySelector('[data-testid="artifact-files-pill"] span').textContent === "产物" &&
    document.querySelector('nav[aria-labelledby="quick-links-heading"] li:last-child button span').textContent === "扩展中心");
  let previous = "";
  let stable = 0;
  await waitFor(() => {
    const current = JSON.stringify([overlay.stats.callbacks, overlay.stats.chromeScans, overlay.stats.portalScans]);
    stable = current === previous ? stable + 1 : 0;
    previous = current;
    return stable >= 3;
  });
  const before = { ...overlay.stats };
  document.querySelector(".chat").innerHTML = "<p>Theme</p><p>Light</p><p>Always ask</p><p>Prioritizes capable models for challenging tasks and deeper reasoning.</p>";
  await new Promise(resolve => setTimeout(resolve, 10));
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) {
    assert.equal(overlay.stats[key], before[key], `${key} changed for closed menus and chat updates`);
  }
  assert.deepEqual([...document.querySelectorAll(".chat p")].map(node => node.textContent),
    ["Theme", "Light", "Always ask", "Prioritizes capable models for challenging tasks and deeper reasoning."]);
  assert.equal(document.querySelector("#model-details-generated p").textContent,
    "Prioritizes capable models for challenging tasks and deeper reasoning.");
  overlay.stop();
  dom.window.close();
});

test("closes and restores a chrome menu when its dynamic trigger ownership ends", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  const trigger = document.getElementById("mode-trigger-generated");
  const description = document.querySelector("#mode-popup-generated [data-menu-description]");
  await waitFor(() => description.textContent === "逐步协作");
  trigger.setAttribute("aria-controls", "unrelated-generated-menu");
  await waitFor(() => description.textContent === "Step-by-step collaboration");
  trigger.setAttribute("aria-controls", "mode-popup-generated");
  await waitFor(() => description.textContent === "逐步协作");
  trigger.setAttribute("aria-expanded", "false");
  await waitFor(() => description.textContent === "Step-by-step collaboration");
  trigger.setAttribute("aria-expanded", "true");
  await waitFor(() => description.textContent === "逐步协作");
  overlay.stop();
  dom.window.close();
});

test("permission titles and fixed descriptions translate while selection and host updates remain unchanged", async () => {
  const { dom, document } = fixture();
  const popup = document.getElementById("permissions-popup-generated");
  const items = [...popup.querySelectorAll('[role="menuitemradio"]')];
  items.forEach((item, index) => item.setAttribute("aria-checked", String(index === 1)));
  document.getElementById("portal-root").innerHTML = `<div role="dialog" data-settings-dialog-root>
    <section data-section-id="sessions-auto-approve"><button aria-haspopup="listbox">Assisted</button></section>
  </div>`;
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => items[2].firstElementChild.textContent === "全部允许" &&
    items[2].lastElementChild.textContent === "运行工具前不再询问。" &&
    document.querySelector('[data-section-id="sessions-auto-approve"] button').textContent === "辅助审批");
  assert.deepEqual(items.map(item => item.firstElementChild.textContent), ["始终询问", "辅助模式", "全部允许"]);
  assert.deepEqual(items.map(item => item.getAttribute("aria-checked")), ["false", "true", "false"]);
  assert.deepEqual(items.map(item => item.lastElementChild.textContent),
    ["运行工具前询问。", "使用 AI 减少审批提示。", "运行工具前不再询问。"]);
  items[1].lastElementChild.firstChild.nodeValue = "Assisted";
  items[1].firstElementChild.firstChild.nodeValue = "Always ask";
  await waitFor(() => items[1].firstElementChild.textContent === "始终询问");
  assert.equal(items[1].lastElementChild.textContent, "Assisted");
  const trigger = document.getElementById("permissions-trigger-generated");
  trigger.setAttribute("aria-expanded", "false");
  await waitFor(() => items[0].firstElementChild.textContent === "Always ask");
  assert.deepEqual(items.map(item => item.firstElementChild.textContent), ["Always ask", "Always ask", "Approve all"]);
  trigger.setAttribute("aria-expanded", "true");
  await waitFor(() => items[2].firstElementChild.textContent === "全部允许");
  overlay.stop();
  assert.deepEqual(items.map(item => item.firstElementChild.textContent), ["Always ask", "Always ask", "Approve all"]);
  assert.equal(items[1].lastElementChild.textContent, "Assisted");
  assert.deepEqual(items.map(item => item.getAttribute("aria-checked")), ["false", "true", "false"]);
  dom.window.close();
});

test("verified model switch labels and updated details translate without renaming tiers or changing state", async () => {
  const { dom, document } = fixture();
  const popup = document.getElementById("model-popup-generated");
  const row = document.createElement("div");
  row.setAttribute("role", "menuitem");
  row.innerHTML = '<button role="switch" aria-checked="true"><span>On</span></button><span data-user-content>On</span>';
  popup.append(row);
  const description = document.querySelector("#model-details-generated p");
  let english = "Prioritizes the most capable models for the most demanding tasks and complex reasoning.";
  description.textContent = english;
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => row.querySelector("button span").textContent === "开启" && description.textContent === dictionary[english]);
  assert.deepEqual([...popup.querySelectorAll("[data-auto-tier-id]")].map(node => node.textContent), ["Standard", "High", "Max"]);
  assert.equal(row.querySelector("[data-user-content]").textContent, "On");
  row.querySelector("button").setAttribute("aria-checked", "false");
  row.querySelector("button span").firstChild.nodeValue = "Off";
  await waitFor(() => row.querySelector("button span").textContent === "关闭");
  assert.equal(row.querySelector("button").getAttribute("aria-checked"), "false");
  english = "Prioritizes versatile models for efficient everyday coding.";
  description.textContent = english;
  await waitFor(() => description.textContent === dictionary[english]);
  overlay.stop();
  assert.equal(description.textContent, english);
  assert.equal(row.querySelector("button span").textContent, "Off");
  dom.window.close();
});

test("owned Settings composers do not require chat-only keyboard hints or generated mode-heading IDs", async () => {
  const { dom, document } = fixture();
  const footer = document.querySelector("[data-rich-composer-footer]");
  document.getElementById("portal-root").innerHTML = '<div role="dialog" data-settings-dialog-root></div>';
  document.querySelector("[data-settings-dialog-root]").append(footer);
  document.getElementById("mode-trigger-generated").setAttribute("aria-label", "Mode: Interactive");
  document.getElementById("model-trigger-generated").setAttribute("aria-label", "Copilot Fusion · Standard, model and reasoning");
  const title = document.getElementById("mode-title-generated");
  title.removeAttribute("id");
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => title.textContent === "模式" &&
    document.querySelector("#model-popup-generated [role=none] div").textContent === "推理强度" &&
    document.querySelector("#permissions-popup-generated [data-menu-description]").textContent === "运行工具前询问。");
  assert.deepEqual([...document.querySelectorAll("#mode-popup-generated [role=menuitemradio] > span:first-child")].map(node => node.textContent),
    ["Interactive", "Plan", "Autopilot"]);
  footer.removeAttribute("data-rich-composer-footer");
  await waitFor(() => title.textContent === "Mode");
  assert.equal(document.querySelector("#model-popup-generated [role=none] div").textContent, "Effort level");
  overlay.stop();
  dom.window.close();
});

test("nested DIV actions separate fixed labels from selected values and keep inert parent menus as owners", async () => {
  const { dom, document } = fixture();
  document.getElementById("mode-trigger-generated").setAttribute("aria-label", "模式：交互, Ctrl + Shift + M");
  const mode = document.getElementById("mode-popup-generated");
  const model = document.getElementById("model-popup-generated");
  document.getElementById("permissions-trigger-generated").parentElement.remove();
  const trigger = (id, popup, label, value) => `<div><div data-menu-has-radio-item><div role="menuitem"
    id="${id}" aria-haspopup="menu" aria-expanded="true" aria-controls="${popup}" data-popup-open>
    <span><span><span>${label}</span><span>${value}</span></span></span></div></div></div>`;
  mode.insertAdjacentHTML("beforeend", trigger("permissions-trigger-generated", "permissions-popup-generated", "Tool permissions", "Approve all"));
  model.innerHTML = `<div role="menuitemradio" aria-checked="true"><span>High</span></div>` +
    trigger("fictional-effort-trigger", "fictional-effort-popup", "Effort", "High");
  model.insertAdjacentHTML("beforeend", trigger("fictional-model-choice", "fictional-model-list", "Model", "Model") +
    `<div><div data-menu-has-radio-item><div role="menuitem" id="fictional-context-row"><span><span><span>Context window</span><span>200K</span></span></span></div></div></div>`);
  for (const parent of [mode, model]) {
    parent.parentElement.setAttribute("data-base-ui-inert", "");
    parent.parentElement.setAttribute("aria-hidden", "true");
  }
  const permissions = document.getElementById("permissions-popup-generated");
  const permissionsPortal = permissions.parentElement.parentElement;
  permissionsPortal.remove();
  permissions.setAttribute("data-nested", "");
  permissions.parentElement.setAttribute("data-nested", "");
  permissions.innerHTML = `<div><div data-menu-has-radio-item><div role="group">${[
    ["Always ask", "Ask before running tools."], ["Assisted", "Uses AI to reduce approval prompts."],
    ["Approve all", "Run tools without asking."]
  ].map(([label, description]) => `<div role="menuitemradio" aria-checked="${label === "Assisted"}">
    <span><span>${label}</span><span data-menu-description="true"><span>${description}</span></span></span></div>`).join("")}</div></div></div>`;
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-base-ui-portal", "");
  const levels = ["Low", "Medium", "High", "Extra High", "Max"];
  wrapper.innerHTML = `<div role="presentation" data-open data-nested><div role="menu" id="fictional-effort-popup"
    aria-labelledby="fictional-effort-trigger" data-open data-nested data-rootownerid="${model.getAttribute("data-rootownerid")}">
    <div><div data-menu-has-radio-item><div role="group">${levels.map(level =>
      `<div role="menuitemradio" aria-checked="${level === "High"}"><span>${level}</span></div>`).join("")}</div></div></div>
    </div></div>`;
  document.body.append(wrapper);
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.querySelector("#permissions-trigger-generated > span > span > span:first-child").textContent === "工具权限");
  mode.parentElement.parentElement.append(permissionsPortal);
  await waitFor(() => permissions.querySelectorAll("[data-menu-description]")[2].textContent === "运行工具前不再询问。" &&
    wrapper.querySelectorAll("[role=menuitemradio]")[4].textContent === "最高");
  assert.deepEqual([...permissions.querySelectorAll("[role=menuitemradio] > span > span:first-child")].map(node => node.textContent),
    ["始终询问", "辅助模式", "全部允许"]);
  assert.deepEqual([...wrapper.querySelectorAll("[role=menuitemradio]")].map(node => node.textContent),
    ["低", "中", "高", "超高", "最高"]);
  assert.equal(model.querySelector(":scope > [role=menuitemradio]").textContent, "High");
  assert.equal(document.querySelector("#fictional-effort-trigger > span > span > span:last-child").textContent, "高");
  assert.equal(document.querySelector("#permissions-trigger-generated > span > span > span:last-child").textContent, "全部允许");
  assert.equal(document.querySelector("#permissions-trigger-generated > span > span > span:first-child").textContent, "工具权限");
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual([...permissions.querySelectorAll("[role=menuitemradio] > span > span:first-child")].map(node => node.textContent),
    ["始终询问", "辅助模式", "全部允许"]);
  assert.deepEqual([...permissions.querySelectorAll("[data-menu-description]")].map(node => node.textContent),
    ["运行工具前询问。", "使用 AI 减少审批提示。", "运行工具前不再询问。"]);
  permissions.querySelectorAll("[data-menu-description]")[0].lastElementChild.textContent = "Ask before running tools.";
  permissions.querySelectorAll("[role=menuitemradio]")[1].firstElementChild.firstElementChild.textContent = "Assisted";
  permissions.querySelectorAll("[role=menuitemradio]")[2].firstElementChild.firstElementChild.textContent = "Approve all";
  permissions.querySelectorAll("[data-menu-description]")[2].lastElementChild.textContent = "Run tools without asking.";
  await waitFor(() => permissions.querySelectorAll("[data-menu-description]")[0].textContent === "运行工具前询问。" &&
    permissions.querySelectorAll("[role=menuitemradio]")[1].firstElementChild.firstElementChild.textContent === "辅助模式" &&
    permissions.querySelectorAll("[role=menuitemradio]")[2].firstElementChild.firstElementChild.textContent === "全部允许" &&
    permissions.querySelectorAll("[data-menu-description]")[2].textContent === "运行工具前不再询问。");
  assert.equal(document.querySelector("#fictional-model-choice > span > span > span:first-child").textContent, "模型");
  assert.equal(document.querySelector("#fictional-model-choice > span > span > span:last-child").textContent, "Model");
  assert.equal(model.querySelector('#fictional-context-row > span > span > span').textContent, "上下文窗口");
  assert.ok(model.textContent.includes("200K"));
  assert.ok(mode.parentElement.hasAttribute("data-base-ui-inert"));
  assert.equal(document.getElementById("mode-trigger-generated").getAttribute("aria-label"), "模式：交互, Ctrl + Shift + M");
  assert.deepEqual([...mode.querySelectorAll("[role=menuitemradio] > span:first-child")].map(node => node.textContent),
    ["Interactive", "Plan", "Autopilot"]);
  assert.deepEqual([...wrapper.querySelectorAll("[role=menuitemradio]")].map(node => node.getAttribute("aria-checked")),
    ["false", "false", "true", "false", "false"]);
  document.querySelector("#fictional-effort-trigger > span > span > span:first-child").firstChild.nodeValue = "Fictional action";
  await waitFor(() => wrapper.querySelectorAll("[role=menuitemradio]")[4].textContent === "Max");
  await new Promise(resolve => setTimeout(resolve, 0));
  const before = { ...overlay.stats };
  wrapper.querySelector("[role=menuitemradio] span").firstChild.nodeValue = "High";
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(overlay.stats.callbacks, before.callbacks);
  assert.equal(overlay.stats.portalScans, before.portalScans);
  overlay.stop();
  dom.window.close();
});

test("image annotation labels and linked tooltips translate without reading the preview name or editor", async () => {
  const { dom, document } = fixture();
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-base-ui-portal", "");
  wrapper.innerHTML = `<div role="dialog" data-open data-testid="image-preview-dialog" data-image-preview-dialog
    data-window-dialog-position="fullscreen" aria-label="Fictional image filename">
    <div data-testid="browser-screenshot-annotation-editor"><div>
      <canvas id="fictional-canvas"></canvas><img alt="Fictional image" src="data:image/png;base64,fictional">
      <div contenteditable="true"><p id="fictional-annotation">Arrow Save Comment</p></div>
      <div data-testid="browser-screenshot-annotation-toolbar"><div><div role="radiogroup" aria-label="Annotation tool">
        ${["arrow", "rectangle", "pencil", "comment"].map((tool,index) => `<button role="radio" data-value="${tool}"
          aria-checked="${index === 0}" data-base-ui-tooltip-trigger><span><span><span>${["Arrow", "Rectangle", "Pencil", "Comment"][index]}</span></span></span></button>`).join("")}
        </div></div><div>${[["invisible", "Discard"], ["primary", "Save"]].map(([variant,label]) =>
          `<button data-variant="${variant}" data-size="small" data-base-ui-tooltip-trigger>
          <span data-component="content"><span data-component="label"><span>${label}</span></span></span></button>`).join("")}</div>
      </div></div></div></div>`;
  document.getElementById("portal-root").append(wrapper);
  const preview = wrapper.firstElementChild;
  const getAttribute = preview.getAttribute.bind(preview);
  preview.getAttribute = name => {
    if (name === "aria-label") throw new Error("Preview filename must not be read");
    return getAttribute(name);
  };
  document.getElementById("fictional-canvas").getContext = () => { throw new Error("Canvas must not be accessed"); };
  const overlay = startSettingsTranslation(document, dictionary);
  const toolbar = document.querySelector('[data-testid="browser-screenshot-annotation-toolbar"]');
  await waitFor(() => toolbar.querySelector('[data-variant="primary"]').textContent.trim() === "保存");
  assert.deepEqual([...toolbar.querySelectorAll('[role="radio"]')].map(node => node.textContent),
    ["箭头", "矩形", "画笔", "批注"]);
  assert.deepEqual([...toolbar.querySelectorAll('[role="radio"]')].map(node => node.getAttribute("aria-checked")),
    ["true", "false", "false", "false"]);
  assert.equal(document.getElementById("fictional-annotation").textContent, "Arrow Save Comment");
  preview.setAttribute("aria-label", "Fictional changed filename");
  const before = { ...overlay.stats };
  document.getElementById("fictional-annotation").textContent = "Save Rectangle";
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(document.getElementById("fictional-annotation").textContent, "Save Rectangle");
  for (const key of ["chromeScans", "settingsScans", "portalScans"]) assert.equal(overlay.stats[key], before[key], key);
  const tipWrapper = document.createElement("div");
  tipWrapper.setAttribute("data-base-ui-portal", "");
  tipWrapper.innerHTML = '<div role="tooltip" id="fictional-arrow-tip"><span>Arrow</span><kbd>A</kbd></div>';
  toolbar.querySelector('[data-value="arrow"]').setAttribute("aria-describedby", "fictional-arrow-tip");
  document.body.append(tipWrapper);
  await waitFor(() => tipWrapper.querySelector("span").textContent === "箭头");
  assert.equal(tipWrapper.querySelector("kbd").textContent, "A");
  preview.removeAttribute("data-image-preview-dialog");
  await waitFor(() => toolbar.querySelector('[data-value="arrow"]').textContent === "Arrow" &&
    tipWrapper.querySelector("span").textContent === "Arrow");
  preview.setAttribute("data-image-preview-dialog", "");
  await waitFor(() => toolbar.querySelector('[data-value="arrow"]').textContent === "箭头" &&
    tipWrapper.querySelector("span").textContent === "箭头");
  overlay.stop();
  assert.equal(toolbar.querySelector('[data-variant="primary"]').textContent.trim(), "Save");
  assert.equal(getAttribute("aria-label"), "Fictional changed filename");
  dom.window.close();
});

test("hover-owned fixed tooltips translate only active footer labels and preserve keyboard chords", async () => {
  const dom = new JSDOM(`<body><main data-app-shell-main>
    <nav data-sidebar-footer>
      <button data-testid="sidebar-feedback-button"></button>
      <button data-command="app.settings.open"></button>
    </nav>
    <div data-rich-composer-root="true" data-rc-consumer="prompt-composer">
      <div data-rich-composer-footer="true">
        <button id="fictional-mode" data-base-ui-tooltip-trigger aria-haspopup="menu"
          aria-label="Mode: Interactive, Ctrl + Shift + M">Interactive</button>
        <button id="fictional-model" data-base-ui-tooltip-trigger aria-haspopup="menu"
          aria-label="Fictional model, model and reasoning, Ctrl + Shift + E">Fictional model</button>
      </div>
    </div>
  </main><div id="portal-root"></div>
  <div role="dialog" aria-label="Fictional cached feedback dialog"><span>Share feedback</span></div></body>`,
  { pretendToBeVisual: true });
  const { document } = dom.window;
  const triggers = [
    document.querySelector('button[data-testid="sidebar-feedback-button"]'),
    document.querySelector('button[data-command="app.settings.open"]'),
    document.getElementById("fictional-mode"),
    document.getElementById("fictional-model")
  ];
  for (const trigger of triggers) {
    const matches = trigger.matches.bind(trigger);
    trigger.matches = selector => selector === ":hover" || matches(selector);
  }
  const labels = ["Share feedback", "Settings", "Mode", "Model & reasoning"];
  const portals = labels.map((label, index) => {
    const portal = document.createElement("div");
    portal.setAttribute("data-base-ui-portal", "");
    const presentation = document.createElement("div");
    presentation.setAttribute("role", "presentation");
    presentation.setAttribute("data-open", "");
    presentation.setAttribute("data-side", "top");
    presentation.setAttribute("data-align", "center");
    const focusable = document.createElement("div");
    focusable.setAttribute("data-open", "");
    focusable.setAttribute("data-side", "top");
    focusable.setAttribute("data-align", "center");
    focusable.setAttribute("tabindex", "-1");
    focusable.setAttribute("data-base-ui-focusable", "");
    const title = document.createElement("span");
    title.textContent = label;
    focusable.append(title);
    if (index > 0) {
      const chord = document.createElement("span");
      chord.setAttribute("data-kbd-chord", "");
      const key = document.createElement("kbd");
      key.textContent = `Fictional shortcut ${index}`;
      chord.append(key);
      focusable.append(chord);
    }
    presentation.append(focusable);
    portal.append(presentation);
    document.body.append(portal);
    return { portal, title };
  });
  const overlay = startSettingsTranslation(document, dictionary);
  assert.deepEqual(portals.map(({ title }) => title.textContent), labels);
  for (const trigger of triggers) trigger.setAttribute("data-popup-open", "");
  await waitFor(() => portals.every(({ title }, index) => title.textContent ===
    ["分享反馈", "设置", "模式", "模型与推理"][index]));
  assert.equal(document.querySelector('[role="dialog"] span').textContent, "Share feedback");
  assert.deepEqual(portals.slice(1).map(({ portal }) => portal.querySelector("[data-kbd-chord]").textContent),
    ["Fictional shortcut 1", "Fictional shortcut 2", "Fictional shortcut 3"]);
  triggers[0].removeAttribute("data-popup-open");
  await waitFor(() => portals[0].title.textContent === "Share feedback");
  triggers[0].setAttribute("data-popup-open", "");
  await waitFor(() => portals[0].title.textContent === "分享反馈");
  overlay.stop();
  assert.deepEqual(portals.map(({ title }) => title.textContent), labels);
  dom.window.close();
});

test("annotation toolbar mounts after its preview without scanning editor content", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-base-ui-portal", "");
  document.getElementById("portal-root").append(wrapper);
  await new Promise(resolve => setTimeout(resolve, 0));
  const preview = document.createElement("div");
  preview.setAttribute("role", "dialog");
  preview.setAttribute("data-open", "");
  preview.setAttribute("data-testid", "image-preview-dialog");
  preview.setAttribute("data-image-preview-dialog", "");
  preview.setAttribute("data-window-dialog-position", "fullscreen");
  const getAttribute = preview.getAttribute.bind(preview);
  preview.getAttribute = name => {
    if (name === "aria-label") throw new Error("Preview filename must not be read");
    return getAttribute(name);
  };
  wrapper.append(preview);
  await new Promise(resolve => setTimeout(resolve, 0));
  const editor = document.createElement("div");
  editor.setAttribute("data-testid", "browser-screenshot-annotation-editor");
  preview.append(editor);
  await new Promise(resolve => setTimeout(resolve, 0));
  const mount = document.createElement("div");
  mount.innerHTML = '<canvas></canvas><div contenteditable="true"><p>Save Arrow</p></div>';
  const canvas = mount.querySelector("canvas");
  canvas.getContext = () => { throw new Error("Canvas must not be accessed"); };
  const privateText = mount.querySelector("p");
  Object.defineProperty(privateText, "textContent", {
    get() { throw new Error("Annotation text must not be read"); }
  });
  editor.append(mount);
  await new Promise(resolve => setTimeout(resolve, 0));
  const before = { ...overlay.stats };
  const toolbar = document.createElement("div");
  toolbar.setAttribute("data-testid", "browser-screenshot-annotation-toolbar");
  toolbar.innerHTML = `<div><div role="radiogroup" aria-label="Annotation tool">
    ${["arrow", "rectangle", "pencil", "comment"].map((tool, index) =>
      `<button role="radio" data-value="${tool}" aria-checked="${index === 0}" data-base-ui-tooltip-trigger>
      <span><span><span>${["Arrow", "Rectangle", "Pencil", "Comment"][index]}</span></span></span></button>`).join("")}
    </div></div><div>${[["invisible", "Discard"], ["primary", "Save"]].map(([variant, label]) =>
      `<button data-variant="${variant}" data-size="small" data-base-ui-tooltip-trigger>
      <span data-component="content"><span data-component="label"><span>${label}</span></span></span></button>`).join("")}</div>`;
  mount.append(toolbar);
  await waitFor(() => toolbar.querySelector('[data-variant="primary"]').textContent.trim() === "保存");
  assert.deepEqual([...toolbar.querySelectorAll("button")].map(node => node.textContent.trim()),
    ["箭头", "矩形", "画笔", "批注", "放弃", "保存"]);
  assert.equal(overlay.stats.chromeScans, before.chromeScans + 1);
  assert.equal(overlay.stats.settingsScans, before.settingsScans);
  assert.equal(overlay.stats.portalScans, before.portalScans);
  const settled = { ...overlay.stats };
  privateText.firstChild.nodeValue = "Comment Save";
  canvas.append(document.createElement("span"));
  await new Promise(resolve => setTimeout(resolve, 0));
  for (const key of ["chromeScans", "settingsScans", "portalScans"]) {
    assert.equal(overlay.stats[key], settled[key], key);
  }
  mount.remove();
  await waitFor(() => toolbar.querySelector('[data-variant="primary"]').textContent.trim() === "Save");
  editor.append(mount);
  await waitFor(() => toolbar.querySelector('[data-variant="primary"]').textContent.trim() === "保存");
  overlay.stop();
  assert.equal(toolbar.querySelector('[data-variant="primary"]').textContent.trim(), "Save");
  dom.window.close();
});

test("new-session menu observes only command labels and its exact decorative header, not repository values", async () => {
  const dom = new JSDOM(`<body><aside data-sidebar-live-width><div data-sidebar-session-list="true"><div>
    <h3 id="sidebar-sessions-heading">Sessions</h3><div>
    <button data-testid="sidebar-new-session" id="fictional-new-session" aria-haspopup="menu"
      aria-expanded="false"></button>
    <button data-testid="sidebar-session-configuration" id="fictional-configuration" aria-haspopup="menu"
      aria-expanded="true" aria-controls="fictional-unowned-popup"></button>
    </div></div></div></aside><main data-app-shell-main><p>Start session in</p><p>Chat</p></main>
    <div id="portal-root"></div>
    ${menu("fictional-unowned-popup", "fictional-configuration", '<div><div><div role="menuitem" data-command="chat.create"><span>Chat</span></div></div></div>')}
    </body>`);
  const document = dom.window.document;
  const overlay = startSettingsTranslation(document, dictionary);
  const trigger = document.getElementById("fictional-new-session");
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-base-ui-portal", "");
  wrapper.innerHTML = `<div role="presentation" data-open><div role="menu" id="fictional-new-popup"
    aria-labelledby="${trigger.id}" data-open data-rootownerid="fictional-root"><div><div>
    <div role="menuitem" data-command="chat.create"><span>Chat</span></div>
    <div role="none"><div aria-hidden="true">Start session in</div>
    <div role="menuitem" data-command="session.create-with-repository"><span id="fictional-private-repository">Chat</span></div>
    ${[["project.add-github", "Add from GitHub"], ["project.add-from-url", "Add from URL"],
      ["project.add-folder", "Add local folder or repository"]].map(([command, label]) =>
      `<div role="menuitem" data-command="${command}"><span>${label}</span></div>`).join("")}
    </div></div></div></div></div>`;
  const privateLabel = wrapper.querySelector("#fictional-private-repository");
  Object.defineProperty(privateLabel, "textContent", {
    get() { throw new Error("Repository values must not be read"); }
  });
  Object.defineProperty(privateLabel.firstChild, "nodeValue", {
    get() { throw new Error("Repository text must not be traversed"); },
    set(value) { this.data = value; }
  });
  trigger.setAttribute("aria-controls", "fictional-new-popup");
  trigger.setAttribute("aria-expanded", "true");
  document.body.append(wrapper);
  const popup = wrapper.querySelector("[role=menu]");
  const chat = popup.querySelector('[data-command="chat.create"] > span');
  const header = popup.querySelector('[aria-hidden="true"]');
  const github = popup.querySelector('[data-command="project.add-github"] > span');
  let folder = popup.querySelector('[data-command="project.add-folder"] > span');
  await waitFor(() => folder.textContent === "添加本地文件夹或仓库" &&
    header.textContent === "在以下位置启动会话");
  assert.equal(chat.textContent, "聊天");
  assert.equal(header.textContent, "在以下位置启动会话");
  assert.equal(github.textContent, "从 GitHub 添加");
  assert.equal(popup.querySelector('[data-command="project.add-from-url"] > span').textContent, "从 URL 添加");
  assert.equal(document.getElementById("fictional-unowned-popup").querySelector("span").textContent, "Chat");
  assert.equal(document.querySelector("main").textContent, "Start session inChat");
  await new Promise(resolve => setTimeout(resolve, 0));
  const before = { ...overlay.stats };
  privateLabel.firstChild.nodeValue = "Fictional repository";
  await new Promise(resolve => setTimeout(resolve, 0));
  for (const key of ["callbacks", "chromeScans", "portalScans", "settingsScans"]) {
    assert.equal(overlay.stats[key], before[key], key);
  }
  github.parentElement.setAttribute("data-command", "session.create-with-repository");
  await waitFor(() => github.textContent === "Add from GitHub");
  const revokedBefore = { ...overlay.stats };
  github.textContent = "Fictional changed repository";
  await new Promise(resolve => setTimeout(resolve, 0));
  for (const key of ["callbacks", "chromeScans", "portalScans", "settingsScans"]) {
    assert.equal(overlay.stats[key], revokedBefore[key], key);
  }
  github.textContent = "Add from GitHub";
  github.parentElement.setAttribute("data-command", "project.add-github");
  await waitFor(() => github.textContent === "从 GitHub 添加");
  const replacement = document.createElement("span");
  replacement.textContent = "Add local folder or repository";
  folder.replaceWith(replacement);
  folder = replacement;
  await waitFor(() => folder.textContent === "添加本地文件夹或仓库");
  folder.firstChild.nodeValue = "Future action";
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(folder.textContent, "Future action");
  folder.firstChild.nodeValue = "Add local folder or repository";
  await waitFor(() => folder.textContent === "添加本地文件夹或仓库");
  header.setAttribute("aria-hidden", "false");
  await waitFor(() => header.textContent === "Start session in");
  header.setAttribute("aria-hidden", "true");
  await waitFor(() => header.textContent === "在以下位置启动会话");
  trigger.setAttribute("aria-expanded", "false");
  await waitFor(() => folder.textContent === "Add local folder or repository");
  assert.equal(header.textContent, "Start session in");
  trigger.setAttribute("aria-expanded", "true");
  await waitFor(() => folder.textContent === "添加本地文件夹或仓库");
  overlay.stop();
  assert.equal(chat.textContent, "Chat");
  assert.equal(header.textContent, "Start session in");
  dom.window.close();
});

test("sidebar section labels use fixed headings and group identities without walking project or session entries", async () => {
  const dom = new JSDOM(`<body><main data-app-shell-main><aside data-sidebar-live-width><div>
    <div data-testid="sidebar-scroll-viewport"><div><div><section aria-labelledby="sidebar-agents-heading">
      <div data-sidebar-section-header><h3 id="sidebar-agents-heading"><button aria-expanded="true"><span>Projects</span></button></h3></div>
      <ul role="tree" id="fictional-project-tree"><li role="treeitem">No projects yet</li></ul>
    </section></div></div></div>
    <div data-sidebar-session-list="true"><div><h3 id="sidebar-sessions-heading">Sessions</h3>
      <ul role="presentation"><li role="presentation"><section aria-labelledby="fictional-session-group-heading">
        <div data-sidebar-section-header><h4 id="fictional-session-group-heading"><button><span>Sessions</span></button></h4></div>
        <ul role="tree" aria-labelledby="fictional-session-group-heading" data-sidebar-session-summary-hint-group="fictional-session-group-heading">
          <li role="treeitem"><div data-testid="repository-group-row"><div id="sidebar-group-quick-chats"><span><span>Fictional private value</span><span>Fictional count</span></span><span>Chats</span></div></div></li>
          <li role="treeitem"><div><p id="fictional-session-name">Sessions</p></div></li>
        </ul>
      </section></li></ul></div></div>
    </div></aside></main><div id="portal-root"></div></body>`);
  const { document } = dom.window;
  const count = document.getElementById("sidebar-group-quick-chats").firstElementChild;
  Object.defineProperty(count, "textContent", { get() { throw new Error("Chat group count must not be read"); } });
  const overlay = startSettingsTranslation(document, dictionary);
  const tree = document.getElementById("fictional-project-tree");
  await waitFor(() => document.querySelector("#sidebar-group-quick-chats > span:last-child").textContent === "聊天" &&
    document.getElementById("sidebar-sessions-heading").textContent === "会话" && tree.textContent === "暂无项目");
  assert.equal(document.querySelector("#sidebar-agents-heading span").textContent, "项目");
  assert.equal(document.querySelector("#fictional-session-group-heading span").textContent, "会话");
  tree.innerHTML = '<li role="treeitem"><div><p id="fictional-project-name">Projects</p></div></li>';
  await new Promise(resolve => setTimeout(resolve, 0));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(document.getElementById("fictional-project-name").textContent, "Projects");
  assert.equal(document.getElementById("fictional-session-name").textContent, "Sessions");
  const before = { ...overlay.stats };
  for (let i = 0; i < 100; i++) {
    document.getElementById("fictional-project-name").textContent = `Fictional project ${i}`;
    document.getElementById("fictional-session-name").textContent = `Fictional session ${i}`;
    count.firstElementChild.textContent = `Fictional private value ${i}`;
    count.lastElementChild.textContent = String(i);
  }
  await new Promise(resolve => setTimeout(resolve, 0));
  for (const key of ["callbacks", "chromeScans", "settingsScans", "portalScans"]) assert.equal(overlay.stats[key], before[key], key);
  tree.innerHTML = '<li role="treeitem">No projects yet</li>';
  await waitFor(() => tree.textContent === "暂无项目");
  document.querySelector('[data-sidebar-session-summary-hint-group]').setAttribute("aria-labelledby", "fictional-unrelated-heading");
  await waitFor(() => document.querySelector("#sidebar-group-quick-chats > span:last-child").textContent === "Chats" &&
    document.querySelector("#fictional-session-group-heading span").textContent === "Sessions");
  overlay.stop();
  assert.equal(document.querySelector("#sidebar-agents-heading span").textContent, "Projects");
  assert.equal(tree.textContent, "No projects yet");
  dom.window.close();
});

test("unverified work and automation tabs, result content and empty states are not observed", async () => {
  const { dom, document } = fixture();
  for (const trigger of document.querySelectorAll('[aria-haspopup="menu"]')) trigger.setAttribute("aria-expanded", "false");
  const main = document.querySelector("main");
  const route = document.createElement("div");
  route.innerHTML = `<div><div><div><div data-testid="my-work-inbox-view">
    <div data-testid="my-work-list-pane"><div data-testid="my-work-filter-bar">
      <div><div data-tab-row-scroller><div role="tablist">
        <button role="tab" aria-selected="true" data-tauri-drag-region="false"><span>Assigned to me</span></button>
        <button role="tab" aria-selected="false" data-tauri-drag-region="false"><span>Mentioning me</span></button>
        <button role="tab" aria-selected="false"><span>Done</span></button>
      </div></div></div>
    </div><div><div data-testid="my-work-inbox-scroll-container" role="tabpanel" data-f6-nav>
      <div><div data-size="medium"><div><div><span>Nothing here</span></div></div></div></div>
      <article><h2>Assigned to me</h2><p>Nothing here</p></article>
    </div></div></div>
  </div></div></div></div>`;
  main.append(route);
  const overlay = startSettingsTranslation(document, dictionary);
  await new Promise(resolve => setTimeout(resolve, 50));
  const before = { ...overlay.stats };
  const initial = route.textContent;
  route.querySelector("article p").firstChild.nodeValue = "Done";
  document.querySelector(".chat p").firstChild.nodeValue = "Nothing here";
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(route.querySelector('[role="tab"]').textContent, "Assigned to me");
  assert.equal(route.querySelector('[data-size="medium"]').textContent, "Nothing here");
  route.remove();
  const automation = document.createElement("div");
  automation.innerHTML = `<header><h1>Automations</h1><div><div data-tab-row-scroller>
    <div role="tablist"><button role="tab">Done</button></div>
  </div></div></header><div data-testid="workflow-gallery-card"><h2>Assigned to me</h2><p>Nothing here</p></div>`;
  main.append(automation);
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(automation.querySelector('[role="tab"]').textContent, "Done");
  assert.equal(automation.querySelector("h2").textContent, "Assigned to me");
  assert.ok(initial.includes("Mentioning me"));
  assert.equal(route.querySelector('[role="tab"]').getAttribute("aria-selected"), "true");
  for (const key of ["settingsScans", "portalScans", "chromeScans"]) {
    assert.equal(overlay.stats[key], before[key], `${key} changed for unverified page content`);
  }
  overlay.stop();
  dom.window.close();
});

test("New issue translates only the Issues header action and leaves result content untouched", async () => {
  const { dom, document } = fixture();
  for (const trigger of document.querySelectorAll('[aria-haspopup="menu"]')) trigger.setAttribute("aria-expanded", "false");
  const main = document.querySelector("main[data-app-shell-main]");
  const route = document.createElement("div");
  route.innerHTML = `<div><div><div><div data-testid="my-work-inbox-view">
    <div data-testid="my-work-list-pane"><header data-content-leading-inset="true" data-tauri-drag-region="true" data-f6-nav="true">
      <div><button data-command="issue.create"><div><span>New issue</span></div></button></div>
      <div><div><h1>Issues</h1></div></div>
    </header><article><h2>Fictional issue title</h2><p>New issue</p></article></div>
  </div></div></div></div>`;
  main.append(route);
  const overlay = startSettingsTranslation(document, dictionary);
  const label = route.querySelector('button[data-command="issue.create"] span');
  await waitFor(() => label.textContent === "新建议题");
  assert.equal(route.querySelector("article h2").textContent, "Fictional issue title");
  assert.equal(route.querySelector("article p").textContent, "New issue");
  overlay.stop();
  assert.equal(label.textContent, "New issue");
  dom.window.close();
});

test("all chat activity notifications stay English even with matching dictionary entries", async () => {
  const { dom, document } = fixture();
  for (const trigger of document.querySelectorAll('[aria-haspopup="menu"]')) trigger.setAttribute("aria-expanded", "false");
  const texts = ["Thinking", "Thinking…", "Thinking...", "Thought for 2 seconds", "Sent message to user",
    "Reasoning", "Tool calls", "Code search", "Reading files", "Creating files", "Editing files",
    "Running CLI commands", "CLI commands finish running", "Changing models and agents", "Compacting the conversation"];
  const chat = document.querySelector(".chat");
  chat.replaceChildren(...texts.map(text => {
    const node = document.createElement("p");
    node.textContent = text;
    return node;
  }));
  const overlay = startSettingsTranslation(document, {
    ...dictionary, ...Object.fromEntries(texts.map(text => [text, "SHOULD NOT TRANSLATE"]))
  });
  await waitFor(() => document.querySelector('[data-testid="artifact-files-pill"]').textContent === "产物2");
  await new Promise(resolve => setTimeout(resolve, 10));
  const before = { ...overlay.stats };
  for (const node of chat.children) {
    node.firstChild.nodeValue = "Thinking…";
    node.firstChild.nodeValue = texts[[...chat.children].indexOf(node)];
  }
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.deepEqual([...chat.children].map(node => node.textContent), texts);
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) {
    assert.equal(overlay.stats[key], before[key], `${key} changed for thinking/tool updates`);
  }
  overlay.stop();
  assert.deepEqual([...chat.children].map(node => node.textContent), texts);
  dom.window.close();
});

test("translates command-owned sidebar buttons without changing selection, shortcuts or user names", async () => {
  const { dom, document } = sidebarFixture();
  const nav = document.querySelector("#fixed-navigation nav");
  const wrong = document.createElement("li");
  wrong.innerHTML = '<button data-sidebar-nav-item="issues" data-command="navigation.pulls"><span>Issues</span></button>';
  nav.querySelector("ul").append(wrong);
  const overlay = startSettingsTranslation(document, dictionary);
  const buttons = [...nav.querySelectorAll("button")].slice(0, 5);
  await waitFor(() => buttons[4].querySelector("span").textContent === "扩展中心");
  assert.deepEqual(buttons.map(button => button.querySelector("span").textContent),
    ["新建", "拉取请求", "议题", "自动化", "扩展中心"]);
  assert.ok(buttons.every(button => button.getAttribute("data-selected") === "false"));
  assert.ok(buttons.every(button => button.querySelector("kbd").textContent === "Ctrl+1" && button.querySelector("svg")));
  assert.equal(wrong.textContent, "Issues");
  assert.deepEqual([...document.querySelectorAll("#session-list button")].map(node => node.textContent),
    ["New", "Pull requests", "Issues"]);
  let clicks = 0;
  buttons[0].addEventListener("click", () => clicks++);
  buttons[0].click();
  assert.equal(clicks, 1);
  await new Promise(resolve => setTimeout(resolve, 10));
  const before = { ...overlay.stats };
  document.querySelector("#chat p").firstChild.nodeValue = "Pull requests";
  document.querySelector("#session-list button").firstChild.nodeValue = "Issues";
  const session = document.createElement("li");
  session.innerHTML = '<button data-sidebar-nav-item="issues" data-command="navigation.issues">Issues</button>';
  document.getElementById("session-list").append(session);
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(session.textContent, "Issues");
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) {
    assert.equal(overlay.stats[key], before[key], `${key} changed for chat or session names`);
  }
  overlay.stop();
  assert.deepEqual(buttons.map(button => button.querySelector("span").textContent),
    ["New", "Pull requests", "Issues", "Automations", "Customize"]);
  dom.window.close();
});

test("discovers delayed and replaced sidebar navigation and restores changed button ownership", async () => {
  const { dom, document } = sidebarFixture(false);
  const overlay = startSettingsTranslation(document, dictionary);
  const container = document.getElementById("fixed-navigation");
  container.innerHTML = sidebarNavigation();
  await waitFor(() => container.querySelector('[data-sidebar-nav-item="issues"] span').textContent === "议题");
  const oldNav = container.firstElementChild;
  container.innerHTML = sidebarNavigation();
  await waitFor(() => container.querySelector('[data-sidebar-nav-item="home"] span').textContent === "新建");
  assert.equal(oldNav.querySelector('[data-sidebar-nav-item="home"] span').textContent, "New");
  const viewport = document.querySelector('[data-testid="sidebar-scroll-viewport"]');
  const replacement = document.createElement("div");
  replacement.setAttribute("data-testid", "sidebar-scroll-viewport");
  replacement.innerHTML = `<div id="replacement-navigation">${sidebarNavigation()}</div><ul><li>Issues</li></ul>`;
  viewport.replaceWith(replacement);
  await waitFor(() => replacement.querySelector('[data-sidebar-nav-item="issues"] span').textContent === "议题");
  const button = replacement.querySelector('[data-sidebar-nav-item="issues"]');
  button.setAttribute("data-command", "navigation.pulls");
  await waitFor(() => button.querySelector("span").textContent === "Issues");
  button.setAttribute("data-command", "navigation.issues");
  await waitFor(() => button.querySelector("span").textContent === "议题");
  button.setAttribute("data-user-content", "");
  await waitFor(() => button.querySelector("span").textContent === "Issues");
  button.removeAttribute("data-user-content");
  await waitFor(() => button.querySelector("span").textContent === "议题");
  button.querySelector("span span span span").firstChild.nodeValue = "Personal issue name";
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(button.querySelector("span").textContent, "Personal issue name");
  const sidebar = document.querySelector("[data-sidebar-live-width]");
  sidebar.remove();
  await new Promise(resolve => setTimeout(resolve, 10));
  const before = { ...overlay.stats };
  replacement.querySelector("#replacement-navigation").innerHTML = sidebarNavigation();
  document.querySelector("#chat p").firstChild.nodeValue = "New";
  await new Promise(resolve => setTimeout(resolve, 10));
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) {
    assert.equal(overlay.stats[key], before[key], `${key} changed after sidebar removal`);
  }
  overlay.stop();
  dom.window.close();
});

test("profile fixed labels translate at different text depths while identity and credits remain English", async () => {
  const { dom, document } = fixture();
  const popup = document.getElementById("profile-popup-generated");
  const switchItem = document.createElement("div");
  switchItem.setAttribute("role", "menuitem");
  switchItem.innerHTML = "<span><span><span><span>Switch account</span></span></span></span>";
  popup.insertBefore(switchItem, popup.firstChild);
  const identity = document.createElement("div");
  identity.innerHTML = "<span>Theme</span><span>fictional@example.invalid</span>";
  popup.insertBefore(identity, popup.firstChild);
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => switchItem.textContent === "切换账号" &&
    document.getElementById("theme-trigger-generated").textContent === "主题" &&
    [...popup.querySelectorAll('[role="menuitem"]')].some(item => item.textContent === "键盘快捷键") &&
    [...popup.querySelectorAll('[role="menuitem"]')].some(item => item.textContent === "退出登录"));
  assert.ok([...popup.querySelectorAll('[role="menuitem"]')].some(item => item.textContent === "键盘快捷键"));
  assert.ok([...popup.querySelectorAll('[role="menuitem"]')].some(item => item.textContent === "退出登录"));
  assert.equal(identity.textContent, "Themefictional@example.invalid");
  const credits = popup.querySelector(":scope > div:last-child span span");
  assert.equal(credits.textContent, "AI credits used: 13%");
  credits.firstChild.nodeValue = "AI credits used: 20.5%";
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(credits.textContent, "AI credits used: 20.5%");
  const scans = overlay.stats.portalScans;
  identity.firstElementChild.firstChild.nodeValue = "Sign out";
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(identity.firstElementChild.textContent, "Sign out");
  assert.equal(overlay.stats.portalScans, scans);
  overlay.stop();
  assert.equal(switchItem.textContent, "Switch account");
  assert.equal(document.getElementById("theme-trigger-generated").textContent, "Theme");
  assert.equal(credits.textContent, "AI credits used: 20.5%");
  dom.window.close();
});

test("submenu ownership ignores semantic hidden mirrors and shortcuts, not duplicate visible labels", async () => {
  const { dom, document } = fixture();
  const theme = document.getElementById("theme-trigger-generated");
  const permissions = document.getElementById("permissions-trigger-generated");
  const modeTitle = document.getElementById("mode-title-generated");
  theme.innerHTML = '<span aria-hidden="true">Theme</span><span>Theme</span><kbd>Ctrl+T</kbd>';
  permissions.innerHTML = '<span aria-hidden="true">Tool permissions</span><span>Tool permissions</span>';
  modeTitle.innerHTML = '<span aria-hidden="true">Mode</span><span>Mode</span>';
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.querySelector("#theme-popup-generated [role=menuitemradio] span").textContent === "系统" &&
    document.querySelector("#permissions-popup-generated [role=menuitemradio]:last-child span").textContent === "全部允许" &&
    document.querySelector("#permissions-popup-generated [role=menuitemradio]:last-child [data-menu-description]").textContent === "运行工具前不再询问。");
  assert.equal(theme.querySelector("kbd").textContent, "Ctrl+T");
  assert.equal(permissions.querySelector('span:not([aria-hidden])').textContent, "工具权限");
  assert.equal(modeTitle.querySelector('span:not([aria-hidden])').textContent, "模式");
  assert.deepEqual([...document.querySelectorAll("#permissions-popup-generated [data-menu-description]")].map(node => node.textContent),
    ["运行工具前询问。", "使用 AI 减少审批提示。", "运行工具前不再询问。"]);
  permissions.innerHTML = "<span>Tool permissions</span><span>Tool permissions</span>";
  await waitFor(() => document.querySelector("#permissions-popup-generated [role=menuitemradio] span").textContent === "Always ask");
  overlay.stop();
  assert.equal(theme.querySelector('span:not([aria-hidden])').textContent, "Theme");
  dom.window.close();
});

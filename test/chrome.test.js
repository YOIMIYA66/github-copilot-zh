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
  await new Promise(resolve => setTimeout(resolve, 50));
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
  const english = "Prioritizes the most capable models for the most demanding tasks and complex reasoning.";
  description.textContent = english;
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => row.querySelector("button span").textContent === "开启" && description.textContent === dictionary[english]);
  assert.deepEqual([...popup.querySelectorAll("[data-auto-tier-id]")].map(node => node.textContent), ["Standard", "High", "Max"]);
  assert.equal(row.querySelector("[data-user-content]").textContent, "On");
  row.querySelector("button").setAttribute("aria-checked", "false");
  row.querySelector("button span").firstChild.nodeValue = "Off";
  await waitFor(() => row.querySelector("button span").textContent === "关闭");
  assert.equal(row.querySelector("button").getAttribute("aria-checked"), "false");
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

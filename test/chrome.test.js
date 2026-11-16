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
    ["协作", "规划", "自动执行"]);
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

test("owned mode presentation translates without changing mode enums or transcript text", async () => {
  const { dom, document } = fixture();
  const trigger = document.getElementById("mode-trigger-generated");
  const popup = document.getElementById("mode-popup-generated");
  const choices = [...popup.querySelectorAll('[role="menuitemradio"]')];
  for (const [index, item] of choices.entries()) item.setAttribute("aria-checked", String(index === 1));
  const chat = document.querySelector(".chat");
  chat.insertAdjacentHTML("beforeend", "<p>Interactive Plan Autopilot Thinking</p>");
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => trigger.textContent === "协作" && choices[2].firstElementChild.textContent === "自动执行");
  assert.deepEqual(choices.map(item => item.getAttribute("aria-checked")), ["false", "true", "false"]);
  assert.equal(trigger.getAttribute("aria-label"), "模式：协作，Ctrl + Shift + M");
  assert.equal(chat.lastElementChild.textContent, "Interactive Plan Autopilot Thinking");
  trigger.firstChild.nodeValue = "Plan";
  trigger.setAttribute("aria-label", "Mode: Plan, Ctrl + Shift + M");
  await waitFor(() => trigger.textContent === "规划");
  assert.equal(dictionary.Plan, "套餐");
  overlay.stop();
  assert.equal(trigger.textContent, "Plan");
  assert.equal(trigger.getAttribute("aria-label"), "Mode: Plan, Ctrl + Shift + M");
  assert.deepEqual(choices.map(item => item.firstElementChild.textContent), ["Interactive", "Plan", "Autopilot"]);
  dom.window.close();
});

test("native fixed auto tiers translate only verified enum label slots in the model menu", async () => {
  const { dom, document } = fixture();
  const popup = document.getElementById("model-popup-generated");
  for (const item of popup.querySelectorAll("[data-auto-tier-id]")) item.remove();
  const wrapper = document.createElement("div");
  wrapper.setAttribute("role", "none");
  wrapper.innerHTML = `<div role="none">${[["balance", "Standard"], ["hydrafusion", "High"], ["hydrafusion-max", "Max"]]
    .map(([id, word], index) => `<div role="menuitemradio" id="native-tier-${index}" aria-checked="${index === 0}"
      data-auto-tier-id="${id}" aria-label="opaque accessibility label" aria-describedby="opaque-description"
      aria-setsize="3" aria-posinset="${index + 1}"><span aria-hidden="true"><svg></svg></span>
      <span><span><span>${word}</span></span></span></div>`).join("")}
      <div data-auto-tier-id="unknown"><span>Opaque model name</span></div></div>`;
  popup.append(wrapper);
  const opaque = wrapper.querySelector('[data-auto-tier-id="unknown"] span').firstChild;
  Object.defineProperty(opaque, "nodeValue", {
    configurable: true, get() { throw new Error("Unknown model value must not be read"); }
  });
  const items = [...wrapper.querySelectorAll('[role="menuitemradio"]')];
  const labels = items.map(item => item.lastElementChild.firstElementChild.firstElementChild);
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => labels[0].textContent === "标准" && labels[2].textContent === "最高");
  assert.deepEqual(labels.map(node => node.textContent), ["标准", "高", "最高"]);
  assert.deepEqual(items.map(item => item.getAttribute("aria-checked")), ["true", "false", "false"]);
  items[0].setAttribute("data-auto-tier-id", "unverified");
  await waitFor(() => labels[0].textContent === "Standard");
  overlay.stop();
  assert.deepEqual(labels.map(node => node.textContent), ["Standard", "High", "Max"]);
  delete opaque.nodeValue;
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
    ["协作", "规划", "自动执行"]);
  footer.removeAttribute("data-rich-composer-footer");
  await waitFor(() => title.textContent === "Mode");
  assert.equal(document.querySelector("#model-popup-generated [role=none] div").textContent, "Effort level");
  overlay.stop();
  dom.window.close();
});

test("nested DIV actions separate fixed labels from selected values and keep inert parent menus as owners", async () => {
  const { dom, document } = fixture();
  document.getElementById("mode-trigger-generated").setAttribute("aria-label", "模式：协作, Ctrl + Shift + M");
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
  assert.equal(document.getElementById("mode-trigger-generated").getAttribute("aria-label"), "模式：协作, Ctrl + Shift + M");
  assert.deepEqual([...mode.querySelectorAll("[role=menuitemradio] > span:first-child")].map(node => node.textContent),
    ["协作", "规划", "自动执行"]);
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

test("New issue supports the native component label and revokes ownership when the action changes", async () => {
  const { dom, document } = fixture();
  const main = document.querySelector("main[data-app-shell-main]");
  const route = document.createElement("div");
  route.innerHTML = `<div><div><div><div data-testid="my-work-inbox-view">
    <div data-testid="my-work-list-pane"><header data-content-leading-inset="true" data-tauri-drag-region="true" data-f6-nav="true">
      <div><button data-command="issue.create"><span data-component="content"><span data-component="label">New issue</span></span></button></div>
      <div><div><h1>Issues</h1></div></div></header>
      <article><span data-component="label">New issue</span></article>
    </div></div></div></div></div>`;
  main.append(route);
  const overlay = startSettingsTranslation(document, dictionary);
  const button = route.querySelector('button[data-command="issue.create"]');
  const label = button.querySelector('[data-component="label"]');
  await waitFor(() => label.textContent === "新建议题");
  assert.equal(route.querySelector("article span").textContent, "New issue");
  button.removeAttribute("data-command");
  await waitFor(() => label.textContent === "New issue");
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

test("overlay never reads or rewrites transcript content, existing Chinese statuses or input values", async () => {
  const { dom, document } = fixture();
  for (const trigger of document.querySelectorAll('[aria-haspopup="menu"]')) trigger.setAttribute("aria-expanded", "false");
  const chat = document.querySelector(".chat");
  chat.innerHTML = `<button>Thinking</button><button>Thought for 3 seconds</button>
    <button>思考了 3 秒</button><p>General</p><pre><code>Theme</code></pre>
    <div role="log">Tool calls</div><textarea>Private draft</textarea><input value="Private value">`;
  const content = chat.innerHTML;
  const reads = [];
  const writes = [];
  const textNodes = [...chat.querySelectorAll("*")].flatMap(element =>
    [...element.childNodes].filter(node => node.nodeType === 3));
  const valueNodes = [...chat.querySelectorAll("input,textarea")];
  const guards = [
    ...textNodes.map(node => [node, "nodeValue", dom.window.Node.prototype]),
    ...[chat, ...chat.querySelectorAll("*")].map(node => [node, "textContent", dom.window.Node.prototype]),
    ...valueNodes.map(node => [node, "value", Object.getPrototypeOf(node)])
  ];
  for (const [node, key, prototype] of guards) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    Object.defineProperty(node, key, {
      configurable: true,
      get() { reads.push(key); return descriptor.get.call(this); },
      set(value) { writes.push(key); descriptor.set.call(this, value); }
    });
  }
  const observed = [];
  const observerPrototype = dom.window.MutationObserver.prototype;
  const observe = observerPrototype.observe;
  observerPrototype.observe = function (target, options) {
    observed.push({ target, options });
    return observe.call(this, target, options);
  };
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.querySelector('[data-testid="artifact-files-pill"]').textContent === "产物2");
  const status = chat.querySelector("button").firstChild;
  const nodeValue = Object.getOwnPropertyDescriptor(dom.window.Node.prototype, "nodeValue");
  nodeValue.set.call(status, "Thinking…");
  await new Promise(resolve => setTimeout(resolve, 10));
  overlay.stop();
  const replacement = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.querySelector('[data-testid="artifact-files-pill"]').textContent === "产物2");
  replacement.stop();
  assert.deepEqual(reads, [], "Transcript text and input values must not be read");
  assert.deepEqual(writes, [], "Transcript text and input values must not be rewritten");
  assert.ok(observed.every(({ target, options }) => !chat.contains(target) &&
    !(options.subtree && target.contains(chat))), "Transcript must not be observed");
  for (const [node, key] of guards) delete node[key];
  observerPrototype.observe = observe;
  assert.equal(chat.innerHTML, content.replace(">Thinking<", ">Thinking…<"));
  assert.deepEqual(valueNodes.map(node => node.value), ["Private draft", "Private value"]);
  dom.window.close();
});

function feedbackFixture({ shortcut = false } = {}) {
  const dom = new JSDOM(`<body><main><p>Thinking</p><p>Cancel</p></main>
    <nav data-sidebar-footer><button data-testid="sidebar-feedback-button" aria-haspopup="dialog"
      aria-expanded="true" aria-controls="fictional-feedback" data-trigger-disabled></button></nav>
    <div id="portal-root"></div><div data-base-ui-portal><div role="presentation" data-open>
      <div id="fictional-feedback" role="dialog" data-open data-base-ui-focusable data-f6-focus-trap>
        <div><div><div><label><span>Fictional feedback title</span>
          <textarea data-selectable="true" aria-describedby="fictional-public"
            placeholder="What feedback would you like to share?">Private draft</textarea></label>
          <p id="fictional-public">This will be posted as a public GitHub issue.</p>
          <div><button><span data-component="content"><span data-component="label">Cancel</span></span></button>
            <button aria-describedby="fictional-public"><span data-component="content">
              <span data-component="label">Share feedback</span>${shortcut
                ? '<span data-component="keyShortcut"><span data-kbd-chord="true"><kbd>Private modifier</kbd><kbd>Private key</kbd></span></span>'
                : ""}</span></button></div>
        </div></div></div>
      </div></div></div></body>`);
  const document = dom.window.document;
  return { dom, document, popup: document.getElementById("fictional-feedback"),
    trigger: document.querySelector('[data-testid="sidebar-feedback-button"]') };
}

test("feedback fixed copy uses exact trigger and field ownership without reading the title or draft", async () => {
  const { dom, document, popup, trigger } = feedbackFixture({ shortcut: true });
  const textarea = popup.querySelector("textarea");
  const title = popup.querySelector("label span");
  const shortcut = popup.querySelector('[data-component="keyShortcut"]');
  const privateNodes = [title.firstChild, textarea.firstChild, ...[...shortcut.querySelectorAll("kbd")].map(key => key.firstChild)];
  let privateReads = 0;
  for (const node of privateNodes) Object.defineProperty(node, "nodeValue", {
    configurable: true, get() { privateReads++; return "Private"; }
  });
  Object.defineProperty(textarea, "value", { configurable: true, get() { privateReads++; return "Private"; } });
  const shortcutElements = [shortcut, ...shortcut.querySelectorAll("*")];
  for (const element of shortcutElements) Object.defineProperty(element, "textContent", {
    configurable: true, get() { privateReads++; return "Private"; }
  });
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => textarea.placeholder === "请填写你想分享的反馈。" &&
    popup.querySelector("p").textContent === "反馈将发布为公开的 GitHub 议题。" &&
    popup.querySelectorAll('[data-component="label"]')[1].textContent === "分享反馈");
  assert.equal(popup.querySelector('[data-component="label"]').textContent, "取消");
  assert.equal(title.textContent, "Fictional feedback title");
  assert.equal(document.querySelector("main").textContent, "ThinkingCancel");
  assert.equal(privateReads, 0);
  await new Promise(resolve => setTimeout(resolve, 10));
  const before = overlay.stats.callbacks;
  const nodeValue = Object.getOwnPropertyDescriptor(dom.window.Node.prototype, "nodeValue");
  nodeValue.set.call(textarea.firstChild, "Edited private draft");
  nodeValue.set.call(shortcut.querySelector("kbd").firstChild, "Host shortcut update");
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(overlay.stats.callbacks, before, "Draft updates must not be observed");
  trigger.setAttribute("aria-expanded", "false");
  await waitFor(() => textarea.placeholder === "What feedback would you like to share?" &&
    popup.querySelector('[data-component="label"]').textContent === "Cancel");
  assert.equal(popup.querySelector("p").textContent, "This will be posted as a public GitHub issue.");
  trigger.setAttribute("aria-expanded", "true");
  await waitFor(() => textarea.placeholder === "请填写你想分享的反馈。");
  textarea.setAttribute("placeholder", "Host replacement placeholder");
  await waitFor(() => popup.querySelector('[data-component="label"]').textContent === "Cancel");
  assert.equal(textarea.placeholder, "Host replacement placeholder");
  assert.equal(privateReads, 0);
  overlay.stop();
  for (const node of privateNodes) delete node.nodeValue;
  for (const element of shortcutElements) delete element.textContent;
  delete textarea.value;
  assert.equal(textarea.value, "Edited private draft");
  assert.equal(shortcut.querySelector("kbd").textContent, "Host shortcut update");
  dom.window.close();
});

test("feedback dialogs with missing field links, extra content or competing owners stay unchanged", async () => {
  for (const breakOwnership of [
    ({ popup }) => popup.querySelector("textarea").setAttribute("aria-describedby", "unrelated"),
    ({ popup }) => popup.querySelector("button:last-child").removeAttribute("aria-describedby"),
    ({ popup, document }) => popup.querySelector("label").parentElement.append(document.createElement("article")),
    ({ popup, document }) => popup.querySelectorAll('[data-component="content"]')[1].append(document.createElement("input")),
    ({ popup, document }) => popup.querySelector('[data-component="content"]').append(document.createElement("span")),
    ({ trigger }) => trigger.parentElement.append(trigger.cloneNode(true)),
    ({ popup }) => popup.removeAttribute("data-f6-focus-trap")
  ]) {
    const context = feedbackFixture();
    breakOwnership(context);
    const { dom, document, popup } = context;
    const original = popup.innerHTML;
    const overlay = startSettingsTranslation(document, dictionary);
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(popup.innerHTML, original);
    overlay.stop();
    dom.window.close();
  }
});

function sessionContextFixture(coding) {
  const dom = new JSDOM(`<body><main><p>Thinking</p><p>Rename</p></main>
    <aside data-sidebar-root><ul><li role="treeitem" data-testid="quick-chat-session-row">
      <span id="private-session-name">Rename</span></li></ul></aside><div id="portal-root"></div></body>`);
  const { document } = dom.window;
  const entries = [
    ["Rename", null], ["Pin", "session.pin.set"], ["Mark as unread", "session.read.set"],
    ["Show in Explorer", "session.reveal"], ["Share as secret gist", "session.share-gist"],
    ["Copy", null, true], ...(coding ? [["Open in…", null, true], ["Create nested session", null]] : []),
    ["Archive", "session.archive"], ["Delete", "session.delete"]
  ];
  const item = (entry, index) => {
    const [label, command, submenu] = entry;
    return `<div role="menuitem" id="fictional-item-${index}" tabindex="-1" aria-setsize="${entries.length}"
      aria-posinset="${index + 1}" ${command ? `data-command="${command}"` : ""}
      ${submenu ? 'aria-haspopup="menu" aria-expanded="false"' : ""}>
      <span><svg aria-hidden="true"></svg></span>${submenu
        ? `<span>${label}</span><svg aria-hidden="true"></svg>`
        : `<span><span>${label}</span></span>`}</div>`;
  };
  const separator = '<div role="none" data-menu-separator></div>';
  const portal = document.createElement("div");
  portal.id = "fictional-session-portal";
  portal.setAttribute("data-base-ui-portal", "");
  portal.innerHTML = `<div role="presentation" data-open data-side="bottom"><div role="menu" id="fictional-session-menu"
    data-open data-base-ui-focusable data-rootownerid="fictional-owner"><div role="group">
      ${entries.slice(0, 6).map(item).join("")}</div>${separator}
      ${coding ? item(entries[6], 6) + separator + item(entries[7], 7) + separator : ""}
      ${entries.slice(-2).map((entry, index) => item(entry, entries.length - 2 + index)).join("")}
    </div></div>`;
  document.body.append(portal);
  return { dom, document, portal, menu: portal.querySelector('[role="menu"]'), entries };
}

test("native session context actions translate only fixed command-signature leaves", async () => {
  for (const coding of [false, true]) {
    const { dom, document, portal, menu, entries } = sessionContextFixture(coding);
    const name = document.getElementById("private-session-name");
    Object.defineProperty(name.firstChild, "nodeValue", {
      configurable: true, get() { throw new Error("Session name must not be read"); }
    });
    const overlay = startSettingsTranslation(document, dictionary);
    const labels = [...menu.querySelectorAll('[role="menuitem"]')].map(item =>
      item.children[1].firstElementChild || item.children[1]);
    await waitFor(() => labels.at(-1).textContent === "删除");
    assert.deepEqual(labels.map(node => node.textContent), entries.map(([word]) => dictionary[word]));
    assert.equal(document.querySelector("main").textContent, "ThinkingRename");
    assert.equal(name.textContent, "Rename");
    portal.remove();
    await waitFor(() => labels.every((node, index) => node.textContent === entries[index][0]));
    document.body.append(portal);
    await waitFor(() => labels.at(-1).textContent === "删除");
    menu.querySelector('[data-command="session.pin.set"]').setAttribute("data-command", "fictional");
    await waitFor(() => labels.every((node, index) => node.textContent === entries[index][0]));
    portal.remove();
    document.body.append(portal);
    menu.querySelector('[data-command="fictional"]').setAttribute("data-command", "session.pin.set");
    await waitFor(() => labels.at(-1).textContent === "删除");
    const changed = labels[0];
    changed.firstChild.nodeValue = "Host replacement";
    await waitFor(() => labels.at(-1).textContent === "Delete");
    assert.equal(changed.textContent, "Host replacement");
    overlay.stop();
    delete name.firstChild.nodeValue;
    portal.remove();
    dom.window.close();
  }
});

test("retained native session menus restore on close and translate again on metadata-only reopen", async () => {
  for (const coding of [false, true]) {
    const { dom, document, portal, menu, entries } = sessionContextFixture(coding);
    const presentation = menu.parentElement;
    const labels = [...menu.querySelectorAll('[role="menuitem"]')].map(item =>
      item.children[1].firstElementChild || item.children[1]);
    const overlay = startSettingsTranslation(document, dictionary);
    for (let iteration = 0; iteration < 3; iteration++) {
      await waitFor(() => labels.at(-1).textContent === "删除");
      menu.removeAttribute("data-open");
      presentation.removeAttribute("data-open");
      await waitFor(() => labels.every((node, index) => node.textContent === entries[index][0]));
      const descriptors = labels.map(label => Object.getOwnPropertyDescriptor(label.firstChild, "nodeValue"));
      for (const label of labels) Object.defineProperty(label.firstChild, "nodeValue", {
        configurable: true, get() { throw new Error("Closed menu text must not be read"); }
      });
      presentation.setAttribute("data-side", "bottom");
      await new Promise(resolve => setTimeout(resolve, 20));
      for (const [index, label] of labels.entries()) {
        if (descriptors[index]) Object.defineProperty(label.firstChild, "nodeValue", descriptors[index]);
        else delete label.firstChild.nodeValue;
      }
      presentation.setAttribute("data-open", "");
      menu.setAttribute("data-open", "");
      assert.equal(menu.parentElement, presentation);
      assert.equal(presentation.parentElement, portal);
    }
    await waitFor(() => labels.at(-1).textContent === "删除");
    overlay.stop();
    assert.deepEqual(labels.map(node => node.textContent), entries.map(([word]) => word));
    menu.removeAttribute("data-open");
    menu.setAttribute("data-open", "");
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(labels.at(-1).textContent, "Delete");
    dom.window.close();
  }
});

test("successive fully mounted chat and coding context menus are discovered after closing", async () => {
  const initial = sessionContextFixture(false);
  initial.portal.remove();
  const overlay = startSettingsTranslation(initial.document, dictionary);
  for (const coding of [false, true, false, true]) {
    const fixture = sessionContextFixture(coding);
    const portal = initial.document.importNode(fixture.portal, true);
    fixture.dom.window.close();
    initial.document.body.append(portal);
    const labels = [...portal.querySelectorAll('[role="menuitem"]')].map(item =>
      item.children[1].firstElementChild || item.children[1]);
    await waitFor(() => labels.at(-1).textContent === "删除");
    assert.deepEqual(labels.map(node => node.textContent), fixture.entries.map(([word]) => dictionary[word]));
    portal.remove();
    await waitFor(() => labels.at(-1).textContent === "Delete");
  }
  overlay.stop();
  initial.dom.window.close();
});

test("unrelated menus and malformed session context signatures remain untouched", async () => {
  for (const breakOwnership of [
    ({ menu }) => menu.querySelector('[data-command="session.archive"]').removeAttribute("data-command"),
    ({ menu }) => menu.querySelector('[aria-posinset="2"]').setAttribute("aria-posinset", "3"),
    ({ menu }) => menu.setAttribute("aria-labelledby", "unrelated"),
    ({ menu }) => menu.querySelector('[aria-haspopup="menu"]').removeAttribute("aria-haspopup"),
    ({ menu }) => menu.querySelector('[role="none"]').removeAttribute("data-menu-separator"),
    ({ portal }) => portal.firstElementChild.setAttribute("data-side", "top")
  ]) {
    const context = sessionContextFixture(false);
    breakOwnership(context);
    const original = context.menu.innerHTML;
    const overlay = startSettingsTranslation(context.document, dictionary);
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(context.menu.innerHTML, original);
    overlay.stop();
    context.dom.window.close();
  }
});

test("native session context actions support toggled Unpin, Mark as read, and Unarchive states", async () => {
  const context = sessionContextFixture(false);
  const replacements = new Map([
    ["session.pin.set", "Unpin"],
    ["session.read.set", "Mark as read"],
    ["session.archive", "Unarchive"]
  ]);
  for (const [command, nextLabel] of replacements) {
    const item = context.menu.querySelector(`[data-command="${command}"]`);
    item.querySelector("span > span").firstChild.nodeValue = nextLabel;
  }
  const overlay = startSettingsTranslation(context.document, dictionary);
  const labels = [...context.menu.querySelectorAll('[role="menuitem"]')].map(item =>
    item.children[1].firstElementChild || item.children[1]);
  await waitFor(() => labels[1].textContent === dictionary.Unpin &&
    labels[2].textContent === dictionary["Mark as read"] &&
    labels[6].textContent === dictionary.Unarchive);
  overlay.stop();
  assert.equal(labels[1].textContent, "Unpin");
  assert.equal(labels[2].textContent, "Mark as read");
  assert.equal(labels[6].textContent, "Unarchive");
  context.dom.window.close();
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

test("sidebar session configuration menu and nested submenus translate and restore cleanly", async () => {
  const dom = new JSDOM(`<body>
    <button data-testid="sidebar-session-configuration" id="session-config-trigger"
      aria-haspopup="menu" aria-expanded="true" aria-controls="session-config-menu" aria-label="Configure sessions"></button>
    <div id="portal-root">
      <div data-base-ui-portal>
        <div role="presentation" data-open>
          <div role="menu" id="session-config-menu" data-open data-rootownerid="config-owner" aria-labelledby="session-config-trigger">
            <div role="menuitem" id="config-grouping-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="grouping-menu"><span>Grouping</span></div>
            <div role="menuitem" id="config-ordering-trigger" aria-haspopup="menu" aria-expanded="true" aria-controls="ordering-menu"><span>Ordering</span></div>
            <div role="menuitem"><span>Reset filters</span></div>
            <div role="menuitem"><span>Collapse all</span></div>
            <div role="menuitem"><span>Mark all as read</span></div>
          </div>
        </div>
      </div>
      <div data-base-ui-portal>
        <div role="presentation" data-open>
          <div role="menu" id="ordering-menu" data-open data-rootownerid="config-owner" aria-labelledby="config-ordering-trigger">
            <div role="menuitemradio" aria-checked="true"><span>Updated</span></div>
            <div role="menuitemradio" aria-checked="false"><span>Created</span></div>
            <div role="menuitemradio" aria-checked="false"><span>Name (A-Z)</span></div>
          </div>
        </div>
      </div>
    </div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const trigger = document.getElementById("session-config-trigger");
  const grouping = document.querySelector("#config-grouping-trigger span");
  const ordering = document.querySelector("#config-ordering-trigger span");
  const updatedRadio = document.querySelector('#ordering-menu [role="menuitemradio"] span');

  await waitFor(() => trigger.getAttribute("aria-label") === "配置会话" &&
    grouping.textContent === "分组" &&
    ordering.textContent === "排序" &&
    updatedRadio.textContent === "更新时间" &&
    document.querySelector('#ordering-menu [role="menuitemradio"]:nth-child(3) span').textContent === "名称（A–Z）");

  assert.equal(document.querySelector('#ordering-menu [role="menuitemradio"]:nth-child(2) span').textContent, "创建时间");
  assert.equal(document.querySelector('#ordering-menu [role="menuitemradio"]:nth-child(3) span').textContent, "名称（A–Z）");
  assert.equal(document.querySelector('#session-config-menu div:nth-child(3) span').textContent, "重置筛选");
  assert.equal(document.querySelector('#session-config-menu div:nth-child(4) span').textContent, "全部折叠");
  assert.equal(document.querySelector('#session-config-menu div:nth-child(5) span').textContent, "全部标记为已读");

  overlay.stop();
  assert.equal(trigger.getAttribute("aria-label"), "Configure sessions");
  assert.equal(grouping.textContent, "Grouping");
  assert.equal(ordering.textContent, "Ordering");
  assert.equal(updatedRadio.textContent, "Updated");
  dom.window.close();
});

test("sidebar static headings and quick links headings translate and restore", async () => {
  const dom = new JSDOM(`<body>
    <div data-sidebar-live-width>
      <h2 id="sidebar-heading">Sidebar</h2>
      <h3 id="quick-links-heading">Quick links</h3>
    </div>
    <div id="portal-root"></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const sidebarHeading = document.getElementById("sidebar-heading");
  const quickLinksHeading = document.getElementById("quick-links-heading");

  await waitFor(() => sidebarHeading.textContent === "侧栏" &&
    quickLinksHeading.textContent === "快捷入口");

  overlay.stop();
  assert.equal(sidebarHeading.textContent, "Sidebar");
  assert.equal(quickLinksHeading.textContent, "Quick links");
  dom.window.close();
});

test("workspace panel aside translates tabs, overview, and pick and polish tools", async () => {
  const dom = new JSDOM(`<body>
    <aside data-testid="chat-canvas-panel">
      <section data-f6-nav data-f6-focus-target="[data-tab-shell-f6-entry-target]">
        <h2>Session</h2>
        <div role="tablist">
          <button role="tab">Library</button>
          <button role="tab">Terminal</button>
          <button role="tab">Browser</button>
          <button role="tab">Files</button>
          <button role="tab">Side chat</button>
          <button role="tab">Overview</button>
          <button role="tab">Pick & Polish</button>
        </div>
        <div>
          <p>Use Pick & Polish to refine your frontend</p>
          <label>Enter a URL</label>
        </div>
      </section>
    </aside>
    <div id="portal-root"></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const heading = document.querySelector("aside h2");
  const tabs = [...document.querySelectorAll('aside button[role="tab"]')];
  const p = document.querySelector("aside p");
  const label = document.querySelector("aside label");

  await waitFor(() => heading.textContent === "会话" &&
    tabs[0].textContent === "资料库" &&
    tabs[1].textContent === "终端" &&
    p.textContent === "使用选取与优化改进前端" &&
    label.textContent === "输入链接");

  assert.equal(tabs[2].textContent, "浏览器");
  assert.equal(tabs[3].textContent, "文件");
  assert.equal(tabs[4].textContent, "侧边聊天");
  assert.equal(tabs[5].textContent, "概览");
  assert.equal(tabs[6].textContent, "选取与优化");
  assert.equal(label.textContent, "输入链接");

  overlay.stop();
  assert.equal(heading.textContent, "Session");
  assert.equal(tabs[0].textContent, "Library");
  assert.equal(tabs[6].textContent, "Pick & Polish");
  assert.equal(p.textContent, "Use Pick & Polish to refine your frontend");
  dom.window.close();
});

test("session context copy submenu translates fixed leaves while preserving session names", async () => {
  const context = sessionContextFixture(false);
  const { dom, document, menu } = context;
  const copyItem = menu.querySelector('#fictional-item-5');
  copyItem.setAttribute("aria-expanded", "true");
  copyItem.setAttribute("aria-controls", "copy-submenu");

  const copyPortal = document.createElement("div");
  copyPortal.setAttribute("data-base-ui-portal", "");
  copyPortal.innerHTML = `<div role="presentation" data-open>
    <div role="menu" id="copy-submenu" data-open data-rootownerid="fictional-owner" aria-labelledby="fictional-item-5">
      <div role="menuitem"><span>Session name</span></div>
      <div role="menuitem"><span>Session ID</span></div>
      <div role="menuitem"><span>Path</span></div>
      <div role="menuitem"><span>Copy branch</span></div>
    </div>
  </div>`;
  document.body.append(copyPortal);

  const overlay = startSettingsTranslation(document, dictionary);
  const items = [...document.querySelectorAll("#copy-submenu [role=menuitem] span")];

  await waitFor(() => items[0].textContent === "会话名称" &&
    items[1].textContent === "会话 ID" &&
    items[2].textContent === "路径" &&
    items[3].textContent === "复制分支");

  overlay.stop();
  assert.equal(items[0].textContent, "Session name");
  assert.equal(items[1].textContent, "Session ID");
  assert.equal(items[2].textContent, "Path");
  assert.equal(items[3].textContent, "Copy branch");
  dom.window.close();
});

test("command palette dialog translates placeholder and static commands without walking user content", async () => {
  const dom = new JSDOM(`<body>
    <div id="portal-root">
      <div data-base-ui-portal>
        <div role="dialog">
          <input role="combobox" placeholder="Search projects, repositories, PRs, issues, or paste a URL…" value="">
          <div role="listbox">
            <div role="option"><span>Switch model</span></div>
            <div role="option"><span>Set thinking effort</span></div>
            <div role="option"><span>Check for updates</span></div>
            <div role="option"><span>Resume remote session</span></div>
            <div role="option"><span>my-private-repo/feat-branch</span></div>
          </div>
        </div>
      </div>
    </div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const input = document.querySelector('input[role="combobox"]');
  const options = [...document.querySelectorAll('[role="option"] span')];

  await waitFor(() => input.getAttribute("placeholder") === "搜索项目、仓库、拉取请求、议题，或粘贴链接…" &&
    options[0].textContent === "切换模型" &&
    options[1].textContent === "设置思考强度" &&
    options[2].textContent === "检查更新" &&
    options[3].textContent === "恢复远程会话");

  // User repo/branch remains strictly English!
  assert.equal(options[4].textContent, "my-private-repo/feat-branch");

  overlay.stop();
  assert.equal(input.getAttribute("placeholder"), "Search projects, repositories, PRs, issues, or paste a URL…");
  assert.equal(options[0].textContent, "Switch model");
  assert.equal(options[4].textContent, "my-private-repo/feat-branch");
  dom.window.close();
});

test("chrome buttons with shortcut-suffixed aria-labels translate and restore", async () => {
  const dom = new JSDOM(`<body>
    <button data-testid="sidebar-session-configuration" aria-label="Configure sessions"></button>
    <button data-testid="sidebar-feedback-button" aria-label="Share feedback, Control + Enter"></button>
    <button data-testid="navigation-back-button" aria-label="Back, Ctrl + Left bracket"></button>
    <button data-testid="navigation-forward-button" aria-label="Forward, Ctrl + Right bracket"></button>
    <div data-sidebar-live-width>
      <div role="separator" aria-label="Resize sidebar"></div>
    </div>
    <main data-app-shell-main>
      <button aria-label="Environment: This computer"></button>
      <button aria-label="Repository: Chat"></button>
    </main>
    <div id="portal-root"></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const configBtn = document.querySelector('[data-testid="sidebar-session-configuration"]');
  const feedbackBtn = document.querySelector('[data-testid="sidebar-feedback-button"]');
  const backBtn = document.querySelector('[data-testid="navigation-back-button"]');
  const forwardBtn = document.querySelector('[data-testid="navigation-forward-button"]');
  const separator = document.querySelector('div[role="separator"]');
  const envBtn = document.querySelector('button[aria-label^="Environment:"]');
  const repoBtn = document.querySelector('button[aria-label^="Repository:"]');

  await waitFor(() => configBtn.getAttribute("aria-label") === "配置会话" &&
    feedbackBtn.getAttribute("aria-label") === "分享反馈，Control + Enter" &&
    backBtn.getAttribute("aria-label") === "后退，Ctrl + Left bracket" &&
    forwardBtn.getAttribute("aria-label") === "前进，Ctrl + Right bracket" &&
    separator.getAttribute("aria-label") === "调整侧栏宽度" &&
    envBtn.getAttribute("aria-label") === "环境：此计算机" &&
    repoBtn.getAttribute("aria-label") === "仓库：聊天");

  overlay.stop();
  assert.equal(configBtn.getAttribute("aria-label"), "Configure sessions");
  assert.equal(feedbackBtn.getAttribute("aria-label"), "Share feedback, Control + Enter");
  assert.equal(backBtn.getAttribute("aria-label"), "Back, Ctrl + Left bracket");
  assert.equal(forwardBtn.getAttribute("aria-label"), "Forward, Ctrl + Right bracket");
  assert.equal(separator.getAttribute("aria-label"), "Resize sidebar");
  assert.equal(envBtn.getAttribute("aria-label"), "Environment: This computer");
  assert.equal(repoBtn.getAttribute("aria-label"), "Repository: Chat");
  dom.window.close();
});

test("dynamically mounted composer pills, model menu without radio-item marker, msgMore menu, and new hover tooltips translate and restore", async () => {
  const dom = new JSDOM(`<body>
    <main data-app-shell-main>
      <div><div><div id="route-slot"><div>
        <div data-testid="conversation-composer-area"><div data-rich-composer-footer="true"></div></div>
      </div></div></div></div>
      <div data-testid="conversation-body">
        <div data-testid="conversation-message-row">
          <div data-user-content><p>Share as secret gist Bookmark to timeline</p></div>
          <div>
            <button id="bookmark-btn" data-base-ui-tooltip-trigger aria-label="Bookmark to timeline"></button>
            <button id="copy-btn" data-base-ui-tooltip-trigger aria-label="Copy assistant message"></button>
            <button id="msg-more-btn" aria-haspopup="menu" aria-expanded="true"
              aria-controls="msg-more-popup" aria-label="More response actions"></button>
          </div>
        </div>
      </div>
    </main>
    <div id="portal-root"></div>
    <div data-base-ui-portal><div role="presentation" data-open>
      <div role="menu" id="msg-more-popup" aria-labelledby="msg-more-btn" data-open data-rootownerid="msg-more-btn">
        <div role="menuitem"><span>Share as secret gist</span></div>
        <div role="menuitem"><span>Fork chat from response</span></div>
      </div>
    </div></div>
  </body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);

  // Simulate navigating into a session view where composer mounts inside nested route divs
  document.getElementById("route-slot").innerHTML = `
    <div data-testid="conversation-composer-area">
      <div data-testid="composer-pills">
        <button data-testid="scheduled-pill"><span>Scheduled</span><span>9:50pm</span></button>
        <button data-testid="changes-pill"><span>Changes</span><span>+8533</span></button>
        <button data-testid="artifact-files-pill"><span>Artifacts</span><span>1</span></button>
      </div>
      <div data-rich-composer-footer="true">
        <button id="model-trigger-dyn" aria-haspopup="menu" aria-expanded="true" aria-controls="model-popup-dyn"
          data-base-ui-tooltip-trigger aria-label="Claude Opus 5.5 · Medium, model and reasoning, Ctrl + Shift + E">Claude Opus 5.5</button>
        <button id="context-trigger-dyn" data-base-ui-tooltip-trigger aria-label="Add context &amp; more"></button>
        <button id="voice-trigger-dyn" data-base-ui-tooltip-trigger aria-label="Start voice recording, Control + Alt + Space"></button>
        <button id="quota-trigger-dyn" data-base-ui-tooltip-trigger data-base-ui-click-trigger aria-haspopup="dialog" aria-label="AI credits quota: 7%, Ctrl + Shift + U"></button>
        <button id="send-trigger-dyn" data-base-ui-tooltip-trigger aria-label="Send message"></button>
      </div>
    </div>`;

  // Model menu and Effort submenu without [data-menu-has-radio-item]
  const modelPortal = document.createElement("div");
  modelPortal.setAttribute("data-base-ui-portal", "");
  modelPortal.innerHTML = `<div role="presentation" data-open>
    <div role="menu" id="model-popup-dyn" aria-labelledby="model-trigger-dyn" data-open data-rootownerid="model-trigger-dyn">
      <div><div>
        <button>Retry</button>
        <p>Models will be available when the local session is running.</p>
      </div></div>
      <div><div>
        <div role="menuitem" id="dyn-model-row" aria-haspopup="menu" aria-expanded="false"><span><span><span>Model</span><span>Claude Opus 5.5</span></span></span></div>
        <div role="menuitem" id="dyn-effort-row" aria-haspopup="menu" aria-expanded="true" aria-controls="effort-popup-dyn"><span><span><span>Effort</span><span>Medium</span></span></span></div>
        <div role="menuitem" id="dyn-context-row" aria-haspopup="menu" aria-expanded="false"><span><span><span>Context window</span><span>200K</span></span></span></div>
      </div></div>
    </div>
  </div>`;
  const effortPortal = document.createElement("div");
  effortPortal.setAttribute("data-base-ui-portal", "");
  effortPortal.innerHTML = `<div role="presentation" data-open data-nested>
    <div role="menu" id="effort-popup-dyn" aria-labelledby="dyn-effort-row" data-open data-nested data-rootownerid="model-trigger-dyn">
      <div><div><div role="group">
        ${["Low", "Medium", "High", "Extra High", "Max"].map(level =>
          `<div role="menuitemradio" aria-checked="${level === "Medium"}"><span>${level}</span></div>`).join("")}
      </div></div></div>
    </div>
  </div>`;
  document.body.append(modelPortal, effortPortal);

  // Hover tooltips on message actions and composer footer
  const tooltipSpecs = [
    [document.getElementById("bookmark-btn"), "Bookmark to timeline", null],
    [document.getElementById("copy-btn"), "Copy response", null],
    [document.getElementById("msg-more-btn"), "More options", null],
    [document.getElementById("context-trigger-dyn"), "Add context & more", null],
    [document.getElementById("voice-trigger-dyn"), "Start voice recording", ["Ctrl", "Alt", "Space"]],
    [document.getElementById("quota-trigger-dyn"), "AI usage", ["Ctrl", "Shift", "U"]],
    [document.getElementById("send-trigger-dyn"), "Send", ["↵"]]
  ];
  const tooltipNodes = tooltipSpecs.map(([trigger, text, keys]) => {
    const matches = trigger.matches.bind(trigger);
    trigger.matches = selector => selector === ":hover" || matches(selector);
    trigger.setAttribute("data-popup-open", "");
    const portal = document.createElement("div");
    portal.setAttribute("data-base-ui-portal", "");
    const presentation = document.createElement("div");
    presentation.setAttribute("role", "presentation");
    presentation.setAttribute("data-open", "");
    presentation.setAttribute("data-side", "bottom");
    presentation.setAttribute("data-align", "start");
    const focusable = document.createElement("div");
    focusable.setAttribute("data-open", "");
    focusable.setAttribute("data-side", "bottom");
    focusable.setAttribute("data-align", "start");
    focusable.setAttribute("tabindex", "-1");
    focusable.setAttribute("data-base-ui-focusable", "");
    const label = document.createElement("span");
    label.textContent = text;
    focusable.append(label);
    if (keys) {
      const chord = document.createElement("span");
      chord.setAttribute("data-kbd-chord", "");
      for (const k of keys) {
        const kbd = document.createElement("kbd");
        kbd.textContent = k;
        chord.append(kbd);
      }
      focusable.append(chord);
    }
    presentation.append(focusable);
    portal.append(presentation);
    document.body.append(portal);
    return { text, label, focusable };
  });

  await waitFor(() =>
    document.querySelector('[data-testid="scheduled-pill"] span:first-child').textContent === "已定时" &&
    document.querySelector('[data-testid="changes-pill"] span:first-child').textContent === "更改" &&
    document.querySelector('[data-testid="artifact-files-pill"] span:first-child').textContent === "产物" &&
    document.querySelector("#dyn-effort-row > span > span > span:last-child").textContent === "中" &&
    effortPortal.querySelectorAll("[role=menuitemradio]")[4].textContent === "最高" &&
    document.querySelector("#msg-more-popup [role=menuitem]:last-child").textContent === "从此回答派生聊天" &&
    tooltipNodes[6].label.textContent === "发送"
  );

  // Verify dynamic counts/diff/time, model names, context size, chat body, and kbd chords remain untouched
  assert.equal(document.querySelector('[data-testid="scheduled-pill"] span:last-child').textContent, "9:50pm");
  assert.equal(document.querySelector('[data-testid="changes-pill"] span:last-child').textContent, "+8533");
  assert.equal(document.querySelector('[data-testid="artifact-files-pill"] span:last-child').textContent, "1");
  assert.equal(modelPortal.querySelector("button").textContent, "重试");
  assert.equal(modelPortal.querySelector("p").textContent, "本地会话运行后将显示可用模型。");
  assert.equal(document.querySelector("#dyn-model-row > span > span > span:first-child").textContent, "模型");
  assert.equal(document.querySelector("#dyn-model-row > span > span > span:last-child").textContent, "Claude Opus 5.5");
  assert.equal(document.querySelector("#dyn-effort-row > span > span > span:first-child").textContent, "推理强度");
  assert.equal(document.querySelector("#dyn-context-row > span > span > span:first-child").textContent, "上下文窗口");
  assert.equal(document.querySelector("#dyn-context-row > span > span > span:last-child").textContent, "200K");
  assert.deepEqual([...effortPortal.querySelectorAll("[role=menuitemradio]")].map(el => el.textContent),
    ["低", "中", "高", "超高", "最高"]);
  assert.deepEqual([...document.querySelectorAll("#msg-more-popup [role=menuitem]")].map(el => el.textContent),
    ["分享为秘密 Gist", "从此回答派生聊天"]);
  assert.equal(document.querySelector("[data-user-content] p").textContent, "Share as secret gist Bookmark to timeline");
  assert.deepEqual(tooltipNodes.map(t => t.label.textContent),
    ["加入时间线书签", "复制回答", "更多选项", "添加上下文及更多", "开始语音输入", "AI 用量", "发送"]);
  assert.equal(tooltipNodes[4].focusable.querySelector("[data-kbd-chord]").textContent, "CtrlAltSpace");
  assert.equal(tooltipNodes[5].focusable.querySelector("[data-kbd-chord]").textContent, "CtrlShiftU");
  assert.equal(tooltipNodes[6].focusable.querySelector("[data-kbd-chord]").textContent, "↵");

  overlay.stop();
  assert.equal(document.querySelector('[data-testid="scheduled-pill"] span:first-child').textContent, "Scheduled");
  assert.equal(document.querySelector("#dyn-effort-row > span > span > span:first-child").textContent, "Effort");
  assert.equal(tooltipNodes[0].label.textContent, "Bookmark to timeline");
  assert.equal(document.querySelector("#msg-more-popup [role=menuitem]").textContent, "Share as secret gist");
  dom.window.close();
});

test("Repository in session config, translated Environment trigger ownership, and topbar tooltips translate and restore", async () => {
  const dom = new JSDOM(`<body>
    <header>
      <button id="toggle-btn" data-base-ui-tooltip-trigger aria-label="Toggle sidebar, Ctrl + B"></button>
      <button id="search-btn" data-base-ui-tooltip-trigger aria-label="Search, Ctrl + K"></button>
      <button id="back-btn" data-testid="navigation-back-button" data-base-ui-tooltip-trigger aria-label="Back, Ctrl + Left bracket"></button>
      <button id="forward-btn" data-testid="navigation-forward-button" data-base-ui-tooltip-trigger aria-label="Forward, Ctrl + Right bracket"></button>
      <button id="cfg-btn" data-testid="sidebar-session-configuration" aria-haspopup="menu" aria-expanded="true"
        aria-controls="cfg-popup" data-base-ui-tooltip-trigger aria-label="Configure sessions"></button>
      <button id="new-btn" data-base-ui-tooltip-trigger aria-label="New session"></button>
    </header>
    <main data-app-shell-main>
      <button id="env-btn" aria-haspopup="menu" aria-expanded="true" aria-controls="env-popup"
        aria-label="Environment: Cloud"></button>
    </main>
    <div id="portal-root"></div>
    <div data-base-ui-portal><div role="presentation" data-open>
      <div role="menu" id="cfg-popup" aria-labelledby="cfg-btn" data-open data-rootownerid="cfg-btn">
        <div role="menuitem" id="cfg-grouping" aria-haspopup="menu" aria-expanded="true" aria-controls="cfg-grouping-popup"><span>Grouping</span></div>
      </div>
    </div></div>
    <div data-base-ui-portal><div role="presentation" data-open>
      <div role="menu" id="cfg-grouping-popup" aria-labelledby="cfg-grouping" data-open data-rootownerid="cfg-btn">
        <div role="menuitemradio" aria-checked="true"><span>Repository</span></div>
        <div role="menuitemradio" aria-checked="false"><span>Last updated</span></div>
      </div>
    </div></div>
    <div data-base-ui-portal><div role="presentation" data-open>
      <div role="menu" id="env-popup" aria-labelledby="env-btn" data-open data-rootownerid="env-btn">
        <div role="menuitemradio" aria-checked="false"><span>This computer</span></div>
        <div role="menuitemradio" aria-checked="true"><span>Cloud</span></div>
        <div role="menuitemradio" aria-checked="false"><span>Codespaces</span></div>
      </div>
    </div></div>
  </body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);

  const topSpecs = [
    [document.getElementById("toggle-btn"), "Toggle sidebar", ["Ctrl", "B"]],
    [document.getElementById("search-btn"), "Search", ["Ctrl", "K"]],
    [document.getElementById("back-btn"), "Back", null],
    [document.getElementById("forward-btn"), "Forward", null],
    [document.getElementById("cfg-btn"), "Configure sessions", null],
    [document.getElementById("new-btn"), "New session", ["Ctrl", "N"]]
  ];
  const tooltipNodes = topSpecs.map(([trigger, text, keys]) => {
    const matches = trigger.matches.bind(trigger);
    trigger.matches = selector => selector === ":hover" || matches(selector);
    trigger.setAttribute("data-popup-open", "");
    const portal = document.createElement("div");
    portal.setAttribute("data-base-ui-portal", "");
    const presentation = document.createElement("div");
    presentation.setAttribute("role", "presentation");
    presentation.setAttribute("data-open", "");
    presentation.setAttribute("data-side", "bottom");
    presentation.setAttribute("data-align", "center");
    const focusable = document.createElement("div");
    focusable.setAttribute("data-open", "");
    focusable.setAttribute("data-side", "bottom");
    focusable.setAttribute("data-align", "center");
    focusable.setAttribute("tabindex", "-1");
    focusable.setAttribute("data-base-ui-focusable", "");
    const label = document.createElement("span");
    label.textContent = text;
    focusable.append(label);
    if (keys) {
      const chord = document.createElement("span");
      chord.setAttribute("data-kbd-chord", "");
      for (const k of keys) {
        const kbd = document.createElement("kbd");
        kbd.textContent = k;
        chord.append(kbd);
      }
      focusable.append(chord);
    }
    presentation.append(focusable);
    portal.append(presentation);
    document.body.append(portal);
    return label;
  });

  await waitFor(() =>
    document.getElementById("toggle-btn").getAttribute("aria-label") === "切换侧栏，Ctrl + B" &&
    document.getElementById("search-btn").getAttribute("aria-label") === "搜索，Ctrl + K" &&
    document.getElementById("env-btn").getAttribute("aria-label") === "环境：云端" &&
    document.querySelector("#cfg-grouping-popup [role=menuitemradio]").textContent === "仓库" &&
    document.querySelector("#env-popup [role=menuitemradio]").textContent === "此计算机" &&
    tooltipNodes[5].textContent === "新建会话"
  );
  assert.deepEqual(tooltipNodes.map(el => el.textContent),
    ["切换侧栏", "搜索", "后退", "前进", "配置会话", "新建会话"]);
  assert.deepEqual([...document.querySelectorAll("#env-popup [role=menuitemradio]")].map(el => el.textContent),
    ["此计算机", "云端", "Codespaces"]);

  overlay.stop();
  assert.equal(document.querySelector("#cfg-grouping-popup [role=menuitemradio]").textContent, "Repository");
  assert.equal(document.getElementById("env-btn").getAttribute("aria-label"), "Environment: Cloud");
  assert.deepEqual(tooltipNodes.map(el => el.textContent),
    ["Toggle sidebar", "Search", "Back", "Forward", "Configure sessions", "New session"]);
  dom.window.close();
});

test("project menu, Detach session / Open in... coding menu, and Quick chat context menu without Show in Explorer translate and restore", async () => {
  const buildPortal = (id, groups) => {
    const all = groups.flat();
    const item = ([label, command, submenu], index) =>
      `<div role="menuitem" id="${id}-item-${index}" tabindex="-1" aria-setsize="${all.length}"
        aria-posinset="${index + 1}" ${command ? `data-command="${command}"` : ""}
        ${submenu ? 'aria-haspopup="menu" aria-expanded="false"' : ""}>
        <span><svg aria-hidden="true"></svg></span>${submenu
          ? `<span>${label}</span><svg aria-hidden="true"></svg>`
          : `<span><span>${label}</span></span>`}</div>`;
    let pos = 0;
    const body = groups.map((group, gi) => {
      const html = group.length > 1 && gi === 0
        ? `<div role="group">${group.map(e => item(e, pos++)).join("")}</div>`
        : group.map(e => item(e, pos++)).join("");
      return html;
    }).join('<div role="none" data-menu-separator></div>');
    return `<div id="${id}-portal" data-base-ui-portal><div role="presentation" data-open data-side="bottom">
      <div role="menu" id="${id}-menu" data-open data-base-ui-focusable data-rootownerid="${id}-owner">${body}</div>
    </div></div>`;
  };

  const dom = new JSDOM(`<body><div id="portal-root"></div>
    ${buildPortal("project", [
      [["Rename", null], ["Customize...", null], ["Settings", null], ["Mark as unread", null], ["Copy", null, true]],
      [["New section", null]],
      [["Archive", null], ["Delete", null]]
    ])}
    ${buildPortal("coding", [
      [["Rename", null], ["Pin", "session.pin.set"], ["Mark as unread", "session.read.set"],
       ["Show in Explorer", "session.reveal"], ["Share as secret gist", "session.share-gist"], ["Copy", null, true]],
      [["Open in...", null, true]],
      [["Create nested session", null], ["Detach session", null]],
      [["Archive", "session.archive"], ["Delete", "session.delete"]]
    ])}
    ${buildPortal("quick", [
      [["Rename", null], ["Pin", "session.pin.set"], ["Mark as unread", "session.read.set"],
       ["Share as secret gist", "session.share-gist"], ["Copy", null, true]],
      [["Archive", "session.archive"], ["Delete", "session.delete"]]
    ])}
  </body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);

  const labelsOf = id => [...document.querySelectorAll(`#${id}-menu [role=menuitem]`)].map(el =>
    (el.children[1].firstElementChild || el.children[1]).textContent);

  await waitFor(() =>
    labelsOf("project")[1] === "自定义…" &&
    labelsOf("project").at(-1) === "删除" &&
    labelsOf("coding")[8] === "分离会话" &&
    labelsOf("coding").at(-1) === "删除" &&
    labelsOf("quick").at(-1) === "删除"
  );

  assert.deepEqual(labelsOf("project"),
    ["重命名", "自定义…", "设置", "标记为未读", "复制", "新建分组", "归档", "删除"]);
  assert.deepEqual(labelsOf("coding"),
    ["重命名", "置顶", "标记为未读", "在资源管理器中显示", "分享为秘密 Gist", "复制", "打开方式…", "创建嵌套会话", "分离会话", "归档", "删除"]);
  assert.deepEqual(labelsOf("quick"),
    ["重命名", "置顶", "标记为未读", "分享为秘密 Gist", "复制", "归档", "删除"]);

  overlay.stop();
  assert.equal(labelsOf("project")[1], "Customize...");
  assert.equal(labelsOf("coding")[8], "Detach session");
  assert.equal(labelsOf("quick")[4], "Copy");
  dom.window.close();
});

test("floating text selection popup translates Add to Side chat, Quote, Copy while preserving shortcuts and transcript", async () => {
  const dom = new JSDOM(`<body>
    <div id="portal-root"></div>
    <main data-app-shell-main>
      <div data-testid="conversation-body">
        <div data-user-content><p>Quote</p><p>Copy</p><p>Add to Side chat</p></div>
      </div>
    </main>
  </body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);

  const portal = document.createElement("div");
  portal.setAttribute("data-base-ui-portal", "");
  portal.innerHTML = `<div role="presentation" data-open data-side="top" data-align="center">
    <div role="menu" data-open>
      <div role="menuitem"><span>Add to Side chat</span></div>
      <div role="menuitem"><span>Quote</span><span data-kbd-chord><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>\`</kbd></span></div>
      <div role="none" data-menu-separator></div>
      <div role="menuitem"><span>Copy</span><span><span>Ctrl</span><span>C</span></span></div>
    </div>
  </div>`;
  document.body.appendChild(portal);

  const items = () => [...portal.querySelectorAll('[role="menuitem"]')];
  await waitFor(() =>
    items()[0].firstElementChild.textContent === "添加到侧边聊天" &&
    items()[1].firstElementChild.textContent === "引用" &&
    items()[2].firstElementChild.textContent === "复制"
  );

  assert.equal(items()[1].querySelector("span[data-kbd-chord]").textContent, "CtrlShift`");
  assert.equal(items()[2].children[1].textContent, "CtrlC");
  assert.deepEqual(
    [...document.querySelectorAll('[data-testid="conversation-body"] [data-user-content] p')].map(p => p.textContent),
    ["Quote", "Copy", "Add to Side chat"]
  );

  overlay.stop();
  assert.equal(items()[0].firstElementChild.textContent, "Add to Side chat");
  assert.equal(items()[1].firstElementChild.textContent, "Quote");
  assert.equal(items()[2].firstElementChild.textContent, "Copy");
  dom.window.close();
});

test("deferred mainRoot, sidebar, and composer footer mount after portal initialization and translate automatically", async () => {
  const dom = new JSDOM(`<body><div id="root"></div><div id="portal-root"></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);

  const shell = document.createElement("div");
  shell.innerHTML = `<main data-app-shell-main data-f6-nav>
    <aside data-sidebar-live-width><div><div data-testid="sidebar-scroll-viewport"><div>
      <nav aria-labelledby="quick-links-heading"><h2 id="quick-links-heading">Quick links</h2><ul>
        <li><button data-sidebar-nav-item="home" data-command="navigation.home" data-sidebar-file-drop-kind="new"><span>New</span></button></li>
      </ul></nav>
    </div></div></div></aside>
    <div data-testid="conversation-composer-area">
      <div data-testid="composer-pills"><button data-testid="artifact-files-pill" aria-controls="artifact-files-list"><span>Artifacts</span><span>0</span></button></div>
      <div data-rich-composer-footer><button id="deferred-mode-btn" data-base-ui-tooltip-trigger aria-haspopup="menu" aria-expanded="false" aria-label="Mode: Interactive, Ctrl + Shift + M">Interactive</button></div>
    </div>
  </main>`;
  document.getElementById("root").appendChild(shell);

  await waitFor(() =>
    document.querySelector('[data-sidebar-nav-item="home"] span').textContent === "新建" &&
    document.querySelector('[data-testid="artifact-files-pill"] span').textContent === "产物" &&
    document.querySelector('[data-rich-composer-footer] button').textContent === "协作"
  );

  overlay.stop();
  assert.equal(document.querySelector('[data-sidebar-nav-item="home"] span').textContent, "New");
  assert.equal(document.querySelector('[data-testid="artifact-files-pill"] span').textContent, "Artifacts");
  assert.equal(document.querySelector('[data-rich-composer-footer] button').textContent, "Interactive");
  dom.window.close();
});

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
      <div class="chat"><p>Background</p><p>Artifacts</p><p>Thinking</p></div>
    </div>
  </main>
  <div id="portal-root"></div>
  ${menu("profile-popup-generated", "profile-menu-generated", `
    <div role="menuitem"><span><span>Manage accounts</span></span></div>
    <div role="menuitem"><span><span>Manage sessions</span></span></div>
    <div role="menuitem"><span>Theme</span></div>
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
    <div role="menuitem"><span>Tool permissions</span></div><div role="menuitem"><span>Approve all</span></div>`) }
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
      "优惠 30%，截止至 11 月 30 日|优惠 15%，截止至 11 月 15 日|优惠 30%，截止至 11 月 30 日");
  assert.equal(document.querySelector('[aria-labelledby="quick-links-heading"] li:first-child button').textContent, "自动化");
  assert.equal(document.querySelector('[aria-labelledby="quick-links-heading"] li:last-child button').textContent, "自定义");
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
    ["优惠 30%，截止至 11 月 30 日", "优惠 15%，截止至 11 月 15 日", "优惠 30%，截止至 11 月 30 日"]);
  assert.equal(document.querySelector('#model-popup-generated a[href="#learn"]').firstChild.nodeValue, "了解详情");
  assert.ok(document.querySelector("#model-popup-generated svg"));
  assert.deepEqual([...document.querySelectorAll("#context-popup-generated [role=menuitem] > span > span")].map(node => node.textContent),
    ["仓库文件或文件夹…", "会话…", "文件…", "文件夹…"]);
  assert.equal(document.querySelector("#context-popup-generated kbd").textContent, "@");
  assert.equal(document.querySelector('#profile-popup-generated [role=menuitem] span span').textContent, "管理账户");
  assert.equal(document.querySelector('#profile-popup-generated [role=menuitem]:nth-child(2) span span').textContent, "管理会话");
  assert.equal(document.querySelector("#profile-popup-generated > div:last-child span span").textContent, "AI 点数已使用：13%");
  assert.equal(document.querySelector('#unrelated-popup [role=menuitem]').textContent, "Manage sessions");
  assert.equal(document.getElementById("profile-menu-generated").getAttribute("aria-label"), "Fictional User, open user menu");
  assert.deepEqual([...document.querySelector(".chat").children].map(node => node.textContent), ["Background", "Artifacts", "Thinking"]);
  const scans = overlay.stats.settingsScans;
  const callbacks = overlay.stats.callbacks;
  document.querySelector(".chat p").firstChild.nodeValue = "Updated message";
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(overlay.stats.settingsScans, scans);
  assert.equal(overlay.stats.callbacks, callbacks);
  overlay.stop();
  assert.equal(document.querySelector('[data-testid="background-activity-pill"]').textContent, "Background4");
  assert.equal(modePopup.querySelector("[data-menu-description]").textContent, "Step-by-step collaboration");
  assert.equal(document.querySelector("#profile-popup-generated > div:last-child span span").textContent, "AI credits used: 13%");
  assert.equal(document.getElementById("model-popup-generated").querySelector('[role="none"] div').textContent, "Effort level");
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

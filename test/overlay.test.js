import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { dictionary } from "../src/dictionary.js";
import { startSettingsTranslation } from "../src/overlay.js";

const settle = () => new Promise(resolve => setTimeout(resolve, 0));
async function waitFor(predicate) {
  const end = Date.now() + 2000;
  while (!predicate() && Date.now() < end) await settle();
  assert.ok(predicate(), "timed out waiting for overlay");
}

function fixture() {
  const dom = new JSDOM(`<!doctype html><body>
    <main id="chat"><span>General</span><span>Thinking</span></main>
    <div id="portal-root"><div data-base-ui-portal>
      <div role="dialog" data-settings-dialog-root>
        <div data-settings-topbar><h1>General</h1><button aria-label="Close dialog"></button></div>
        <nav><button><span>General</span></button>
          <input role="searchbox" placeholder="Search settings…" aria-label="Search settings" value="General">
          <li id="nav-option-general"><button><span>General</span></button></li>
          <li id="nav-option-account"><button><span>Accounts</span></button></li>
          <li id="nav-option-computer-use"><button><span>Computer Use</span><div data-trailing-visual><span>Preview</span></div></button></li>
          <li id="nav-option-project%3Afictional"><button><span>Accounts</span></button></li>
        </nav>
        <section data-section-id="general-about"><div><div><h3>GitHub v1.4.2</h3>
          <p id="update-status">Up to date. Last checked on November 15, 2026, at 11:47 AM.</p></div></div></section>
        <section data-section-id="general-tray-menu">
          <div data-settings-row><div><h3>Keep running when window is closed</h3>
            <p>When you close the window, keep GitHub Copilot running in the system tray instead of quitting. Sessions keep running in the background.</p></div></div>
          <div data-settings-row><div><h3>Show in system tray</h3><p id="split"></p></div></div>
        </section>
        <section data-section-id="general-notification-sound">
          <div data-settings-row><div><h3>Volume</h3><p>Adjust notification volume.</p></div></div>
        </section>
        <section data-section-id="themes-terminal">
          <h3>Terminal font</h3><p>Set the font used for embedded terminals.</p>
          <input value="Terminal font">
          <h3>Terminal WebGL rendering</h3><p>Use your graphics card to draw embedded terminals. Turn it off if you see display problems. Changes apply immediately.</p>
        </section>
        <section data-settings-scroll aria-label="Voice dictation"><section data-section-id="voice-mode-models"><div><h2>Transcription models</h2>
          <p>Choose an English-only or multilingual model for private, on-device transcription.</p></div>
          <ul><li>Transcription models</li></ul></section></section>
        <section data-section-id="experimental-experiments">
          <div data-settings-row><div><h3><span id="wsl">WSL hosts</span></h3>
            <p id="wsl-description">Discover WSL distributions and create sessions inside them.</p></div>
            <div><button role="switch"><span class="sr-only">WSL hosts</span></button>
            <span data-switch-state-label>On</span></div></div>
          <div data-user-content><span>General</span></div>
          <input value="General">
        </section>
        <section data-section-id="general-find-in-workspace-position">
          <button id="position" role="combobox" aria-haspopup="listbox" aria-expanded="true"></button>
        </section>
        <section data-section-id="sessions-cli-sessions">
          <button id="session-window" role="combobox" aria-haspopup="listbox" aria-expanded="true"></button>
        </section>
        <section data-section-id="sessions-auto-approve">
          <button id="approvals" aria-haspopup="menu" aria-expanded="true">Assisted</button>
        </section>
        <section data-settings-scroll aria-label="Model providers"><section data-section-id="model-providers-providers">
          <div><div><h2>Configured providers</h2><p>Access models from other providers with your own API keys. Keys stay private and go straight to the provider.</p></div><div><button>Add provider</button></div></div>
          <div data-settings-row><div><h3>General</h3></div></div>
        </section></section>
        <section data-settings-scroll aria-label="Environments"><section data-section-id="environments-list"><div role="status"></div><div>
          <div><p>Connect and manage environments for agent sessions.</p></div><div></div>
        </div><div><ul><li>General</li></ul></div></section></section>
        <section data-settings-scroll aria-label="Accounts"><div><div></div><div>
          <div><div><h2>Connected accounts</h2><p>Repositories use the default account unless changed in repository settings.</p></div><div></div></div>
          <ul role="list"><li><h2>Connected accounts</h2></li>
            <li><span>fictional-account</span><button id="account-actions-trigger" aria-haspopup="menu" aria-expanded="true"
              aria-controls="account-actions-menu">Account actions</button></li>
          </ul>
        </div></div></section>
      </div>
      <div role="listbox" id="position-list"><div role="option">Top right</div></div>
      <div role="listbox" id="other-list"><div role="option">Top right</div></div>
      <div role="listbox" id="session-window-list">
        <div role="option" aria-selected="true">Last 1 day</div>
        <div role="option">Last 2 days</div>
        <div role="option">Last 365 days</div>
        <div role="option">Last 2 day</div>
        <div role="option">Last 7 days</div>
      </div>
      <div role="menu" aria-labelledby="approvals"><div role="menuitem">Approve all</div></div>
      <div role="menu" aria-labelledby="unrelated">
        <div role="menuitem">Approve all</div>
        <div role="menuitem"><span>Update authorization</span></div>
        <div role="menuitem"><span>Manage plan</span></div>
        <div role="menuitem"><span>Remove account</span></div>
        <div role="menuitem"><span>Set as default</span></div>
      </div>
      <div role="menu" id="account-actions-menu" aria-labelledby="account-actions-trigger">
        <div role="menuitem"><span>Update authorization</span></div>
        <div role="menuitem"><a href="https://example.invalid/plan"><span>Manage plan</span><svg aria-hidden="true">↗</svg></a></div>
        <div role="menuitem" class="destructive"><span>Remove account</span></div>
        <div role="menuitem"><span>Set as default</span></div>
    </div></div></body>`);
  const paragraph = dom.window.document.getElementById("split");
  for (const text of ["Show the GitHub Copilot icon in the ", "system tray", "."]) {
    paragraph.append(dom.window.document.createTextNode(text));
  }
  return { dom, document: dom.window.document };
}

test("translates only fixed settings labels and owned popup options", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.querySelector('[aria-labelledby="approvals"] [role=menuitem]').textContent === "全部批准" &&
    document.querySelector("#account-actions-menu [role=menuitem]").textContent === "更新授权");
  assert.equal(document.querySelector("nav li span").textContent, "常规");
  assert.equal(document.querySelector("#nav-option-account span").textContent, "账户");
  assert.equal(document.querySelector('[id="nav-option-project%3Afictional"] span').textContent, "Accounts");
  assert.equal(document.querySelector("#nav-option-computer-use button").textContent, "计算机使用预览");
  assert.equal(document.querySelector("#update-status").textContent, "Up to date. Last checked on November 15, 2026, at 11:47 AM.");
  assert.equal(document.querySelector('[data-section-id="general-about"] h3').textContent, "GitHub v1.4.2");
  assert.equal(document.querySelector("[data-settings-topbar] h1").textContent, "常规");
  assert.equal(document.querySelector("[data-settings-topbar] button").getAttribute("aria-label"), "关闭对话框");
  assert.equal(document.querySelector("nav > button span").textContent, "General");
  assert.equal(document.querySelector("nav input").placeholder, "搜索设置…");
  assert.equal(document.querySelector("nav input").getAttribute("aria-label"), "搜索设置");
  assert.equal(document.querySelector("#wsl").textContent, "WSL 主机");
  assert.equal(document.querySelector("#wsl-description").textContent, "发现 WSL 发行版并在其中创建会话。");
  assert.equal(document.querySelector('[data-section-id="general-tray-menu"] h3').textContent, "关闭窗口后继续运行");
  assert.match(document.querySelector('[data-section-id="general-tray-menu"] p').textContent, /^关闭窗口时/);
  assert.equal(document.querySelector('[data-section-id="general-notification-sound"] h3').textContent, "音量");
  assert.deepEqual([...document.querySelectorAll('[data-section-id="themes-terminal"] h3')].map(e => e.textContent), ["终端字体", "终端 WebGL 渲染"]);
  assert.equal(document.querySelector('[data-section-id="voice-mode-models"] h2').textContent, "转录模型");
  assert.match(document.querySelector('[data-section-id="voice-mode-models"] p').textContent, /^选择仅支持英语/);
  assert.equal(document.querySelector('[data-section-id="voice-mode-models"] li').textContent, "Transcription models");
  assert.equal(document.querySelector('[data-section-id="model-providers-providers"] h2').textContent, "已配置的提供商");
  assert.match(document.querySelector('[data-section-id="model-providers-providers"] p').textContent, /^使用自己的 API 密钥/);
  assert.equal(document.querySelector('[data-section-id="model-providers-providers"] button').textContent, "添加提供商");
  assert.equal(document.querySelector('[data-section-id="environments-list"] p').textContent, "连接和管理代理会话的环境。");
  assert.equal(document.querySelector("#position-list [role=option]").textContent, "右上角");
  assert.deepEqual([...document.querySelectorAll("#session-window-list [role=option]")].map(node =>
    [node.textContent, node.getAttribute("aria-selected")]), [
    ["Last 1 day", "true"], ["Last 2 days", null], ["Last 365 days", null], ["Last 2 day", null], ["最近 7 天", null]
  ]);
  assert.equal(document.querySelector("#other-list [role=option]").textContent, "Top right");
  assert.deepEqual([...document.querySelectorAll('[aria-labelledby="unrelated"] [role=menuitem]')].map(node => node.textContent),
    ["Approve all", "Update authorization", "Manage plan", "Remove account", "Set as default"]);
  document.querySelector("#approvals").setAttribute("aria-expanded", "false");
  await waitFor(() => document.querySelector('[aria-labelledby="approvals"] [role=menuitem]').textContent === "Approve all");
  assert.equal(document.querySelector("#chat").textContent, "GeneralThinking");
  assert.equal(document.querySelector("[data-user-content]").textContent, "General");
  assert.equal(document.querySelector("input").value, "General");
  assert.equal(document.querySelector('[data-section-id="model-providers-providers"] h3').textContent, "General");
  assert.equal(document.querySelector('[data-settings-scroll][aria-label="Accounts"] h2').textContent, "已连接的账户");
  assert.match(document.querySelector('[data-settings-scroll][aria-label="Accounts"] p').textContent, /^除非在仓库设置/);
  assert.equal(document.querySelector('[data-settings-scroll][aria-label="Accounts"] li h2').textContent, "Connected accounts");
  assert.deepEqual([...document.querySelectorAll("#account-actions-menu [role=menuitem]")].map(node => node.textContent),
    ["更新授权", "管理订阅计划↗", "移除账号", "设为默认"]);
  assert.equal(document.querySelector("#account-actions-menu a").getAttribute("href"), "https://example.invalid/plan");
  assert.equal(document.querySelector("#account-actions-menu svg").textContent, "↗");
  assert.equal(document.querySelector('[data-settings-scroll][aria-label="Accounts"] li span').textContent, "fictional-account");
  assert.equal(document.querySelector('[data-section-id="themes-terminal"] input').value, "Terminal font");
  document.getElementById("account-actions-trigger").setAttribute("aria-controls", "unrelated-menu");
  await waitFor(() => document.querySelector("#account-actions-menu [role=menuitem]").textContent === "Update authorization");
  document.getElementById("account-actions-trigger").setAttribute("aria-controls", "account-actions-menu");
  await waitFor(() => document.querySelector("#account-actions-menu [role=menuitem]").textContent === "更新授权");
  document.getElementById("account-actions-trigger").setAttribute("aria-expanded", "false");
  await waitFor(() => document.querySelector("#account-actions-menu [role=menuitem]").textContent === "Update authorization");
  document.getElementById("account-actions-trigger").setAttribute("aria-expanded", "true");
  await waitFor(() => document.querySelector("#account-actions-menu [role=menuitem]").textContent === "更新授权");
  overlay.stop();
  assert.deepEqual([...document.querySelectorAll("#account-actions-menu [role=menuitem]")].map(node => node.textContent),
    ["Update authorization", "Manage plan↗", "Remove account", "Set as default"]);
  dom.window.close();
});

test("dynamic update timestamps stay unchanged in settings and chat", async () => {
  const { dom, document } = fixture();
  const status = document.querySelector("#update-status");
  const original = status.textContent;
  const other = document.createElement("p");
  other.textContent = original;
  document.querySelector("#chat").append(other);
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.querySelector("#wsl").textContent === "WSL 主机");
  assert.equal(status.textContent, original);
  status.firstChild.nodeValue = "Up to date. Last checked on 2026-11-15.";
  await settle();
  assert.equal(status.textContent, "Up to date. Last checked on 2026-11-15.");
  assert.equal(other.textContent, original);
  overlay.stop();
  dom.window.close();
});

test("handles host updates, ownership changes, removal and stop safely", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  const label = document.querySelector("#wsl").firstChild;
  label.nodeValue = "Remote control";
  await waitFor(() => label.nodeValue === "远程控制");
  assert.equal(label.nodeValue, "远程控制");
  label.nodeValue = "A personal value";
  await settle();
  assert.equal(label.nodeValue, "A personal value");
  label.nodeValue = "WSL hosts";
  await waitFor(() => label.nodeValue === "WSL 主机");
  document.querySelector("[data-user-content]").append(label);
  await settle();
  assert.equal(label.nodeValue, "WSL hosts");
  const paragraph = document.querySelector("#wsl-description").firstChild;
  paragraph.nodeValue = "Changed by host";
  overlay.stop();
  assert.equal(paragraph.nodeValue, "Changed by host");
  assert.equal(document.querySelector("nav li span").textContent, "General");
  assert.equal(document.querySelector("nav input").placeholder, "Search settings…");
  assert.equal(document.querySelector("[data-settings-topbar] button").getAttribute("aria-label"), "Close dialog");
  dom.window.close();
});

test("closed settings do not scan streaming chat", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  const navLabel = document.querySelector("nav li span").firstChild;
  await waitFor(() => navLabel.nodeValue === "常规");
  document.querySelector("[data-settings-dialog-root]").remove();
  await waitFor(() => navLabel.nodeValue === "General");
  const scans = overlay.stats.settingsScans;
  const callbacks = overlay.stats.callbacks;
  for (let i = 0; i < 200; i++) document.querySelector("#chat").append("Thinking");
  await settle();
  assert.equal(overlay.stats.settingsScans, scans);
  assert.equal(overlay.stats.callbacks, callbacks);
  overlay.stop();
  dom.window.close();
});

test("translates a newly opened owned popup and restores it when ownership ends", async () => {
  const { dom, document } = fixture();
  document.querySelector('[aria-labelledby="approvals"]').remove();
  const overlay = startSettingsTranslation(document, dictionary);
  const popup = document.createElement("div");
  popup.setAttribute("role", "menu");
  popup.setAttribute("aria-labelledby", "approvals");
  popup.innerHTML = '<div role="menuitem">Approve all</div>';
  document.getElementById("portal-root").append(popup);
  await waitFor(() => popup.textContent === "全部批准");
  popup.setAttribute("aria-labelledby", "unrelated");
  await waitFor(() => popup.textContent === "Approve all");
  overlay.stop();
  dom.window.close();
});

test("restores text when a settings region becomes user content", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  const section = document.querySelector('[data-section-id="experimental-experiments"]');
  const label = section.querySelector("#wsl").firstChild;
  await waitFor(() => label.nodeValue === "WSL 主机");
  section.setAttribute("data-user-content", "");
  await waitFor(() => label.nodeValue === "WSL hosts");
  overlay.stop();
  dom.window.close();
});

test("translates only the observed split paragraph and preserves later host updates", async () => {
  const { dom, document } = fixture();
  let overlay = startSettingsTranslation(document, dictionary);
  const paragraph = document.querySelector("#split");
  const nodes = [...paragraph.childNodes];
  await waitFor(() => paragraph.textContent === "在系统托盘中显示 GitHub Copilot 图标。");
  assert.deepEqual([...paragraph.childNodes], nodes);
  overlay.stop();
  assert.equal(paragraph.textContent, "Show the GitHub Copilot icon in the system tray.");
  overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => paragraph.textContent === "在系统托盘中显示 GitHub Copilot 图标。");
  nodes[0].nodeValue = "Updated by host";
  await waitFor(() => nodes[1].nodeValue === "system tray");
  assert.equal(paragraph.textContent, "Updated by hostsystem tray.");
  overlay.stop();
  assert.equal(nodes[0].nodeValue, "Updated by host");
  dom.window.close();
});

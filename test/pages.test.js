import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { dictionary } from "../src/dictionary.js";
import { startSettingsTranslation } from "../src/overlay.js";

const prompt = "Describe what this automation should do. Type / for skills…";
const help = "The agent will help you design your automation in a chat.";
const explanation = "Use agents to handle recurring work on a cadence you choose or triggered by events. You can start from scratch or turn an existing agent skill into an automation.";
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
async function waitFor(predicate) {
  const until = Date.now() + 3000;
  while (!predicate() && Date.now() < until) await tick();
  assert.ok(predicate(), "timed out waiting for page controls");
}

function automation() {
  return `<div data-factory-proposal-host="true"><header><h1>Automations</h1><div>
    <div data-customize-category-header-row><div data-customize-category-drag-region><div><div>
      <div data-tab-row-scroller><div role="tablist">${["Personal", "Shared", "Dreaming"].map(label =>
        `<button role="tab" aria-selected="${label === "Personal"}"><span aria-hidden="true">${label}</span><span>${label}</span></button>`).join("")}
      </div></div></div></div></div>
      <div role="search"><div><input data-size="small" placeholder="Search personal automations…" value="Shared"></div></div>
      <button data-new-automation-action data-size="small"><span data-component="content"><span data-component="label">New automation</span></span></button>
    </div></div></header><div><div><div><div role="tabpanel"><main><div><div><div data-size="medium"><div>
      <div aria-hidden="true"></div><div id="setup-copy"><div>Set up automations</div><div>${explanation}</div></div>
      <div><div data-prompt-composer-v2 data-command-context="prompt-composer"><div data-rich-composer-root data-rc-consumer="prompt-composer">
        <div data-rich-composer-surface><div data-rich-composer-content-wrapper>
          <div role="textbox" contenteditable="true" data-lexical-editor="true" data-placeholder="${prompt}"
            aria-describedby="fictional-placeholder fictional-mode fictional-model"><p id="draft">Personal Chat Thinking</p></div>
        </div></div><span id="fictional-placeholder">${prompt}</span><span id="fictional-mode">Interactive</span><span id="fictional-model">Chat</span>
      </div></div></div><div data-rich-composer-footer><button data-base-ui-tooltip-trigger aria-describedby="fictional-help fictional-tooltip"><span>Chat</span></button>
        <span id="fictional-help">${help}</span><span id="fictional-tooltip">Fictional metadata</span>
        <button data-base-ui-tooltip-trigger aria-describedby="fictional-model">Chat</button>
      </div></div></div></div></div></main></div></div></div></div>
      <article data-testid="workflow-gallery-card"><h2>Personal</h2><p>${explanation}</p><span id="run-count">3</span></article>
    </div>`;
}

function customize() {
  return `<header data-content-leading-inset data-f6-nav><div><div data-customize-category-header-row>
    <div data-customize-category-drag-region><div data-customize-category-tabs-root="true">
      <span aria-hidden="true">Browse</span><div role="tablist"><button role="tab" aria-selected="true">Browse</button><button role="tab" aria-selected="false">Installed</button></div>
    </div></div><div><div><button data-testid="extensions-add-menu-trigger" id="fictional-add"
      aria-haspopup="menu" aria-expanded="true" aria-controls="fictional-add-menu"><span data-component="content"><span data-component="label">Add</span></span></button></div></div>
    </div></div></header><div role="tabpanel"><div role="search"><div><div><div>
      <input data-size="large" placeholder="Search MCP servers, plugins, skills and more…" value="Skill">
    </div></div></div><div><div><button data-testid="customize-type-filter-trigger" aria-haspopup="menu">All types</button></div></div></div>
    <div data-testid="customize-category-filter"><div role="tablist"><button role="tab">Installed</button></div></div>
    <section aria-labelledby="featured-editors-picks-heading"><div><div><h2 id="featured-editors-picks-heading">Editor’s picks</h2><p>Standout ways to customize Copilot.</p></div></div>
      <ul role="list" aria-labelledby="featured-editors-picks-heading"><li data-carousel-card>
        <div><h3 id="external-name">Browse</h3><p id="external-description">Standout ways to customize Copilot.</p><span id="install-count">30</span><div><div><div>
          <button data-variant="invisible" data-size="small"><span data-component="content"><span data-component="label">Add canvas</span></span></button>
        </div></div></div></div>
      </li></ul></section></div>`;
}

function work(title) {
  return `<div data-testid="my-work-inbox-view"><div data-testid="my-work-list-pane">
    <header data-content-leading-inset data-tauri-drag-region data-f6-nav><div><div><h1>${title}</h1></div></div></header>
    <div data-testid="my-work-filter-bar"><div><div data-tab-row-scroller><div role="tablist">
      <button role="tab">Assigned to me</button><button role="tab">Done</button><button role="tab">Assigned to me</button>
    </div></div></div></div><div><div data-testid="my-work-inbox-scroll-container" role="tabpanel" data-f6-nav>
      <div><div data-size="medium"><div><div><span>Nothing here</span></div></div></div></div>
      <article><h2>Nothing here</h2><p>No items match "Fictional filter"</p></article>
    </div></div></div></div>`;
}

function fixture(initial) {
  const dom = new JSDOM('<body><main data-app-shell-main><div><div><div id="route"></div></div></div></main><div id="portal-root"></div></body>');
  const document = dom.window.document;
  const route = document.getElementById("route");
  function show(markup, isWork = false) {
    route.innerHTML = isWork ? `<div>${markup}</div>` : `<div><div>${markup}</div></div>`;
  }
  show(initial);
  const overlay = startSettingsTranslation(document, dictionary);
  return { dom, document, route, overlay, show };
}

test("factory fixed controls and related descriptions translate without reading editable drafts or cards", async () => {
  const { dom, document, overlay } = fixture(automation());
  const editor = document.querySelector('[data-lexical-editor]');
  await waitFor(() => document.getElementById("fictional-help").textContent === dictionary[help] &&
    document.getElementById("fictional-placeholder").textContent === dictionary[prompt] &&
    editor.getAttribute("data-placeholder") === dictionary[prompt] &&
    document.querySelector('[data-new-automation-action]').textContent === "新建自动化");
  assert.deepEqual([...document.querySelectorAll('header [role=tab] span:last-child')].map(node => node.textContent),
    ["个人", "共享", "构想"]);
  assert.equal(document.querySelector("h1").textContent, "自动化");
  assert.equal(document.querySelector("input").placeholder, "搜索个人自动化…");
  assert.equal(document.querySelector("input").value, "Shared");
  assert.equal(document.getElementById("setup-copy").firstElementChild.textContent, "设置自动化");
  assert.equal(document.getElementById("fictional-placeholder").textContent, dictionary[prompt]);
  assert.equal(document.getElementById("fictional-mode").textContent, "Interactive");
  assert.equal(document.getElementById("fictional-model").textContent, "Chat");
  assert.equal(document.querySelector('button[aria-describedby="fictional-model"]').textContent, "Chat");
  assert.equal(document.getElementById("draft").textContent, "Personal Chat Thinking");
  assert.equal(document.querySelector("[data-testid=workflow-gallery-card] p").textContent, explanation);
  await tick();
  const before = { ...overlay.stats };
  for (let i = 0; i < 100; i++) {
    document.getElementById("draft").firstChild.nodeValue = `Thinking ${i}`;
    document.getElementById("run-count").textContent = String(i);
    document.querySelector("input").value = String(i);
  }
  await tick();
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) assert.equal(overlay.stats[key], before[key], key);
  const newButton = document.querySelector('[data-new-automation-action]');
  newButton.removeAttribute("data-new-automation-action");
  await waitFor(() => newButton.textContent === "New automation");
  editor.removeAttribute("data-lexical-editor");
  await waitFor(() => editor.getAttribute("data-placeholder") === prompt &&
    document.getElementById("fictional-placeholder").textContent === prompt);
  editor.setAttribute("data-placeholder", "Fictional generated prompt");
  await tick();
  assert.equal(editor.getAttribute("data-placeholder"), "Fictional generated prompt");
  overlay.stop();
  assert.equal(document.getElementById("fictional-help").textContent, help);
  assert.equal(document.getElementById("fictional-placeholder").textContent, prompt);
  assert.equal(document.getElementById("draft").textContent, "Thinking 99");
  dom.window.close();
});

test("customize static controls and owned Add items translate, not marketplace content or category tabs", async () => {
  const { dom, document, overlay } = fixture(customize());
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-base-ui-portal", "");
  wrapper.innerHTML = `<div role="presentation" data-open><div role="menu" id="fictional-add-menu" data-open data-rootownerid="fictional-owner" aria-labelledby="fictional-add">
    ${[["mcp", "MCP Server…"], ["plugin", "Plugin…"], ["skill", "Skill"], ["canvas", "Canvas from URL…"]].map(([id, label]) =>
      `<div><div><div role="menuitem" data-testid="extensions-add-menu-${id}"><span><span>${label}</span></span></div></div></div>`).join("")}
    <div role="menuitem">Manage marketplaces…</div><div role="menuitem">Fictional marketplace</div>
    </div></div>`;
  document.body.append(wrapper);
  await waitFor(() => document.querySelector('[data-testid=extensions-add-menu-mcp]').textContent === "MCP 服务器…" &&
    [...wrapper.querySelectorAll('[role="menuitem"]')].slice(0, 5).map(node => node.textContent).join("|") ===
      "MCP 服务器…|插件…|技能|从 URL 添加画布…|管理市场…" &&
    document.querySelector("input").placeholder === "搜索 MCP 服务器、插件、技能等…" &&
    document.querySelector("[data-carousel-card] button").textContent === "添加画布");
  assert.deepEqual([...document.querySelectorAll('[data-customize-category-tabs-root] [role=tab]')].map(node => node.textContent), ["浏览", "已安装"]);
  assert.equal(document.querySelector("[data-testid=customize-category-filter] button").textContent, "Installed");
  assert.equal(document.querySelector("[data-testid=customize-type-filter-trigger]").textContent, "所有类型");
  assert.equal(document.querySelector("input").value, "Skill");
  assert.equal([...wrapper.querySelectorAll('[role="menuitem"]')].at(-1).textContent, "Fictional marketplace");
  assert.equal(document.getElementById("featured-editors-picks-heading").textContent, "精选推荐");
  assert.equal(document.getElementById("external-name").textContent, "Browse");
  assert.equal(document.getElementById("external-description").textContent, "Standout ways to customize Copilot.");
  await tick();
  const before = { ...overlay.stats };
  for (let i = 0; i < 100; i++) {
    document.getElementById("external-name").firstChild.nodeValue = `Fictional plugin ${i}`;
    document.getElementById("external-description").textContent = `External description ${i}`;
    document.getElementById("install-count").textContent = String(i);
  }
  await tick();
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) assert.equal(overlay.stats[key], before[key], key);
  document.getElementById("fictional-add").setAttribute("data-testid", "fictional-unowned");
  await waitFor(() => document.querySelector('[data-testid=extensions-add-menu-mcp]').textContent === "MCP Server…");
  await tick();
  const unownedBefore = { ...overlay.stats };
  wrapper.querySelector('[data-testid=extensions-add-menu-mcp] span span').textContent = "Plugin…";
  await tick();
  assert.equal(overlay.stats.callbacks, unownedBefore.callbacks);
  assert.equal(overlay.stats.portalScans, unownedBefore.portalScans);
  overlay.stop();
  assert.equal(document.querySelector("input").placeholder, "Search MCP servers, plugins, skills and more…");
  assert.equal(document.getElementById("external-name").textContent, "Fictional plugin 99");
  dom.window.close();
});

test("the observed route boundary discovers page switches but never translates indistinguishable work tabs or results", async () => {
  const { dom, document, overlay, show } = fixture(automation());
  await waitFor(() => document.querySelector("h1").textContent === "自动化");
  show(work("Pull requests"), true);
  await waitFor(() => document.querySelector("h1").textContent === "拉取请求");
  assert.deepEqual([...document.querySelectorAll("[role=tab]")].map(node => node.textContent), ["Assigned to me", "Done", "Assigned to me"]);
  assert.equal(document.querySelector("[data-size=medium] span").textContent, "Nothing here");
  show(work("Issues"), true);
  await waitFor(() => document.querySelector("h1").textContent === "议题");
  show(customize());
  await waitFor(() => document.querySelector('[data-customize-category-tabs-root] button').textContent === "浏览");
  show('<div id="chat"><p>Thinking</p><div role="tablist"><button role="tab">Personal</button></div></div>');
  await tick();
  await tick();
  const before = { ...overlay.stats };
  for (let i = 0; i < 100; i++) {
    document.querySelector("#chat p").textContent = `Thought for ${i} seconds`;
    const span = document.createElement("span");
    span.textContent = "Sent message to user";
    document.getElementById("chat").append(span);
  }
  await tick();
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) assert.equal(overlay.stats[key], before[key], key);
  assert.equal(document.querySelector("#chat button").textContent, "Personal");
  show(automation());
  await waitFor(() => document.querySelector("h1").textContent === "自动化");
  overlay.stop();
  dom.window.close();
});

test("starting in the primary chat composer discovers a later page without observing streaming chat", async () => {
  const { dom, document, overlay, show } = fixture('<div data-testid="conversation-composer-area"><div data-rich-composer-footer></div></div><div id="chat"><p>Thinking</p></div>');
  await tick();
  const before = { ...overlay.stats };
  for (let i = 0; i < 100; i++) document.querySelector("#chat p").textContent = `Thinking ${i}`;
  await tick();
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) assert.equal(overlay.stats[key], before[key], key);
  await tick();
  show(automation());
  await waitFor(() => document.querySelector("h1").textContent === "自动化");
  overlay.stop();
  dom.window.close();
});

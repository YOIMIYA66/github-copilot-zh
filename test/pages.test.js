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
  const until = Date.now() + 4000;
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
      <button role="tab" aria-selected="true" data-tauri-drag-region="false">Assigned to me</button>
      <button role="tab" aria-selected="false" data-tauri-drag-region="false">Done</button>
      <button role="tab" aria-selected="false" data-tauri-drag-region="false">Assigned to me</button>
      <button role="tab" aria-selected="false" data-tauri-drag-region="false">Fictional custom filter</button>
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

test("native Customize heading and known fixed categories translate without scanning card values", async () => {
  const markup = `<header data-content-leading-inset="true" data-f6-nav><h1>Customize</h1>
    <div><div data-customize-category-header-row>
      <div data-customize-category-drag-region><div data-customize-category-tabs-root="true"><div role="tablist">
        <button role="tab"><span><span><span>Browse</span><span aria-hidden="true">Browse</span></span></span></button>
        <button role="tab"><span><span><span>Installed</span><span aria-hidden="true">Installed</span></span></span></button>
      </div></div></div><div></div><div><button data-testid="extensions-add-menu-trigger" aria-haspopup="menu">
        <span data-component="content"><span data-component="label">Add</span></span></button></div>
    </div></div><div data-window-caption-spacer="true"></div>
    </header><div role="tabpanel"><div data-testid="customize-category-filter"><div><div role="tablist">
      <button role="tab" aria-selected="true"><span>All</span></button>
      <button role="tab" aria-selected="false"><span>Development</span></button>
      <button role="tab" aria-selected="false"><span>Intelligence</span></button>
      <button role="tab"><span>Fictional category</span></button>
      <button role="tab"><span>Commerce</span><span id="category-count">12</span></button>
    </div></div></div><article><h2>Development</h2><p>Intelligence</p>
      <input value="All"><pre>Commerce</pre></article></div>`;
  const { dom, document, overlay } = fixture(markup);
  const heading = document.querySelector("h1");
  const labels = [...document.querySelectorAll('[data-testid="customize-category-filter"] button > span:first-child')];
  await waitFor(() => heading.textContent === "扩展中心" && labels[2].textContent === "智能");
  assert.deepEqual(labels.map(label => label.textContent),
    ["全部", "开发", "智能", "Fictional category", "Commerce"]);
  assert.equal(document.querySelector('header [role="tab"]').textContent, "浏览浏览");
  assert.equal(document.querySelector("article h2").textContent, "Development");
  assert.equal(document.querySelector("article p").textContent, "Intelligence");
  assert.equal(document.querySelector("input").value, "All");
  assert.equal(document.querySelector("pre").textContent, "Commerce");
  await tick();
  const before = overlay.stats.callbacks;
  document.getElementById("category-count").firstChild.nodeValue = "13";
  document.querySelector("article p").firstChild.nodeValue = "Private replacement";
  await tick();
  assert.equal(overlay.stats.callbacks, before);
  document.querySelector("[data-window-caption-spacer]").removeAttribute("data-window-caption-spacer");
  await waitFor(() => heading.textContent === "Customize" && labels[0].textContent === "All");
  overlay.stop();
  assert.equal(document.querySelector("article p").textContent, "Private replacement");
  dom.window.close();
});

test("owned work filters map exact display labels including same-named custom tabs without touching results", async () => {
  const { dom, document, overlay, show } = fixture(automation());
  await waitFor(() => document.querySelector("h1").textContent === "自动化");
  show(work("Pull requests"), true);
  await waitFor(() => document.querySelector("h1").textContent === "拉取请求" &&
    document.querySelectorAll("[role=tab]")[2].textContent === "分配给我的");
  assert.deepEqual([...document.querySelectorAll("[role=tab]")].map(node => node.textContent),
    ["分配给我的", "已完成", "分配给我的", "Fictional custom filter"]);
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

test("work empty captions require the complete direct-child shell and fixed message prefix", async () => {
  const { dom, document, overlay } = fixture(work("Issues"));
  const panel = document.querySelector("[data-testid=my-work-inbox-scroll-container]");
  panel.innerHTML = `<div><div data-size="medium"><div><div><span>Nothing here</span></div>
    <div>No items match "Fictional saved filter"</div></div></div></div>`;
  const caption = panel.querySelector("span");
  const message = panel.querySelector("[data-size] > div > div:last-child");
  const getText = Object.getOwnPropertyDescriptor(dom.window.Node.prototype, "textContent");
  Object.defineProperty(message, "textContent", { get() { throw new Error("Filter name must not be captured"); } });
  await waitFor(() => caption.textContent === "这里暂无内容");
  assert.equal(getText.get.call(message), 'No items match "Fictional saved filter"');
  message.firstChild.nodeValue = "Fictional user description";
  await waitFor(() => caption.textContent === "Nothing here");
  panel.innerHTML = '<div><article><h2>Nothing here</h2><p>No items match "Fictional body text"</p></article></div>';
  await tick();
  await tick();
  assert.equal(panel.querySelector("h2").textContent, "Nothing here");
  const before = { ...overlay.stats };
  for (let i = 0; i < 100; i++) panel.querySelector("p").textContent = `Fictional result ${i}`;
  await tick();
  for (const key of ["settingsScans", "portalScans", "chromeScans", "callbacks"]) assert.equal(overlay.stats[key], before[key], key);
  panel.innerHTML = '<div><div data-size="medium"><div><div><span>Nothing here</span></div><div>Fictional result summary</div></div></div></div>';
  await tick();
  assert.equal(panel.querySelector("span").textContent, "Nothing here");
  overlay.stop();
  dom.window.close();
});

test("customize live categories, section headers, and category heading translate while third-party cards remain English", async () => {
  const categories = ["All", "Plan", "Build", "Review", "Test", "Ship", "Monitor", "Design", "Knowledge", "Data", "Communication"];
  const markup = `<header data-content-leading-inset="true" data-f6-nav><h1>Customize</h1>
    <div><div data-customize-category-header-row>
      <div data-customize-category-drag-region><div data-customize-category-tabs-root="true"><div role="tablist">
        <button role="tab">Browse</button>
      </div></div></div><div></div><div><button data-testid="extensions-add-menu-trigger" aria-haspopup="menu">
        <span data-component="content"><span data-component="label">Add</span></span></button></div>
    </div></div><div data-window-caption-spacer="true"></div>
    </header><div role="tabpanel">
      <div data-testid="customize-category-filter"><div><div role="tablist">
        ${categories.map((cat, i) => `<button role="tab" aria-selected="${i === 1}"><span><span><span>${cat}</span></span></span></button>`).join("\n        ")}
      </div></div></div>
      <h2 id="browse-integrations-heading">Plan</h2>
      <section aria-labelledby="featured-heading">
        <div><div><h2 id="featured-heading">Featured</h2><p>Standout ways to customize Copilot.</p></div></div>
        <ul role="list"><li><article><h3>Airtable</h3><p>Sync records with Airtable base</p></article></li></ul>
      </section>
      <section aria-labelledby="plan-build-heading">
        <div><div><h2 id="plan-build-heading">Plan, build, and ship</h2><p>Tools for planning work, testing experiences, and shipping with confidence.</p></div></div>
        <ul role="list"><li><article><h3>Slack</h3><p>Send notifications to Slack</p></article></li></ul>
      </section>
      <section aria-labelledby="connect-heading">
        <div><div><h2 id="connect-heading">Connect your work</h2><p>Bring the tools and context you use every day into Copilot.</p></div></div>
        <ul role="list"><li><article><h3>Apify</h3><p>Extract data from web</p></article></li></ul>
      </section>
    </div>`;
  const { dom, document, overlay } = fixture(markup);
  const heading = document.querySelector("h1");
  const browseHeading = document.getElementById("browse-integrations-heading");
  const catLeaves = [...document.querySelectorAll('[data-testid="customize-category-filter"] button span span span')];
  await waitFor(() => heading.textContent === "扩展中心" &&
    browseHeading.textContent === "规划" &&
    catLeaves[1].textContent === "规划" &&
    document.getElementById("connect-heading")?.textContent === "连接你的工作" &&
    document.querySelector('section[aria-labelledby="plan-build-heading"] p')?.textContent === "用于规划工作、测试体验和可靠交付的工具。" &&
    document.querySelector('section[aria-labelledby="connect-heading"] p')?.textContent === "将日常使用的工具与上下文带入 Copilot。");
  assert.equal(catLeaves[0].textContent, "全部");
  assert.equal(catLeaves[1].textContent, "规划");
  assert.equal(catLeaves[2].textContent, "构建");
  assert.equal(catLeaves[3].textContent, "评审");
  assert.equal(catLeaves[4].textContent, "测试");
  assert.equal(catLeaves[5].textContent, "交付");
  assert.equal(catLeaves[6].textContent, "监控");
  assert.equal(catLeaves[7].textContent, "设计");
  assert.equal(catLeaves[8].textContent, "知识");
  assert.equal(catLeaves[9].textContent, "数据");
  assert.equal(catLeaves[10].textContent, "沟通");

  assert.equal(document.getElementById("featured-heading").textContent, "精选");
  assert.equal(document.getElementById("plan-build-heading").textContent, "规划、构建与交付");
  assert.equal(document.getElementById("connect-heading").textContent, "连接你的工作");
  assert.equal(document.querySelector('section[aria-labelledby="plan-build-heading"] p').textContent, "用于规划工作、测试体验和可靠交付的工具。");
  assert.equal(document.querySelector('section[aria-labelledby="connect-heading"] p').textContent, "将日常使用的工具与上下文带入 Copilot。");

  // Third-party cards MUST stay English
  assert.equal(document.querySelector("article h3").textContent, "Airtable");
  assert.equal(document.querySelector("article p").textContent, "Sync records with Airtable base");

  overlay.stop();
  assert.equal(heading.textContent, "Customize");
  assert.equal(browseHeading.textContent, "Plan");
  assert.equal(catLeaves[1].textContent, "Plan");
  assert.equal(document.getElementById("plan-build-heading").textContent, "Plan, build, and ship");
  assert.equal(document.querySelector("article h3").textContent, "Airtable");
  dom.window.close();
});

test("home page heading, prompt suggestion cards, disclaimer, status bar, and actions translate cleanly", async () => {
  const markup = `<main data-app-shell-main>
    <h1 class="sr-only">New</h1>
    <p>GitHub Copilot uses AI. Check for mistakes.</p>
    <div data-testid="conversation-composer-area">
      <div data-testid="prompt-suggestions">
        <button><span>Compare SQL and NoSQL database tradeoffs</span></button>
        <button><span>Design a REST API for a task management service</span></button>
        <button><span>Draft a product requirements doc for a mobile app</span></button>
      </div>
      <div role="status">
        <span>You've used all of your AI credits.</span>
        <span>Manage your budget to keep building.</span>
        <button>Manage budget</button>
      </div>
      <div data-testid="home-actions">
        <button>Try now</button>
        <button>Dismiss</button>
        <button>This computer</button>
      </div>
    </div>
    <div data-testid="conversation-body"><p>User question about React</p><code>const a = 1;</code></div>
  </main>`;
  const dom = new JSDOM(`<body>${markup}<div id="portal-root"></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const h1 = document.querySelector("h1");
  const p = document.querySelector("main > p");
  const promptButtons = [...document.querySelectorAll('[data-testid="prompt-suggestions"] button span')];
  const statusDiv = document.querySelector('div[role="status"]');
  const actionButtons = [...document.querySelectorAll('[data-testid="home-actions"] button')];

  await waitFor(() => h1.textContent === "新建" &&
    p.textContent === "GitHub Copilot 使用 AI，请核对结果是否有误。" &&
    promptButtons[0].textContent === "比较 SQL 和 NoSQL 数据库的权衡" &&
    statusDiv.querySelector("button").textContent === "管理预算" &&
    actionButtons[0].textContent === "立即体验" &&
    actionButtons[1].textContent === "关闭" &&
    actionButtons[2].textContent === "此计算机");

  assert.equal(promptButtons[1].textContent, "为任务管理服务设计 REST API");
  assert.equal(promptButtons[2].textContent, "为移动应用起草产品需求文档");
  assert.equal(statusDiv.children[0].textContent, "你的 AI 点数已用尽。");
  assert.equal(statusDiv.children[1].textContent, "管理预算以继续构建。");
  assert.equal(actionButtons[0].textContent, "立即体验");
  assert.equal(actionButtons[1].textContent, "关闭");
  assert.equal(actionButtons[2].textContent, "此计算机");

  // Conversation body stays untouched
  assert.equal(document.querySelector('[data-testid="conversation-body"] p').textContent, "User question about React");
  assert.equal(document.querySelector('[data-testid="conversation-body"] code').textContent, "const a = 1;");

  overlay.stop();
  assert.equal(h1.textContent, "New");
  assert.equal(p.textContent, "GitHub Copilot uses AI. Check for mistakes.");
  assert.equal(promptButtons[0].textContent, "Compare SQL and NoSQL database tradeoffs");
  assert.equal(statusDiv.querySelector("button").textContent, "Manage budget");
  assert.equal(actionButtons[0].textContent, "Try now");
  dom.window.close();
});

test("composer placeholders in both text node and data-placeholder attribute translate and restore cleanly", async () => {
  const placeholder = "Ask anything. Use / for commands or & for sessions…";
  const markup = `<main data-app-shell-main>
    <div data-testid="conversation-composer-area">
      <div data-rich-composer-placeholder="true">${placeholder}</div>
      <div role="textbox" contenteditable="true" data-placeholder="${placeholder}"></div>
    </div>
  </main>`;
  const dom = new JSDOM(`<body>${markup}<div id="portal-root"></div></body>`);
  const { document } = dom.window;
  const overlay = startSettingsTranslation(document, dictionary);
  const textDiv = document.querySelector('[data-rich-composer-placeholder="true"]');
  const textbox = document.querySelector('div[role="textbox"]');

  await waitFor(() => textDiv.textContent === "输入问题。用 / 调用命令或 & 引用会话…" &&
    textbox.getAttribute("data-placeholder") === "输入问题。用 / 调用命令或 & 引用会话…");

  overlay.stop();
  assert.equal(textDiv.textContent, placeholder);
  assert.equal(textbox.getAttribute("data-placeholder"), placeholder);
  dom.window.close();
});

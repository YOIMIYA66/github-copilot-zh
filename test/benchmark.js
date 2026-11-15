import { performance } from "node:perf_hooks";
import { JSDOM } from "jsdom";
import { dictionary } from "../src/dictionary.js";
import { startSettingsTranslation } from "../src/overlay.js";

const dom = new JSDOM(`<body><main data-app-shell-main data-f6-nav><div data-testid="conversation-root">
  <aside data-sidebar-root data-sidebar-live-width><div data-testid="sidebar-floating-surface"><div data-testid="sidebar-scroll-viewport"><div>
    <nav aria-labelledby="quick-links-heading"><h2 id="quick-links-heading">Quick links</h2><ul>
      <li><button data-sidebar-nav-item="home" data-command="navigation.home" data-sidebar-file-drop-kind="new"><span>New</span></button></li>
      <li><button data-sidebar-nav-item="pulls" data-command="navigation.pulls"><span>Pull requests</span></button></li>
      <li><button data-sidebar-nav-item="issues" data-command="navigation.issues"><span>Issues</span></button></li>
      <li><button data-sidebar-nav-item="workflows" data-command="navigation.automations"><span>Automations</span></button></li>
      <li><button data-sidebar-nav-item="extensions" data-command="navigation.customize"><span>Customize</span></button></li>
    </ul></nav></div><ul><li><button>Fictional session</button></li></ul></div><nav data-sidebar-footer></nav></div></aside>
  <div data-testid="conversation-composer-area"><div data-testid="composer-pills">
    <button data-testid="background-activity-pill" aria-controls="background-activity-list"><span>Background</span><span>0</span></button>
    <button data-testid="artifact-files-pill" aria-controls="artifact-files-list"><span>Artifacts</span><span>0</span></button>
  </div><div data-rich-composer-footer></div></div><div id="chat"></div>
  </div></main><div id="portal-root"></div></body>`);
const { document } = dom.window;
const chat = document.querySelector("#chat");
for (let i = 0; i < 5000; i++) {
  const span = document.createElement("span");
  span.textContent = "Thinking";
  chat.append(span);
}
const overlay = startSettingsTranslation(document, dictionary, { measure: true });
const wait = () => new Promise(resolve => setTimeout(resolve, 0));
async function settleObservers() {
  const deadline = Date.now() + 3000;
  let previous = "";
  let stable = 0;
  while (Date.now() < deadline) {
    await wait();
    const current = JSON.stringify([overlay.stats.callbacks, overlay.stats.settingsScans,
      overlay.stats.chromeScans, overlay.stats.portalScans, overlay.stats.batchMs.length]);
    stable = current === previous ? stable + 1 : 0;
    if (stable >= 3) return;
    previous = current;
  }
  throw new Error("UI setup observers did not settle");
}
while (document.querySelector('[data-testid="artifact-files-pill"] span').textContent !== "产物") await wait();
await wait();
async function run(label) {
  await settleObservers();
  const before = overlay.stats.settingsScans;
  const chromeBefore = overlay.stats.chromeScans;
  const portalBefore = overlay.stats.portalScans;
  const callbacksBefore = overlay.stats.callbacks;
  const started = performance.now();
  for (let i = 0; i < 1000; i++) chat.children[i].textContent = `Thinking ${i}`;
  await wait();
  if (overlay.stats.settingsScans !== before || overlay.stats.chromeScans !== chromeBefore ||
      overlay.stats.portalScans !== portalBefore || overlay.stats.callbacks !== callbacksBefore) {
    throw new Error(`${label}: chat updates reached localization observers`);
  }
  console.log(JSON.stringify({ label, chatNodes: chat.children.length, updates: 1000,
    settingsScans: overlay.stats.settingsScans - before,
    chromeScans: overlay.stats.chromeScans - chromeBefore,
    portalScans: overlay.stats.portalScans - portalBefore,
    callbacks: overlay.stats.callbacks - callbacksBefore,
    elapsedMs: Number((performance.now() - started).toFixed(2)) }));
}
await run("settings closed");
const dialog = document.createElement("div");
dialog.setAttribute("role", "dialog");
dialog.setAttribute("data-settings-dialog-root", "");
dialog.innerHTML = `<section data-section-id="experimental-experiments">${
  Array.from({ length: 300 }, () => `<div data-settings-row><div><h3>WSL hosts</h3><p>Discover WSL distributions and create sessions inside them.</p></div></div>`).join("")
}</section>`;
const openStart = performance.now();
document.getElementById("portal-root").append(dialog);
while (dialog.querySelectorAll("h3")[299].textContent !== "WSL 主机" ||
    dialog.querySelectorAll("p")[299].textContent !== dictionary["Discover WSL distributions and create sessions inside them."]) await wait();
console.log(JSON.stringify({ label: "open settings", settingsElements: dialog.querySelectorAll("*").length,
  elapsedMs: Number((performance.now() - openStart).toFixed(2)) }));
await run("settings open");
const before = overlay.stats.settingsScans;
const settingsBatchesBefore = overlay.stats.batchMs.length;
const settingsCallbacksBefore = overlay.stats.callbackMs.length;
const start = performance.now();
const headings = [...dialog.querySelectorAll("h3")].map(e => e.firstChild);
for (let batch = 0; batch < 100; batch++) {
  for (let i = 0; i < 10; i++) headings[i].nodeValue = batch % 2 ? "WSL hosts" : "Remote control";
  await wait();
}
while (headings[0].nodeValue !== "WSL 主机") await wait();
await settleObservers();
const summarize = samples => {
  const sorted = [...samples].sort((a, b) => a - b);
  return { samples: sorted.length, p95Ms: Number((sorted[Math.ceil(sorted.length * 0.95) - 1] || 0).toFixed(2)),
    maxMs: Number((sorted.at(-1) || 0).toFixed(2)) };
};
console.log(JSON.stringify({ label: "settings label updates", settingsElements: dialog.querySelectorAll("*").length,
  updates: 1000, settingsScans: overlay.stats.settingsScans - before,
  elapsedMs: Number((performance.now() - start).toFixed(2)),
  drainBatches: summarize(overlay.stats.batchMs.slice(settingsBatchesBefore)),
  observerCallbacks: summarize(overlay.stats.callbackMs.slice(settingsCallbacksBefore)) }));
dialog.remove();
await wait();
const page = document.createElement("div");
page.innerHTML = `<div><div><div><div data-testid="my-work-inbox-view">
  <div data-testid="my-work-list-pane"><div data-testid="my-work-filter-bar"><div><div data-tab-row-scroller>
    <div role="tablist"><button role="tab" aria-selected="true">Assigned to me</button></div>
  </div></div></div><div data-testid="my-work-inbox-scroll-container" role="tabpanel" data-f6-nav>
    <div data-size="medium"><span>Nothing here</span></div>
  </div></div>
</div></div></div></div>`;
document.querySelector("main").append(page);
await wait();
await run("unverified PR/Issue page present");
page.innerHTML = `<header><h1>Automations</h1><div><div data-tab-row-scroller>
  <div role="tablist"><button role="tab">Done</button></div>
</div></div></header><div data-testid="workflow-gallery-card"><h2>Fictional automation</h2></div>`;
await wait();
await run("unverified Automations page present");
page.remove();
await wait();
await run("work pages removed");
const verifiedPage = document.createElement("div");
verifiedPage.innerHTML = `<div><div><div><div><div data-factory-proposal-host="true"><header><h1>Automations</h1>
  <div><div data-customize-category-header-row><div data-customize-category-drag-region><div><div>
    <div data-tab-row-scroller><div role="tablist">${["Personal", "Shared", "Dreaming"].map(label =>
      `<button role="tab" aria-selected="${label === "Personal"}"><span>${label}</span></button>`).join("")}
    </div></div></div></div></div></div></div></header>
  <div data-testid="workflow-gallery-card"><h2>Fictional automation</h2><p id="external-summary">External content</p></div>
</div></div></div></div></div>`;
document.querySelector("main").append(verifiedPage);
async function settle(predicate) {
  const deadline = Date.now() + 3000;
  while (!predicate() && Date.now() < deadline) await wait();
  if (!predicate()) throw new Error("Verified page controls did not settle");
  await wait();
}
await settle(() => verifiedPage.querySelector('[role="tab"] span').textContent === "个人");
await run("verified Automations header present");
const pageLabels = [...verifiedPage.querySelectorAll('[role="tab"] span')].map(node => node.firstChild);
const pageBefore = overlay.stats.chromeScans;
const pageBatchesBefore = overlay.stats.batchMs.length;
const pageCallbacksBefore = overlay.stats.callbackMs.length;
const pageStart = performance.now();
for (let batch = 0; batch < 100; batch++) {
  pageLabels.forEach((node, index) => { node.nodeValue = ["Personal", "Shared", "Dreaming"][index]; });
  await wait();
}
await settle(() => pageLabels[2].nodeValue === "构想");
console.log(JSON.stringify({ label: "verified page label updates", controls: 3, updates: 300,
  chromeScans: overlay.stats.chromeScans - pageBefore,
  elapsedMs: Number((performance.now() - pageStart).toFixed(2)),
  drainBatches: summarize(overlay.stats.batchMs.slice(pageBatchesBefore)),
  observerCallbacks: summarize(overlay.stats.callbackMs.slice(pageCallbacksBefore)) }));
const externalBefore = { ...overlay.stats };
const externalStart = performance.now();
for (let i = 0; i < 1000; i++) verifiedPage.querySelector("#external-summary").textContent = `External content ${i}`;
await wait();
console.log(JSON.stringify({ label: "external card updates", updates: 1000,
  settingsScans: overlay.stats.settingsScans - externalBefore.settingsScans,
  portalScans: overlay.stats.portalScans - externalBefore.portalScans,
  chromeScans: overlay.stats.chromeScans - externalBefore.chromeScans,
  callbacks: overlay.stats.callbacks - externalBefore.callbacks,
  elapsedMs: Number((performance.now() - externalStart).toFixed(2)) }));
verifiedPage.remove();
await wait();
await run("verified page removed");
const sidebarLabels = [...document.querySelectorAll('[data-sidebar-nav-item] span')].map(node => node.firstChild);
const originals = ["New", "Pull requests", "Issues", "Automations", "Customize"];
const sidebarBefore = overlay.stats.chromeScans;
const batchesBefore = overlay.stats.batchMs.length;
const callbackSamplesBefore = overlay.stats.callbackMs.length;
const sidebarStart = performance.now();
for (let batch = 0; batch < 100; batch++) {
  sidebarLabels.forEach((node, index) => { node.nodeValue = originals[index]; });
  await wait();
}
while (sidebarLabels[4].nodeValue !== "扩展中心") await wait();
console.log(JSON.stringify({ label: "sidebar label updates", controls: 5, updates: 500,
  chromeScans: overlay.stats.chromeScans - sidebarBefore,
  elapsedMs: Number((performance.now() - sidebarStart).toFixed(2)),
  drainBatches: summarize(overlay.stats.batchMs.slice(batchesBefore)),
  observerCallbacks: summarize(overlay.stats.callbackMs.slice(callbackSamplesBefore)) }));
overlay.stop();
dom.window.close();

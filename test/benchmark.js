import { performance } from "node:perf_hooks";
import { JSDOM } from "jsdom";
import { dictionary } from "../src/dictionary.js";
import { startSettingsTranslation } from "../src/overlay.js";

const dom = new JSDOM(`<body><main data-app-shell-main data-f6-nav><div data-testid="conversation-root">
  <aside data-sidebar-root><div data-testid="sidebar-floating-surface"><div data-testid="sidebar-scroll-viewport">
    <nav aria-labelledby="quick-links-heading"><h2 id="quick-links-heading">Quick links</h2><ul>
      <li><button><span>Automations</span></button></li><li><button><span>Customize</span></button></li>
    </ul></nav></div><nav data-sidebar-footer></nav></div></aside>
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
async function run(label) {
  const before = overlay.stats.settingsScans;
  const chromeBefore = overlay.stats.chromeScans;
  const started = performance.now();
  for (let i = 0; i < 1000; i++) chat.children[i].textContent = `Thinking ${i}`;
  await wait();
  console.log(JSON.stringify({ label, chatNodes: chat.children.length, updates: 1000,
    settingsScans: overlay.stats.settingsScans - before,
    chromeScans: overlay.stats.chromeScans - chromeBefore,
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
while (dialog.querySelectorAll("h3")[299].textContent !== "WSL 主机") await wait();
console.log(JSON.stringify({ label: "open settings", settingsElements: dialog.querySelectorAll("*").length,
  elapsedMs: Number((performance.now() - openStart).toFixed(2)) }));
await run("settings open");
const before = overlay.stats.settingsScans;
const start = performance.now();
const headings = [...dialog.querySelectorAll("h3")].map(e => e.firstChild);
for (let batch = 0; batch < 100; batch++) {
  for (let i = 0; i < 10; i++) headings[i].nodeValue = batch % 2 ? "WSL hosts" : "Remote control";
  await wait();
}
while (headings[0].nodeValue !== "WSL 主机") await wait();
const summarize = samples => {
  const sorted = [...samples].sort((a, b) => a - b);
  return { samples: sorted.length, p95Ms: Number((sorted[Math.ceil(sorted.length * 0.95) - 1] || 0).toFixed(2)),
    maxMs: Number((sorted.at(-1) || 0).toFixed(2)) };
};
console.log(JSON.stringify({ label: "settings label updates", settingsElements: dialog.querySelectorAll("*").length,
  updates: 1000, settingsScans: overlay.stats.settingsScans - before,
  elapsedMs: Number((performance.now() - start).toFixed(2)), drainBatches: summarize(overlay.stats.batchMs),
  observerCallbacks: summarize(overlay.stats.callbackMs) }));
overlay.stop();
dom.window.close();

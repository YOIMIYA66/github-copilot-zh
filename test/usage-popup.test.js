import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { dictionary } from "../src/dictionary.js";
import { startSettingsTranslation } from "../src/overlay.js";

async function waitFor(predicate) {
  const end = Date.now() + 2000;
  while (!predicate() && Date.now() < end) await new Promise(resolve => setTimeout(resolve, 0));
  assert.ok(predicate(), "timed out waiting for usage popup");
}

function fixture() {
  const dom = new JSDOM(`<!doctype html><body>
    <main data-app-shell-main>
      <div data-prompt-composer-v2 data-command-context="prompt-composer">
        <div data-rc-consumer="prompt-composer"><surface>
          <div data-rich-composer-footer="true"><div>
            <div data-prompt-composer-trailing-actions="true">
              <button id="quota-trigger" data-base-ui-click-trigger aria-haspopup="dialog"
                aria-expanded="true" aria-controls="usage-dialog"
                aria-label="AI credits quota: 41%, Alt+C"></button>
            </div>
          </div></div>
        </surface></div>
      </div>
      <p>Thinking</p>
    </main>
    <div id="portal-root"></div>
    <div data-base-ui-portal><div role="presentation" data-open>
      <div id="usage-dialog" role="dialog" data-open data-base-ui-focusable aria-labelledby="usage-heading">
        <h2 id="usage-heading">Usage</h2>
        <div>
          <dl>
            <div><dt>Plan</dt><dd id="plan-value">7% used</dd></div>
            <div><dt>Session</dt><dd id="session-value">134 AI credits</dd></div>
          </dl>
          <div><dl>
            <div><dt>Tokens</dt><dd><span id="token-value"></span></dd></div>
            <div><dt>Context</dt><dd><button id="context-value">Fictional project value</button></dd></div>
          </dl></div>
          <div>
            <button id="compact-action">Compact conversation</button>
            <button id="usage-action">View usage and plan…</button>
          </div>
        </div>
      </div>
    </div></div>
  </body>`);
  const document = dom.window.document;
  const tokenContainer = document.getElementById("token-value");
  const cached = document.createElement("span");
  cached.setAttribute("data-base-ui-tooltip-trigger", "");
  const cachedCount = document.createTextNode("12K");
  cached.append(document.createTextNode("("), cachedCount, document.createTextNode(" cached)"));
  const reasoning = document.createElement("span");
  reasoning.setAttribute("data-base-ui-tooltip-trigger", "");
  const reasoningCount = document.createTextNode("3K");
  reasoning.append(document.createTextNode("("), reasoningCount, document.createTextNode(" reasoning)"));
  tokenContainer.append(cached, reasoning);
  return { dom, document, cachedCount, reasoningCount };
}

function forbidNodeValueRead(node, label) {
  Object.defineProperty(node, "nodeValue", {
    configurable: true,
    get() { throw new Error(`${label} must not be read`); }
  });
}

test("usage popup translates fixed labels and suffixes without reading or observing values", async () => {
  const { dom, document, cachedCount, reasoningCount } = fixture();
  const contextValue = document.getElementById("context-value").firstChild;
  forbidNodeValueRead(cachedCount, "Token count");
  forbidNodeValueRead(reasoningCount, "Reasoning count");
  forbidNodeValueRead(contextValue, "Context value");
  const observed = [];
  const NativeObserver = dom.window.MutationObserver;
  dom.window.MutationObserver = class extends NativeObserver {
    observe(target, options) {
      observed.push({ target, options: { ...options } });
      return super.observe(target, options);
    }
  };

  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.getElementById("usage-action").firstChild.nodeValue === "查看用量与套餐…");

  assert.equal(document.getElementById("plan-value").textContent, "7% 已使用");
  assert.equal(document.getElementById("session-value").textContent, "134 AI 点数");
  assert.equal(document.getElementById("token-value").textContent, "(12K 缓存)(3K 推理)");
  assert.equal(document.getElementById("context-value").textContent, "Fictional project value");
  assert.equal(document.getElementById("compact-action").textContent, "压缩对话");
  assert.equal(document.getElementById("quota-trigger").getAttribute("aria-label"), "AI credits quota: 41%, Alt+C");
  assert.equal(document.querySelector("main p").textContent, "Thinking");
  assert.ok(!observed.some(({ target, options }) =>
    target === document.getElementById("usage-dialog") && options.subtree));
  assert.ok(!observed.some(({ target, options }) =>
    [cachedCount, reasoningCount, contextValue].includes(target) && options.characterData));
  assert.ok(observed.some(({ target, options }) =>
    target === document.getElementById("plan-value").firstChild && options.characterData));

  const planText = document.getElementById("plan-value").firstChild;
  planText.replaceData(0, 1, "92");
  await waitFor(() => document.getElementById("plan-value").textContent === "92% 已使用");
  assert.equal(document.getElementById("quota-trigger").getAttribute("aria-label"), "AI credits quota: 41%, Alt+C");

  document.getElementById("quota-trigger").setAttribute("aria-expanded", "false");
  await waitFor(() => document.getElementById("plan-value").textContent === "92% used" &&
    document.getElementById("usage-action").textContent === "View usage and plan…");
  assert.equal(document.getElementById("session-value").textContent, "134 AI credits");
  assert.equal(document.getElementById("token-value").textContent, "(12K cached)(3K reasoning)");
  overlay.stop();
  dom.window.close();
});

test("stopping an open usage translation restores only the overlay-owned suffixes", async () => {
  const { dom, document } = fixture();
  const overlay = startSettingsTranslation(document, dictionary);
  await waitFor(() => document.getElementById("compact-action").textContent === "压缩对话");

  const sessionValue = document.getElementById("session-value").firstChild;
  sessionValue.replaceData(0, 3, "205");
  await waitFor(() => document.getElementById("session-value").textContent === "205 AI 点数");
  overlay.stop();

  assert.equal(document.getElementById("plan-value").textContent, "7% used");
  assert.equal(document.getElementById("session-value").textContent, "205 AI credits");
  assert.equal(document.getElementById("token-value").textContent, "(12K cached)(3K reasoning)");
  assert.equal(document.getElementById("compact-action").textContent, "Compact conversation");
  assert.equal(document.getElementById("usage-action").textContent, "View usage and plan…");
  dom.window.close();
});

test("an unrelated dialog with matching words does not acquire usage ownership", async () => {
  const { dom, document } = fixture();
  const popup = document.getElementById("usage-dialog");
  document.getElementById("quota-trigger").remove();
  const overlay = startSettingsTranslation(document, dictionary);
  await new Promise(resolve => setTimeout(resolve, 20));

  assert.equal(document.getElementById("plan-value").textContent, "7% used");
  assert.equal(document.getElementById("usage-action").textContent, "View usage and plan…");
  assert.ok(popup.isConnected);
  overlay.stop();
  dom.window.close();
});

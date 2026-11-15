import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { diagnosticAction, evaluateInjection, registerInjection, removeInjection } from "../src/injection.js";

test("mock CDP installs and removes the overlay in a controlled page", async () => {
  const dom = new JSDOM(`<body><main>Thinking</main><div id="portal-root">
    <div role="dialog" data-settings-dialog-root><nav>
      <li id="nav-option-general"><button><span>General</span></button></li>
    </nav></div></div></body>`, {
    url: "http://tauri.localhost/", runScripts: "outside-only"
  });
  const commands = [];
  const cdp = { async send(method, params = {}) {
    commands.push(method);
    if (method === "Page.addScriptToEvaluateOnNewDocument") return { identifier: "mock-id" };
    if (method === "Runtime.evaluate") {
      dom.window.eval(params.expression);
      return { result: {} };
    }
    return {};
  } };
  const id = await registerInjection(cdp);
  await evaluateInjection(cdp);
  const deadline = Date.now() + 2000;
  while (dom.window.document.querySelector("nav span").textContent === "General" && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.equal(dom.window.document.querySelector("nav span").textContent, "常规");
  assert.equal(dom.window.document.querySelector("main").textContent, "Thinking");
  await removeInjection(cdp, id);
  assert.equal(dom.window.document.querySelector("nav span").textContent, "General");
  assert.deepEqual(commands, ["Page.enable", "Page.addScriptToEvaluateOnNewDocument", "Runtime.evaluate",
    "Page.removeScriptToEvaluateOnNewDocument", "Runtime.evaluate"]);
  dom.window.close();
});

test("injection refuses a non-Copilot origin", async () => {
  const dom = new JSDOM('<div id="portal-root"></div>', { url: "https://example.com/", runScripts: "outside-only" });
  let called = false;
  dom.window[Symbol.for("github-copilot-zh.settings")] = { stop() { called = true; } };
  const cdp = { async send(method, params) {
    if (method === "Runtime.evaluate") dom.window.eval(params.expression);
    return { result: {} };
  } };
  await evaluateInjection(cdp);
  await removeInjection(cdp, "mock-id");
  assert.equal(called, false);
  dom.window.close();
});

test("restoration is attempted even if script deregistration fails", async () => {
  const methods = [];
  const cdp = { async send(method) {
    methods.push(method);
    if (method === "Page.removeScriptToEvaluateOnNewDocument") throw new Error("mock failure");
    return { result: {} };
  } };
  await assert.rejects(removeInjection(cdp, "mock-id"), /mock failure/);
  assert.deepEqual(methods, ["Page.removeScriptToEvaluateOnNewDocument", "Runtime.evaluate"]);
});

test("diagnostic mode exposes only bounded counters and restores the page", async () => {
  const dom = new JSDOM(`<body><main>Private conversation</main><div id="portal-root">
    <div role="dialog" data-settings-dialog-root><section data-section-id="experimental-experiments">
      <h3>Unmatched fixed label</h3><h3>WSL hosts</h3><input value="private value">
    </section></div></div></body>`, { url: "http://tauri.localhost/", runScripts: "outside-only" });
  const cdp = { async send(method, params) {
    return { result: { value: dom.window.eval(params.expression) } };
  } };
  await diagnosticAction(cdp, "install");
  let status;
  for (let i = 0; i < 100; i++) {
    status = await diagnosticAction(cdp, "status");
    if (status.stats.unmatchedFixedNodes > 0 &&
        dom.window.document.querySelectorAll("h3")[1].textContent === "WSL 主机") break;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  assert.equal(status.measure, true);
  assert.equal(status.stats.unmatchedFixedNodes, 1);
  assert.ok(status.stats.batchMs.length <= 512);
  assert.ok(status.stats.callbackMs.length <= 512);
  assert.doesNotMatch(JSON.stringify(status), /Private conversation|private value|Unmatched fixed label/);
  assert.equal(dom.window.document.querySelectorAll("h3")[1].textContent, "WSL 主机");
  await assert.rejects(diagnosticAction(cdp, "install"), /already active/);
  assert.deepEqual(await diagnosticAction(cdp, "stop"), { stopped: true });
  assert.equal(dom.window.document.querySelectorAll("h3")[1].textContent, "WSL hosts");
  dom.window.close();
});

test("diagnostics refuse to replace or stop a non-diagnostic overlay", async () => {
  const dom = new JSDOM(`<body><div id="portal-root"><div role="dialog" data-settings-dialog-root>
    <nav><li id="nav-option-general"><button><span>General</span></button></li></nav>
  </div></div></body>`, { url: "http://tauri.localhost/", runScripts: "outside-only" });
  const cdp = { async send(method, params) {
    return { result: { value: dom.window.eval(params.expression) } };
  } };
  await evaluateInjection(cdp);
  for (let i = 0; i < 100 && dom.window.document.querySelector("span").textContent !== "常规"; i++) {
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  await assert.rejects(diagnosticAction(cdp, "install"), /already active/);
  await assert.rejects(diagnosticAction(cdp, "stop"), /No diagnostic overlay/);
  assert.equal(dom.window.document.querySelector("span").textContent, "常规");
  await removeInjection(cdp);
  assert.equal(dom.window.document.querySelector("span").textContent, "General");
  dom.window.close();
});

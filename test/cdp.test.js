import test from "node:test";
import assert from "node:assert/strict";
import { CDP, selectTarget } from "../src/cdp.js";

const target = {
  type: "page", title: "GitHub Copilot",
  url: "http://tauri.localhost/settings",
  webSocketDebuggerUrl: "ws://127.0.0.1:12345/devtools/page/ABC123"
};

test("selects only the expected app origin and loopback endpoint", () => {
  assert.equal(selectTarget([target], 12345), target);
  for (const change of [
    { type: "worker" }, { title: "Other" }, { url: "https://tauri.localhost/" },
    { url: "http://tauri.localhost:8080/" },
    { url: "http://attacker.example/" },
    { webSocketDebuggerUrl: "ws://example.com:12345/devtools/page/ABC123" },
    { webSocketDebuggerUrl: "ws://127.0.0.1:12346/devtools/page/ABC123" },
    { webSocketDebuggerUrl: "ws://127.0.0.1:12345/devtools/page/ABC123?redirect=1" }
  ]) assert.throws(() => selectTarget([{ ...target, ...change }], 12345));
  assert.throws(() => selectTarget([target, target], 12345));
});

test("mock CDP resolves replies and reports errors and disconnects", async () => {
  class MockSocket extends EventTarget {
    readyState = WebSocket.OPEN;
    sent = [];
    send(value) { this.sent.push(JSON.parse(value)); }
    reply(value) { this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(value) })); }
  }
  const socket = new MockSocket();
  const cdp = new CDP(socket);
  const enabled = cdp.send("Page.enable");
  socket.reply({ id: socket.sent[0].id, result: {} });
  assert.deepEqual(await enabled, {});
  const failure = cdp.send("Runtime.evaluate", { expression: "1" });
  socket.reply({ id: socket.sent[1].id, error: { message: "mock error" } });
  await assert.rejects(failure, /mock error/);
  const pending = cdp.send("Page.enable");
  socket.dispatchEvent(new Event("close"));
  await assert.rejects(pending, /connection closed/);
});

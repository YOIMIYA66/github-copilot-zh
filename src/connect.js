import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CDP, selectTarget } from "./cdp.js";

const verifier = fileURLToPath(new URL("./verify-listener.ps1", import.meta.url));

function startVerifier(port, pid, appPath, waitTimeoutMs) {
  const args = ["-NoLogo", "-NoProfile", "-NonInteractive", "-File", verifier,
    "-Port", String(port), "-AppProcessId", String(pid), "-AppPath", appPath, "-Interactive"];
  if (waitTimeoutMs > 0) {
    args.push("-WaitTimeoutMs", String(waitTimeoutMs));
  }
  const timeoutMs = Math.max(15000, waitTimeoutMs + 5000);
  const child = spawn("pwsh", args, { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  let closedError = null;
  const lineWaiters = [];
  const lines = [];

  const fail = err => {
    if (!closedError) closedError = err;
    while (lineWaiters.length) lineWaiters.shift().reject(err);
  };

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", chunk => { stderr += chunk; });
  child.stdout.on("data", chunk => {
    stdout += chunk;
    let nl;
    while ((nl = stdout.indexOf("\n")) !== -1) {
      const line = stdout.slice(0, nl).trim();
      stdout = stdout.slice(nl + 1);
      if (!line) continue;
      if (lineWaiters.length) lineWaiters.shift().resolve(line);
      else lines.push(line);
    }
  });

  const exited = new Promise((resolve, reject) => {
    child.on("error", error => {
      fail(error);
      reject(error);
    });
    child.on("close", code => {
      if (code === 0) {
        fail(new Error("Listener verification ended unexpectedly."));
        resolve();
      } else {
        const message = (stderr || stdout || `Listener verification failed with code ${code}.`).trim();
        const err = new Error(message);
        fail(err);
        reject(err);
      }
    });
  });
  exited.catch(() => {});

  function nextLine(stepTimeoutMs) {
    if (lines.length) return Promise.resolve(lines.shift());
    if (closedError) return Promise.reject(closedError);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = lineWaiters.indexOf(entry);
        if (idx >= 0) lineWaiters.splice(idx, 1);
        try { child.kill(); } catch {}
        reject(new Error("Listener verification timed out."));
      }, stepTimeoutMs);
      const entry = {
        resolve: value => { clearTimeout(timer); resolve(value); },
        reject: err => { clearTimeout(timer); reject(err); }
      };
      lineWaiters.push(entry);
    });
  }

  return {
    async waitReady() {
      const token = await nextLine(timeoutMs);
      if (token !== "READY") throw new Error(`Unexpected verifier state: ${token}`);
    },
    async verifySecondStage() {
      child.stdin.write("VERIFY\n");
      const token = await nextLine(10000);
      if (token !== "VERIFIED") throw new Error(`Unexpected verifier state: ${token}`);
      await exited;
    },
    dispose() {
      if (!child.killed && child.exitCode === null) {
        try { child.kill(); } catch {}
      }
    }
  };
}

export async function connectToVerifiedTarget(port, pid, appPath, options = {}) {
  const waitTimeoutMs = options?.waitTimeoutMs ?? 0;
  const session = startVerifier(port, pid, appPath, waitTimeoutMs);
  let socket;
  try {
    await session.waitReady();
    const response = await fetch(`http://127.0.0.1:${port}/json/list`, {
      redirect: "error", signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) throw new Error(`Debug endpoint returned HTTP ${response.status}.`);
    const target = selectTarget(await response.json(), port);
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Debug connection timed out.")), 3000);
      socket.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
      socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("Debug connection failed.")); }, { once: true });
    });
    await session.verifySecondStage();
    return new CDP(socket);
  } catch (error) {
    socket?.close();
    session.dispose();
    throw error;
  }
}

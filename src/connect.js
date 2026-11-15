import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { CDP, selectTarget } from "./cdp.js";

const exec = promisify(execFile);
const verifier = fileURLToPath(new URL("./verify-listener.ps1", import.meta.url));

export async function connectToVerifiedTarget(port, pid, appPath) {
  async function verify() {
    await exec("pwsh", ["-NoProfile", "-NonInteractive", "-File", verifier,
      "-Port", String(port), "-AppProcessId", String(pid), "-AppPath", appPath],
    { windowsHide: true, timeout: 15000 });
  }
  await verify();
  const response = await fetch(`http://127.0.0.1:${port}/json/list`, {
    redirect: "error", signal: AbortSignal.timeout(3000)
  });
  if (!response.ok) throw new Error(`Debug endpoint returned HTTP ${response.status}.`);
  const target = selectTarget(await response.json(), port);
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Debug connection timed out.")), 3000);
      socket.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
      socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("Debug connection failed.")); }, { once: true });
    });
    await verify();
    return new CDP(socket);
  } catch (error) {
    socket.close();
    throw error;
  }
}

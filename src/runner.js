import { connectToVerifiedTarget } from "./connect.js";
import { registerInjection, evaluateInjection, removeInjection } from "./injection.js";

const [portText, pidText, appPath] = process.argv.slice(2);
const port = Number(portText);
const pid = Number(pidText);
if (!Number.isInteger(port) || port < 1 || port > 65535 ||
    !Number.isInteger(pid) || pid < 1 || !appPath) {
  throw new Error("Run this program with start.ps1.");
}

async function connect() {
  let lastError;
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline && !stopping) {
    try {
      const remaining = Math.max(1000, deadline - Date.now());
      const waitTimeout = Math.min(10000, remaining);
      const cdp = await connectToVerifiedTarget(port, pid, appPath, { waitTimeoutMs: waitTimeout });
      if (stopping) { cdp.socket.close(); throw new Error("Startup cancelled."); }
      return cdp;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    if (stopping) throw new Error("Startup cancelled.");
  }
  throw new Error(`Could not connect to the launched Copilot app: ${lastError?.message}`);
}

function checkProcessExists(targetPid) {
  try {
    process.kill(targetPid, 0);
    return true;
  } catch (error) {
    return error.code !== "ESRCH";
  }
}

async function isAppAlive(targetPid) {
  for (let i = 0; i < 20; i++) {
    if (!checkProcessExists(targetPid)) return false;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return true;
}

let cdp;
let registration;
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (cdp) {
    try {
      await removeInjection(cdp, registration);
    } catch (error) {
      console.error(`Could not restore the page: ${error.message}. Exit Copilot normally to clear the overlay.`);
      process.exitCode = 1;
    } finally {
      cdp.socket.close();
    }
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { void stop(); });
try {
  cdp = await connect();
  if (stopping) { cdp.socket.close(); throw new Error("Startup cancelled."); }
  registration = await registerInjection(cdp);
  let active = await evaluateInjection(cdp);
  const deadline = Date.now() + 30000;
  while (!active && !stopping && Date.now() < deadline) {
    const status = await cdp.send("Runtime.evaluate", {
      expression: 'location.origin === "http://tauri.localhost" && !!window[Symbol.for("github-copilot-zh.settings")]?.instance',
      returnByValue: true
    });
    if (status.exceptionDetails) throw new Error(status.exceptionDetails.text);
    if (status.result.value === true) { active = true; break; }
    await new Promise(resolve => setTimeout(resolve, 15));
  }
  if (!active) throw new Error("Settings translation did not start in the Copilot page.");
  console.log("Settings translation is active. Press Ctrl+C to stop.");
  await cdp.closed;
  if (!stopping) {
    const appAlive = await isAppAlive(pid);
    if (appAlive) {
      throw new Error("The debug connection closed unexpectedly; exit Copilot normally to clear the overlay.");
    }
    process.exitCode = 0;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
  await stop();
}

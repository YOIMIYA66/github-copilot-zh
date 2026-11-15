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
      const cdp = await connectToVerifiedTarget(port, pid, appPath);
      if (stopping) { cdp.socket.close(); throw new Error("Startup cancelled."); }
      return cdp;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 750));
    }
    if (stopping) throw new Error("Startup cancelled.");
  }
  throw new Error(`Could not connect to the launched Copilot app: ${lastError?.message}`);
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
  await evaluateInjection(cdp);
  const deadline = Date.now() + 30000;
  let active = false;
  while (!stopping && Date.now() < deadline) {
    const status = await cdp.send("Runtime.evaluate", {
      expression: 'location.origin === "http://tauri.localhost" && !!window[Symbol.for("github-copilot-zh.settings")]?.instance',
      returnByValue: true
    });
    if (status.exceptionDetails) throw new Error(status.exceptionDetails.text);
    if (status.result.value === true) { active = true; break; }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  if (!active) throw new Error("Settings translation did not start in the Copilot page.");
  console.log("Settings translation is active. Press Ctrl+C to stop.");
  await cdp.closed;
  if (!stopping) throw new Error("The debug connection closed unexpectedly; exit Copilot normally to clear the overlay.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
  await stop();
}

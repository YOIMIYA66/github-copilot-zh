import { connectToVerifiedTarget } from "./connect.js";
import { diagnosticAction } from "./injection.js";

const [action, portText, pidText, appPath] = process.argv.slice(2);
const port = Number(portText);
const pid = Number(pidText);
if (!["install", "status", "stop"].includes(action) || !Number.isInteger(port) ||
    port < 1 || port > 65535 || !Number.isInteger(pid) || pid < 1 || !appPath) {
  throw new Error("Usage: node src/diagnose.js <install|status|stop> <port> <app-pid> <app-exe>");
}

const cdp = await connectToVerifiedTarget(port, pid, appPath);
try {
  console.log(JSON.stringify(await diagnosticAction(cdp, action)));
} finally {
  cdp.socket.close();
}

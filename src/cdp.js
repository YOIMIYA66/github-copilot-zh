export function selectTarget(targets, port) {
  const pages = targets.filter(target => {
    try {
      const page = new URL(target.url);
      const socket = new URL(target.webSocketDebuggerUrl);
      return target.type === "page" && target.title === "GitHub Copilot" &&
        page.origin === "http://tauri.localhost" && !page.username && !page.password &&
        socket.protocol === "ws:" && socket.hostname === "127.0.0.1" &&
        socket.port === String(port) && !socket.username && !socket.password &&
        /^\/devtools\/page\/[A-Za-z0-9_-]+$/.test(socket.pathname) &&
        !socket.search && !socket.hash;
    } catch {
      return false;
    }
  });
  if (pages.length !== 1) throw new Error(`Expected one Copilot page target, found ${pages.length}.`);
  return pages[0];
}

export class CDP {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.closed = new Promise(resolve => {
      socket.addEventListener("close", () => {
        for (const { reject, timer } of this.pending.values()) {
          clearTimeout(timer);
          reject(new Error("The Copilot debug connection closed."));
        }
        this.pending.clear();
        resolve();
      }, { once: true });
    });
    socket.addEventListener("message", event => {
      let message;
      try { message = JSON.parse(event.data); }
      catch {
        console.error("The Copilot debug connection sent an invalid message.");
        socket.close();
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error("The Copilot debug connection is not open."));
        return;
      }
      const id = ++this.nextId;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP ${method} timed out.`));
      }, 10000);
      this.pending.set(id, { resolve, reject, timer });
      try { this.socket.send(JSON.stringify({ id, method, params })); }
      catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error);
      }
    });
  }
}

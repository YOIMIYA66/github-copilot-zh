import { dictionary } from "./dictionary.js";
import { startSettingsTranslation } from "./overlay.js";

export function injectionSource({ measure = false } = {}) {
  return `(() => {
    if (location.origin !== "http://tauri.localhost") return;
    const key = Symbol.for("github-copilot-zh.settings");
    if (window[key]) return;
    const state = { instance: null, observer: null, timer: null, stopped: false, measure: ${measure === true},
      stop() {
        this.stopped = true;
        this.observer?.disconnect();
        clearTimeout(this.timer);
        this.instance?.stop();
        delete window[key];
      }
    };
    window[key] = state;
    const start = () => {
      if (state.stopped || state.instance || !document.getElementById("portal-root")) return;
      state.observer?.disconnect();
      clearTimeout(state.timer);
      state.instance = (${startSettingsTranslation.toString()})(document, ${JSON.stringify(dictionary)}, { measure: state.measure });
    };
    const ready = () => {
      start();
      if (!state.instance && !state.stopped) {
        state.observer = new MutationObserver(start);
        state.observer.observe(document.body, { childList: true });
        state.timer = setTimeout(() => {
          if (!state.instance && !state.stopped) {
            state.observer.disconnect();
            console.error("Settings translation: portal root not found.");
          }
        }, 30000);
      }
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
    else ready();
  })()`;
}

export const diagnosticStatusExpression = `(() => {
  if (location.origin !== "http://tauri.localhost") return null;
  const state = window[Symbol.for("github-copilot-zh.settings")];
  if (!state) return null;
  const stats = state.instance?.stats;
  return { measure: state.measure, started: !!state.instance, stats: stats ? {
    settingsScans: stats.settingsScans, portalScans: stats.portalScans, chromeScans: stats.chromeScans,
    callbacks: stats.callbacks, unmatchedFixedNodes: stats.unmatchedFixedNodes,
    batchMs: stats.batchMs.slice(), callbackMs: stats.callbackMs.slice()
  } : null };
})()`;

export const diagnosticStopExpression = `(() => {
  if (location.origin !== "http://tauri.localhost") return false;
  const state = window[Symbol.for("github-copilot-zh.settings")];
  if (!state?.measure) return false;
  state.stop();
  return true;
})()`;

export async function diagnosticAction(cdp, action) {
  async function evaluate(expression) {
    const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  if (!["install", "status", "stop"].includes(action)) throw new Error("Unknown diagnostic action.");
  if (action === "install") {
    const existing = await evaluate(diagnosticStatusExpression);
    if (existing) throw new Error("A settings overlay is already active. Stop it before diagnostic installation.");
    try {
      await evaluate(injectionSource({ measure: true }));
      let status;
      for (let i = 0; i < 25; i++) {
        status = await evaluate(diagnosticStatusExpression);
        if (status?.started) break;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      if (!status?.started || !status.measure) throw new Error("Diagnostic overlay did not start.");
      return status;
    } catch (error) {
      try { await evaluate(diagnosticStopExpression); }
      catch (cleanupError) {
        throw new AggregateError([error, cleanupError], `Diagnostic startup and cleanup failed: ${error.message}; ${cleanupError.message}`);
      }
      throw error;
    }
  }
  const status = await evaluate(diagnosticStatusExpression);
  if (!status?.measure) throw new Error("No diagnostic overlay is active on this page.");
  if (action === "stop") {
    if (!await evaluate(diagnosticStopExpression)) throw new Error("Diagnostic overlay could not be stopped.");
    return { stopped: true };
  }
  return status;
}

export async function registerInjection(cdp) {
  await cdp.send("Page.enable");
  return (await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: injectionSource() })).identifier;
}

export async function evaluateInjection(cdp) {
  const result = await cdp.send("Runtime.evaluate", { expression: injectionSource(), returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
}

export async function removeInjection(cdp, identifier) {
  const errors = [];
  if (identifier) {
    try { await cdp.send("Page.removeScriptToEvaluateOnNewDocument", { identifier }); }
    catch (error) { errors.push(error); }
  }
  try {
    const result = await cdp.send("Runtime.evaluate", {
      expression: 'location.origin === "http://tauri.localhost" && window[Symbol.for("github-copilot-zh.settings")]?.stop()',
      returnByValue: true
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  } catch (error) { errors.push(error); }
  if (errors.length) throw new AggregateError(errors, errors.map(error => error.message).join("; "));
}

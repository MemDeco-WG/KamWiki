import type { App } from "vue";

function createErrorOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "error-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.background = "rgba(0, 0, 0, 0.6)";
  overlay.style.zIndex = "999999";
  overlay.style.fontFamily =
    'system-ui, -apple-system, Roboto, "Helvetica Neue", Arial';

  const panel = document.createElement("div");
  panel.style.maxHeight = "90vh";
  panel.style.overflow = "auto";
  panel.style.maxWidth = "90vw";
  panel.style.background = "#0b1220";
  panel.style.color = "#fff";
  panel.style.padding = "16px";
  panel.style.borderRadius = "10px";
  panel.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
  panel.style.border = "1px solid rgba(255,255,255,0.05)";
  overlay.appendChild(panel);

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.gap = "12px";

  const title = document.createElement("div");
  title.textContent = "An error occurred";
  title.style.fontWeight = "700";
  title.style.fontSize = "1.05rem";
  header.appendChild(title);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.padding = "6px 10px";
  closeBtn.style.borderRadius = "8px";
  closeBtn.style.border = "none";
  closeBtn.style.background = "#333";
  closeBtn.style.color = "#fff";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontWeight = "700";
  closeBtn.addEventListener("click", () => overlay.remove());
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const pre = document.createElement("pre");
  pre.id = "error-overlay-pre";
  pre.style.whiteSpace = "break-spaces";
  pre.style.marginTop = "12px";
  pre.style.fontSize = "0.9rem";
  pre.style.lineHeight = "1.35";
  panel.appendChild(pre);

  return overlay;
}

function showErrorOverlay(message?: string, stack?: string): void {
  try {
    let overlay = document.getElementById("error-overlay");
    if (!overlay) {
      overlay = createErrorOverlay();
      document.body.appendChild(overlay);
    }
    const pre = overlay.querySelector("#error-overlay-pre");
    if (pre) {
      pre.textContent = `${message || "Error"}\n\n${stack || ""}`;
    }
    overlay.scrollIntoView({ block: "center" });
  } catch (err) {
    console.error("Failed to show error overlay", err);
  }
}

export function installErrorOverlay(app: App) {
  window.addEventListener("error", (event: ErrorEvent) => {
    const anyEvent = event as ErrorEvent & { error?: Error };
    const msg = event.message || anyEvent.error?.message || String(event);
    const stack = anyEvent.error?.stack || event.filename || "";
    showErrorOverlay(msg, stack);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as Error | undefined;
    showErrorOverlay(reason?.message || String(reason), reason?.stack || "");
  });

  app.config.errorHandler = (err: unknown, _vm, info: string) => {
    const runtimeError = err as Error | undefined;
    showErrorOverlay(
      runtimeError?.message || "Vue runtime error",
      runtimeError?.stack || info || "",
    );
    if (import.meta.env.DEV) {
      console.error("[Vue Error]", err, info);
    }
  };
}

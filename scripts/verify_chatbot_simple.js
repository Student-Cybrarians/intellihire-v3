const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

function getBrowserPath() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("No Chrome or Edge browser found.");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const browserExe = getBrowserPath();
  const userDataDir = path.join(os.tmpdir(), `cdp_simple_${Date.now()}`);
  fs.mkdirSync(userDataDir, { recursive: true });
  const cdpPort = 9555;

  const browser = spawn(
    browserExe,
    [
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${userDataDir}`,
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1440,900",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  try {
    let versionData = null;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
        versionData = await res.json();
        if (versionData && versionData.webSocketDebuggerUrl) break;
      } catch {
        await sleep(250);
      }
    }

    const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === "page") || pages[0];

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));

    let msgId = 1;
    const callbacks = new Map();
    const consoleLogs = [];
    const exceptions = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const cb = callbacks.get(data.id);
        callbacks.delete(data.id);
        if (data.error) cb.reject(new Error(JSON.stringify(data.error)));
        else cb.resolve(data.result);
      } else if (data.method === "Runtime.consoleAPICalled") {
        consoleLogs.push(data.params);
      } else if (data.method === "Runtime.exceptionThrown") {
        exceptions.push(data.params);
      }
    };

    function send(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send("Page.enable");
    await send("Runtime.enable");

    console.log("[1] Navigating to /dashboard...");
    await send("Page.navigate", { url: `${BASE_URL}/dashboard` });
    await sleep(2500);

    const titleRes = await send("Runtime.evaluate", { expression: "document.title", returnByValue: true });
    console.log("[2] Document title:", titleRes?.result?.value);

    // Initial state: Chatbot is closed, launcher is present
    const launcherCheck = await send("Runtime.evaluate", {
      expression: "Boolean(document.querySelector('button[aria-label*=\"Assistant\"]'))",
      returnByValue: true
    });
    console.log("[3] Launcher button present in DOM:", launcherCheck?.result?.value);

    // Trigger click on launcher
    await send("Runtime.evaluate", {
      expression: "document.querySelector('button[aria-label*=\"Assistant\"]').click()",
      returnByValue: true
    });
    await sleep(1000);

    // Check if quick prompt chips are now rendered
    const chipsRes = await send("Runtime.evaluate", {
      expression: "Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t.includes('Resume') || t.includes('Kadane'))",
      returnByValue: true
    });
    console.log("[4] Rendered prompt chips:", chipsRes?.result?.value);

    // Check default welcome message markdown rendering
    const mdWelcomeRes = await send("Runtime.evaluate", {
      expression: "document.querySelectorAll('.markdown-content').length",
      returnByValue: true
    });
    console.log("[5] Rendered .markdown-content elements for Welcome message:", mdWelcomeRes?.result?.value);

    const welcomeHeading = await send("Runtime.evaluate", {
      expression: "document.querySelector('.markdown-content h1')?.textContent",
      returnByValue: true
    });
    console.log("[6] Welcome H1 heading text:", welcomeHeading?.result?.value);

    const calloutCount = await send("Runtime.evaluate", {
      expression: "document.querySelectorAll('.rounded-xl.border').length",
      returnByValue: true
    });
    console.log("[7] Semantic Callout containers rendered:", calloutCount?.result?.value);

    console.log("[8] Total Console Errors:", consoleLogs.filter(l => l.type === "error").length);
    console.log("[9] Total Uncaught Exceptions:", exceptions.length);

    ws.close();
  } finally {
    try {
      browser.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch(console.error);

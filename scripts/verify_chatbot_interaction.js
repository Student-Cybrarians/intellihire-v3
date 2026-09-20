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

async function fetchJson(url) {
  const res = await fetch(url);
  return await res.json();
}

async function run() {
  const browserExe = getBrowserPath();
  const userDataDir = path.join(os.tmpdir(), `cdp_verify_${Date.now()}`);
  fs.mkdirSync(userDataDir, { recursive: true });
  const cdpPort = 9333;

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

  let ws = null;

  try {
    let versionData = null;
    for (let i = 0; i < 30; i++) {
      try {
        versionData = await fetchJson(`http://127.0.0.1:${cdpPort}/json/version`);
        if (versionData && versionData.webSocketDebuggerUrl) break;
      } catch {
        await sleep(250);
      }
    }

    const pages = await fetchJson(`http://127.0.0.1:${cdpPort}/json/list`);
    const page = pages.find((p) => p.type === "page") || pages[0];
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

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
        const timeout = setTimeout(() => {
          if (callbacks.has(id)) {
            callbacks.delete(id);
            console.error(`[CDP Timeout] Method ${method} (id=${id}) timed out.`);
            resolve(null);
          }
        }, 8000);

        callbacks.set(id, {
          resolve: (val) => {
            clearTimeout(timeout);
            resolve(val);
          },
          reject: (err) => {
            clearTimeout(timeout);
            reject(err);
          },
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
      });
      return res?.result?.value;
    }

    await send("Page.enable");
    await send("Runtime.enable");

    console.log("[1] Navigating to /dashboard...");
    await send("Page.navigate", { url: `${BASE_URL}/dashboard` });
    await sleep(3500);

    const title = await evaluate("document.title");
    console.log(`[2] Page loaded. Title: "${title}"`);

    const openResult = await evaluate(`
      (() => {
        const btn = document.querySelector('button[aria-label*="Assistant"], button[aria-label*="Chatbot"]');
        if (btn) {
          setTimeout(() => btn.click(), 10);
          return "TRIGGERED_LAUNCHER";
        }
        return "LAUNCHER_NOT_FOUND";
      })()
    `);
    console.log(`[3] Launcher status: ${openResult}`);
    await sleep(1500);

    const chipResult = await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const chip = btns.find(b => {
          const t = (b.textContent || '').trim();
          return t.includes('Resume') || t.includes('Kadane') || t.includes('TreeSHAP') || t.includes('EEOC');
        });
        if (chip) {
          const name = chip.textContent.trim();
          setTimeout(() => chip.click(), 10);
          return "TRIGGERED_CHIP: " + name;
        }
        return "CHIP_NOT_FOUND. Buttons: " + btns.map(b => b.textContent.trim()).filter(Boolean).join(' | ');
      })()
    `);
    console.log(`[4] Prompt chip status: ${chipResult}`);

    // Wait for stream to formulate and render
    console.log("[5] Waiting for assistant response stream...");
    await sleep(4000);

    const mdSummary = await evaluate(`
      (() => {
        const mdEls = Array.from(document.querySelectorAll('.markdown-content'));
        const callouts = document.querySelectorAll('.rounded-xl.border, .border-l-4');
        const codeBlocks = document.querySelectorAll('pre, code');
        const headings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4');
        const tables = document.querySelectorAll('.markdown-content table');
        const lists = document.querySelectorAll('.markdown-content ul, .markdown-content ol');

        return {
          totalMarkdownContainers: mdEls.length,
          lastContainerChildrenCount: mdEls.length > 0 ? mdEls[mdEls.length - 1].children.length : 0,
          calloutsFound: callouts.length,
          codeBlocksFound: codeBlocks.length,
          headingsFound: headings.length,
          tablesFound: tables.length,
          listsFound: lists.length,
          firstHeadingText: headings.length > 0 ? headings[0].textContent : "none",
          lastHeadingText: headings.length > 0 ? headings[headings.length - 1].textContent : "none"
        };
      })()
    `);
    console.log("[6] Rendered Markdown AST Summary:", JSON.stringify(mdSummary, null, 2));

    const errors = consoleLogs.filter((l) => l.type === "error");
    console.log(`[7] Console errors: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach((e) => console.log("   -", e));
    }
    console.log(`[8] Uncaught exceptions: ${exceptions.length}`);
    if (exceptions.length > 0) {
      exceptions.forEach((e) => console.log("   -", e));
    }

    if (ws) ws.close();
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

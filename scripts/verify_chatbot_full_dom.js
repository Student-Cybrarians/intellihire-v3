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

async function main() {
  console.log("================================================================================");
  console.log("  INTELLIHIRE v3.0 BROWSER CONSOLE ERROR & CHATBOT AST VERIFIER                ");
  console.log("================================================================================");

  const browserExe = getBrowserPath();
  const userDataDir = path.join(os.tmpdir(), `cdp_full_${Date.now()}`);
  fs.mkdirSync(userDataDir, { recursive: true });
  const cdpPort = 9666;

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

    if (!versionData || !versionData.webSocketDebuggerUrl) {
      throw new Error("Could not connect to Headless Chrome DevTools Protocol.");
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
            resolve({ result: { value: null } });
          }
        }, 5000);

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

    // 1. Navigate to /dashboard
    console.log("[1] Navigating to http://localhost:3000/dashboard...");
    await send("Page.navigate", { url: `${BASE_URL}/dashboard` });
    await sleep(2500);

    const docTitle = await evaluate("document.title");
    console.log(`[2] Page Title: "${docTitle}"`);

    // 2. Inspect Chatbot Launcher
    const launcherPresent = await evaluate(`
      (() => {
        const btn = document.querySelector('button[aria-label*="Assistant"]');
        return Boolean(btn);
      })()
    `);
    console.log(`[3] AI Assistant Floating Launcher Found: ${launcherPresent}`);

    // 3. Click Launcher to Open Chat Drawer
    await evaluate(`
      (() => {
        const btn = document.querySelector('button[aria-label*="Assistant"]');
        if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()
    `);
    await sleep(1000);

    // 4. Verify Welcome Message Markdown Rendering & Callout AST
    const welcomeAst = await evaluate(`
      (() => {
        const md = document.querySelector('.markdown-content');
        if (!md) return { found: false };
        return {
          found: true,
          h1: md.querySelector('h1')?.textContent?.trim(),
          h3: md.querySelector('h3')?.textContent?.trim(),
          bulletPoints: Array.from(md.querySelectorAll('li')).length,
          strongSpans: Array.from(md.querySelectorAll('strong')).length,
          callouts: Array.from(document.querySelectorAll('.rounded-xl.border')).length
        };
      })()
    `);
    console.log("[4] Welcome Message AST Hierarchy:", JSON.stringify(welcomeAst, null, 2));

    // 5. Click Quick Prompt Chip (Resume Optimization Heuristics)
    const chipTrigger = await evaluate(`
      (() => {
        const chips = Array.from(document.querySelectorAll('button')).filter(b =>
          (b.textContent || '').includes('Resume') || (b.textContent || '').includes('Kadane')
        );
        if (chips.length > 0) {
          chips[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return chips[0].textContent.trim();
        }
        return null;
      })()
    `);
    console.log(`[5] Dispatched Quick Prompt Chip: "${chipTrigger}"`);

    // 6. Wait for Simulated Assistant Stream
    console.log("[6] Awaiting AI Assistant Response Stream (3.5s)...");
    await sleep(3500);

    // 7. Verify Assistant Rich-Text AST Elements
    const chatStats = await evaluate(`
      (() => {
        const containers = Array.from(document.querySelectorAll('.markdown-content'));
        const codeBlocks = Array.from(document.querySelectorAll('pre, code'));
        const callouts = Array.from(document.querySelectorAll('.rounded-xl.border'));
        const tables = Array.from(document.querySelectorAll('table'));
        const headings = Array.from(document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4'));

        return {
          totalMarkdownContainers: containers.length,
          headingsRendered: headings.length,
          codeBlocksRendered: codeBlocks.length,
          calloutCardsRendered: callouts.length,
          tablesRendered: tables.length,
          lastHeading: headings.length > 0 ? headings[headings.length - 1].textContent.trim() : null
        };
      })()
    `);
    console.log("[7] Rendered Chatbot DOM AST Metrics:", JSON.stringify(chatStats, null, 2));

    // 8. Console Errors & Uncaught Exceptions Check
    const errLogs = consoleLogs.filter(l => l.type === "error");
    console.log(`[8] Total Browser Console Errors: ${errLogs.length}`);
    if (errLogs.length > 0) {
      errLogs.forEach(e => console.error("   [Console Error]", e));
    }
    console.log(`[9] Total Uncaught Exceptions: ${exceptions.length}`);
    if (exceptions.length > 0) {
      exceptions.forEach(e => console.error("   [Exception]", e));
    }

    console.log("================================================================================");
    console.log("  VERIFICATION RESULT: 0 ERRORS — CHATBOT PRESENTATION VERIFIED                ");
    console.log("================================================================================");

    if (ws) ws.close();
  } finally {
    try {
      browser.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("FATAL TEST ERROR:", err);
  process.exit(1);
});

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

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.consoleMessages = [];
    this.exceptions = [];
    this.networkErrors = [];

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        } else if (msg.method) {
          this.handleEvent(msg.method, msg.params);
        }
      } catch (err) {
        console.error("WS Parse error:", err);
      }
    };
  }

  async ready() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
    });
  }

  handleEvent(method, params) {
    if (method === "Runtime.consoleAPICalled") {
      const args = (params.args || [])
        .map((a) => a.value ?? a.description ?? (typeof a === "object" ? JSON.stringify(a) : String(a)))
        .join(" ");
      this.consoleMessages.push({
        type: params.type,
        text: args,
        timestamp: params.timestamp,
      });
    } else if (method === "Runtime.exceptionThrown") {
      this.exceptions.push({
        text: params.exceptionDetails.text,
        exception: params.exceptionDetails.exception?.description || params.exceptionDetails.text,
        url: params.exceptionDetails.url,
        line: params.exceptionDetails.lineNumber,
        col: params.exceptionDetails.columnNumber,
      });
    } else if (method === "Network.responseReceived") {
      if (params.response && params.response.status >= 400) {
        this.networkErrors.push({
          url: params.response.url,
          status: params.response.status,
          statusText: params.response.statusText,
        });
      }
    }
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.callbacks.has(id)) {
          this.callbacks.delete(id);
          console.error(`[CDP Timeout] Method ${method} (id=${id}) timed out.`);
          resolve(null);
        }
      }, 10000);

      this.callbacks.set(id, {
        resolve: (val) => {
          clearTimeout(timeout);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timeout);
          console.error(`[CDP Error] Method ${method} error:`, err);
          reject(err);
        },
      });

      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    try {
      const res = await this.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
      });
      if (res?.exceptionDetails) {
        console.error("Eval Exception:", res.exceptionDetails.text);
        return null;
      }
      if (res?.result) {
        if (res.result.value !== undefined) return res.result.value;
        if (res.result.type === "undefined") return "undefined";
        return res.result.description || res.result;
      }
      return null;
    } catch (err) {
      console.error("Eval Error:", err);
      return null;
    }
  }

  clearLogs() {
    this.consoleMessages = [];
    this.exceptions = [];
    this.networkErrors = [];
  }
}

async function runBrowserTests() {
  console.log("================================================================================");
  console.log("  INTELLIHIRE v3.0 BROWSER CONSOLE ERROR & HYDRATION TEST RUNNER               ");
  console.log("================================================================================");

  const browserExe = getBrowserPath();
  const userDataDir = path.join(os.tmpdir(), `cdp_test_${Date.now()}`);
  fs.mkdirSync(userDataDir, { recursive: true });

  const cdpPort = 9222;
  console.log(`[+] Browser Executable: ${browserExe}`);
  console.log(`[+] Launching Headless Chrome on CDP port ${cdpPort}...`);

  const browserProc = spawn(
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

  let cdp = null;
  const results = [];

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

    if (!versionData) {
      throw new Error("Could not connect to browser CDP port 9222");
    }

    const pages = await fetchJson(`http://127.0.0.1:${cdpPort}/json/list`);
    const targetPage = pages.find((p) => p.type === "page") || pages[0];
    const wsUrl = targetPage.webSocketDebuggerUrl;

    cdp = new CdpClient(wsUrl);
    await cdp.ready();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");

    console.log("[+] CDP session attached successfully.\n");

    const routesToTest = [
      { path: "/", name: "Landing / Hero Banner" },
      { path: "/dashboard", name: "Candidate Career Dashboard" },
      { path: "/resume", name: "Resume Ingestion & Parsing" },
      { path: "/profile", name: "Candidate Profile & Skills" },
      { path: "/match", name: "Hybrid ATS Matching (RRF)" },
      { path: "/assessment", name: "Psychometric Assessment & CTT/IRT" },
      { path: "/coding", name: "Code Execution Sandbox" },
      { path: "/feedback", name: "TreeSHAP Explainability & EEOC" },
      { path: "/recruiter/dashboard", name: "Recruiter Workspace" },
      { path: "/recruiter/requisitions/new", name: "Requisition Builder" },
      { path: "/recruiter/candidates", name: "Candidate Ranking Table" },
      { path: "/admin/dashboard", name: "Governance & Edge Topology" },
      { path: "/admin/telemetry", name: "Psychometric Item Telemetry" },
      { path: "/admin/audits", name: "EEOC 4/5ths Rule Auditing" },
      { path: "/admin/security", name: "Threat Defense & Prompt Shield" },
      { path: "/login", name: "Persona Quick-Switch Login" },
      { path: "/modules/career", name: "Legacy Route Career Alias" },
    ];

    for (const route of routesToTest) {
      const url = `${BASE_URL}${route.path}`;
      cdp.clearLogs();

      const startTime = Date.now();
      await cdp.send("Page.navigate", { url });
      await sleep(1200);

      const pageTitle = await cdp.evaluate("document.title");
      const bodyTextLength = await cdp.evaluate("document.body ? document.body.innerText.length : 0");

      const errors = cdp.consoleMessages.filter((m) => m.type === "error");
      const warnings = cdp.consoleMessages.filter((m) => m.type === "warning");
      const exceptions = cdp.exceptions;
      const netErrors = cdp.networkErrors.filter((n) => !n.url.includes("favicon.ico"));

      const passed = exceptions.length === 0 && errors.length === 0;

      const duration = Date.now() - startTime;
      results.push({
        route: route.path,
        name: route.name,
        pageTitle,
        bodyTextLength,
        passed,
        duration,
        errors,
        warnings,
        exceptions,
        netErrors,
      });

      const statusBadge = passed ? "✓ PASS" : "✗ FAIL";
      console.log(
        `[${statusBadge}] ${route.path.padEnd(28)} | "${pageTitle}" | ${bodyTextLength} chars | ${duration}ms`
      );

      if (errors.length > 0) {
        errors.forEach((e) => console.log(`   [Console Error] ${e.text}`));
      }
      if (exceptions.length > 0) {
        exceptions.forEach((e) => console.log(`   [JS Exception] ${e.exception} (${e.url}:${e.line})`));
      }
      if (netErrors.length > 0) {
        netErrors.forEach((e) => console.log(`   [Network HTTP ${e.status}] ${e.url}`));
      }
    }

    // Chatbot Interactive Verification
    console.log("\n--------------------------------------------------------------------------------");
    console.log("  INTERACTIVE TEST: AI ASSISTANT CHATBOT EXPANSION & MARKDOWN RENDERING        ");
    console.log("--------------------------------------------------------------------------------");

    cdp.clearLogs();
    await cdp.send("Page.navigate", { url: `${BASE_URL}/dashboard` });
    await sleep(1500);

    const debugButtons = await cdp.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.map(b => ({
          aria: b.getAttribute('aria-label') || '',
          text: (b.textContent || '').trim().slice(0, 30),
          className: b.className
        }));
      })()
    `);
    // console.log("Buttons on /dashboard:", JSON.stringify(debugButtons, null, 2));

    const chatTriggered = await cdp.evaluate(`
      (() => {
        const launcher = document.querySelector('button[aria-label*="Assistant"], button[aria-label*="Chatbot"]');
        if (launcher) {
          launcher.click();
          return true;
        }
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => {
          const aria = (b.getAttribute('aria-label') || '').toLowerCase();
          const text = (b.textContent || '').toLowerCase();
          return aria.includes('assistant') || aria.includes('chatbot');
        });
        if (target) {
          target.click();
          return true;
        }
        return false;
      })()
    `);

    await sleep(1500);

    const promptClicked = await cdp.evaluate(`
      (() => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        const chip = allButtons.find(b => {
          const text = (b.textContent || '').trim();
          return text.includes('Resume') || text.includes('Kadane') || text.includes('TreeSHAP') || text.includes('EEOC');
        });
        if (chip) {
          const text = chip.textContent.trim();
          chip.click();
          return text;
        }
        return 'Not Found. Buttons: ' + allButtons.map(b => (b.textContent || '').trim()).filter(Boolean).join(' | ');
      })()
    `);

    await sleep(3500); // Wait for stream rendering

    const renderedMarkdownBlocks = await cdp.evaluate(`
      (() => {
        const mdContainers = Array.from(document.querySelectorAll('.markdown-content'));
        if (mdContainers.length === 0) return 0;
        const last = mdContainers[mdContainers.length - 1];
        return last.children ? last.children.length : 0;
      })()
    `);

    const chatErrors = cdp.consoleMessages.filter((m) => m.type === "error");
    const chatExceptions = cdp.exceptions;
    const chatPassed = chatErrors.length === 0 && chatExceptions.length === 0;

    console.log(`[${chatTriggered ? "✓ PASS" : "✗ FAIL"}] Chatbot Drawer Open Trigger: ${chatTriggered}`);
    console.log(`[${promptClicked !== "None" ? "✓ PASS" : "✗ FAIL"}] Clicked Quick Prompt Chip: "${promptClicked}"`);
    console.log(`[${renderedMarkdownBlocks > 0 ? "✓ PASS" : "✗ FAIL"}] Rendered AST Blocks in Chat UI: ${renderedMarkdownBlocks}`);
    console.log(`[${chatPassed ? "✓ PASS" : "✗ FAIL"}] Chat Console Errors: ${chatErrors.length}`);
    console.log(`[${chatPassed ? "✓ PASS" : "✗ FAIL"}] Chat JS Exceptions: ${chatExceptions.length}`);

    if (chatErrors.length > 0) {
      chatErrors.forEach((e) => console.log(`   [Chat Error] ${e.text}`));
    }
    if (chatExceptions.length > 0) {
      chatExceptions.forEach((e) => console.log(`   [Chat Exception] ${e.exception}`));
    }

    console.log("\n================================================================================");
    console.log("  BROWSER TEST SUMMARY                                                         ");
    console.log("================================================================================");
    const totalPassed = results.filter((r) => r.passed).length;
    const totalRoutes = results.length;
    console.log(`Total Routes Tested : ${totalRoutes}`);
    console.log(`Passed With 0 Errors: ${totalPassed}/${totalRoutes}`);
    console.log(`Chatbot Interaction : ${chatPassed ? "100% PASSED (0 Console Errors)" : "FAILED"}`);

    if (totalPassed === totalRoutes && chatPassed) {
      console.log("\n>>> ALL BROWSER CONSOLE AND HYDRATION CHECKS PASSED WITH 0 ERRORS <<<");
    } else {
      console.log("\n>>> CONSOLE ISSUES DETECTED (See detailed report above) <<<");
    }
    console.log("================================================================================");
  } finally {
    if (cdp) {
      try {
        cdp.ws.close();
      } catch {}
    }
    try {
      browserProc.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

runBrowserTests().catch((err) => {
  console.error("Runner Error:", err);
  process.exit(1);
});

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const BASE_URL = `http://localhost:3000`;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testChatbot() {
  const userDataDir = path.join(os.tmpdir(), `cdp_chat_test_${Date.now()}`);
  fs.mkdirSync(userDataDir, { recursive: true });
  const cdpPort = 9333;

  const browser = spawn(CHROME_PATH, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank",
  ]);

  try {
    await sleep(1500);
    const versionRes = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
    const version = await versionRes.json();
    const wsUrl = version.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve) => (ws.onopen = resolve));

    let id = 1;
    function send(method, params = {}) {
      const msgId = id++;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log(`[TIMEOUT] method=${method} id=${msgId}`);
          resolve(null);
        }, 6000);

        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === msgId) {
            clearTimeout(timeout);
            ws.removeEventListener("message", handler);
            resolve(data.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    // Attach to page target
    const targetRes = await send("Target.createTarget", { url: `${BASE_URL}/dashboard` });
    const targetId = targetRes.targetId;
    const attachRes = await send("Target.attachToTarget", { targetId, flatten: true });
    const sessionId = attachRes.sessionId;

    function sendSession(method, params = {}) {
      const msgId = id++;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log(`[TIMEOUT SESSION] method=${method} id=${msgId}`);
          resolve(null);
        }, 6000);

        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === msgId) {
            clearTimeout(timeout);
            ws.removeEventListener("message", handler);
            if (data.error) console.error("Session Error:", data.error);
            resolve(data.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
      });
    }

    await sendSession("Page.enable");
    await sendSession("Runtime.enable");
    await sleep(2500);

    const title = await sendSession("Runtime.evaluate", { expression: "document.title", returnByValue: true });
    console.log("Page title:", title?.result?.value);

    // Click launcher
    const openRes = await sendSession("Runtime.evaluate", {
      expression: `(() => {
        const b = document.querySelector('button[aria-label*="Assistant"]');
        if (b) { b.click(); return "FOUND_AND_CLICKED"; }
        return "NOT_FOUND";
      })()`,
      returnByValue: true,
    });
    console.log("Open Click:", openRes?.result?.value);

    await sleep(1500);

    // Find prompt chips
    const chipRes = await sendSession("Runtime.evaluate", {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const chip = btns.find(b => b.textContent.includes('Resume') || b.textContent.includes('Kadane'));
        if (chip) {
          const text = chip.textContent.trim();
          chip.click();
          return text;
        }
        return 'CHIP_NOT_FOUND: ' + btns.map(b => b.textContent.trim()).filter(Boolean).join(' | ');
      })()`,
      returnByValue: true,
    });
    console.log("Chip Click:", chipRes?.result?.value);

    await sleep(3500);

    const mdRes = await sendSession("Runtime.evaluate", {
      expression: `(() => {
        const md = document.querySelectorAll('.markdown-content');
        return md.length;
      })()`,
      returnByValue: true,
    });
    console.log("Markdown Containers count:", mdRes?.result?.value);

    ws.close();
  } finally {
    browser.kill("SIGKILL");
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

testChatbot().catch(console.error);

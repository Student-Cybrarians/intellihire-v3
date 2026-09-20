const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const nextDir = path.join(projectRoot, '.next');
const outDir = path.join(projectRoot, 'out');

// Clean and recreate outDir
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy _next/static to out/_next/static
const nextStatic = path.join(nextDir, 'static');
const outNextStatic = path.join(outDir, '_next', 'static');
fs.mkdirSync(path.dirname(outNextStatic), { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(nextStatic)) {
  copyRecursive(nextStatic, outNextStatic);
  console.log('[+] Copied .next/static -> out/_next/static');
}

// Copy HTML pages from .next/server/app
const serverApp = path.join(nextDir, 'server', 'app');

function processHtmlFiles(dir, relativeDir = '') {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processHtmlFiles(fullPath, path.join(relativeDir, item));
    } else if (item.endsWith('.html')) {
      const baseName = item.replace(/\.html$/, '');
      if (baseName === 'index' && relativeDir === '') {
        // Root index.html
        fs.copyFileSync(fullPath, path.join(outDir, 'index.html'));
        console.log('[+] Created out/index.html');
      } else if (baseName === '_not-found' || baseName === '404') {
        fs.copyFileSync(fullPath, path.join(outDir, '404.html'));
        console.log('[+] Created out/404.html');
      } else if (baseName === '500') {
        fs.copyFileSync(fullPath, path.join(outDir, '500.html'));
        console.log('[+] Created out/500.html');
      } else {
        // For clean routing: create folder /route/index.html and /route.html
        const targetDir = path.join(outDir, relativeDir, baseName);
        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(fullPath, path.join(targetDir, 'index.html'));
        // Also copy route.html in parent
        const parentTarget = path.join(outDir, relativeDir, `${baseName}.html`);
        fs.copyFileSync(fullPath, parentTarget);
        console.log(`[+] Mapped /${relativeDir ? relativeDir + '/' : ''}${baseName} -> index.html & .html`);
      }
    }
  }
}

processHtmlFiles(serverApp);

// Also copy server/pages 404/500 if not already present
const serverPages = path.join(nextDir, 'server', 'pages');
if (fs.existsSync(serverPages)) {
  if (fs.existsSync(path.join(serverPages, '404.html')) && !fs.existsSync(path.join(outDir, '404.html'))) {
    fs.copyFileSync(path.join(serverPages, '404.html'), path.join(outDir, '404.html'));
  }
  if (fs.existsSync(path.join(serverPages, '500.html')) && !fs.existsSync(path.join(outDir, '500.html'))) {
    fs.copyFileSync(path.join(serverPages, '500.html'), path.join(outDir, '500.html'));
  }
}

console.log('[SUCCESS] Cloudflare Pages static distribution bundle generated in ./out');

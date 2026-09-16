const { spawn } = require('child_process');
const server = spawn('cmd', ['/c', 'npx', '-y', '@cloudflare/mcp-server-cloudflare', 'run', 'f5083db73276fcc04fe0118e9763e126'], {
  env: {
    ...process.env,
    CLOUDFLARE_API_TOKEN: 'cfat_6FHcV1gQ4ZNNTgktEIBRyLJ9CU8I22Xzl0xIwFTF50e0b7c',
    CLOUDFLARE_ACCOUNT_ID: 'f5083db73276fcc04fe0118e9763e126'
  }
});
server.stdout.on('data', data => {
  console.log(data.toString());
});
server.stderr.on('data', data => {
  console.log(data.toString());
});
// Send JSON-RPC to list tools, wait, then call list_projects
const initReq = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1" } }
});
server.stdin.write(initReq + '\n');

setTimeout(() => {
  const req = JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "cf_pages_list_projects", arguments: {} }
  });
  server.stdin.write(req + '\n');
}, 2000);

setTimeout(() => server.kill(), 5000);

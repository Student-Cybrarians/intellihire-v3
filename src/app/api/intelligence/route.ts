export const dynamic = 'force-dynamic';

async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);
  // Remove the /api/intelligence prefix to get the path for the intelligence service
  const path = pathname.replace(/^\/api\/intelligence/, '');
  const intelligenceUrl = `${process.env.INTELLIGENCE_SERVICE_URL || 'http://localhost:8000'}${path}`;

  // Clone the request headers
  const headers = new Headers(request.headers);

  // Set internal headers required by the intelligence service
  const secretKey = process.env.INTERNAL_API_SECRET || 'ih_sec_default_internal_service_key_77a92b3c4d5e';
  headers.set('X-Internal-Secret', secretKey);

  // Get tenantId from request headers, fallback to default
  let tenantId = request.headers.get('X-Tenant-ID');
  if (!tenantId) {
    tenantId = 'default_tenant';
  }
  headers.set('X-Tenant-ID', tenantId);

  headers.set('X-Service-ID', 'edge-nextjs-perimeter');

  // Remove headers that should not be proxied
  headers.delete('host');
  headers.delete('content-length');

  // Proxy the request to the intelligence service
  let res;
  try {
    res = await fetch(intelligenceUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to reach intelligence service' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Prepare response headers
  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete('content-length'); // Let browser set it

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function PUT(request: Request) {
  return handleRequest(request);
}

export async function PATCH(request: Request) {
  return handleRequest(request);
}

export async function DELETE(request: Request) {
  return handleRequest(request);
}

export async function HEAD(request: Request) {
  return handleRequest(request);
}

export async function OPTIONS(request: Request) {
  return handleRequest(request);
}

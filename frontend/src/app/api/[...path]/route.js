import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request, { params }) {
  return proxy(request, params);
}

export async function POST(request, { params }) {
  return proxy(request, params);
}

export async function PUT(request, { params }) {
  return proxy(request, params);
}

export async function DELETE(request, { params }) {
  return proxy(request, params);
}

export async function PATCH(request, { params }) {
  return proxy(request, params);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

async function proxy(request, params) {
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const url = `${BACKEND}/api/${path}`;
  const headers = new Headers();

  for (const [key, value] of request.headers) {
    if (!['host', 'connection'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  try {
    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.text()
      : undefined;

    const resp = await fetch(url, {
      method: request.method,
      headers,
      body: body || undefined,
    });

    const data = await resp.text();

    return new NextResponse(data, {
      status: resp.status,
      headers: {
        'content-type': resp.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: '服务器连接失败，请确保后端已启动' },
      { status: 502 }
    );
  }
}

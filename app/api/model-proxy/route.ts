import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sourceUrl = searchParams.get('url')

  if (!sourceUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(sourceUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 })
  }

  // Only allow Meshy asset host for safety.
  if (parsedUrl.hostname !== 'assets.meshy.ai') {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  const upstream = await fetch(parsedUrl.toString(), {
    method: 'GET',
    cache: 'no-store'
  })

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream error: ${upstream.status}` },
      { status: upstream.status }
    )
  }

  const contentType =
    upstream.headers.get('content-type') ?? 'model/gltf-binary'

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store'
    }
  })
}

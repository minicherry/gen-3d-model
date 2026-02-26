import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ModelUrls = Record<string, string | undefined>

const MESHY_BASE_URL = 'https://api.meshy.ai/openapi/v2'
const MESHY_API_KEY =
  process.env.MESHY_API_KEY ?? 'msy_dummy_api_key_for_test_mode_12345678'

const getModelUrls = (data: any): ModelUrls => {
  return (
    data?.model_urls ??
    data?.result?.model_urls ??
    data?.output?.model_urls ??
    {}
  )
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const upstream = await fetch(`${MESHY_BASE_URL}/text-to-3d`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MESHY_API_KEY}`
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    if (!upstream.ok) {
      const errorText = await upstream.text()
      return NextResponse.json(
        { error: errorText || `Upstream error: ${upstream.status}` },
        { status: upstream.status }
      )
    }

    const data = await upstream.json()
    const taskId = data?.result

    if (!taskId) {
      return NextResponse.json({ error: 'Missing task id' }, { status: 500 })
    }

    const supabase = await createClient()
    await supabase.from('generate_records').upsert(
      {
        task_id: taskId,
        result_id: null,
        model_urls: {},
        generated_at: new Date().toISOString()
      },
      { onConflict: 'task_id' }
    )

    return NextResponse.json({ taskId })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get('taskId')?.trim()

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    const upstream = await fetch(`${MESHY_BASE_URL}/text-to-3d/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MESHY_API_KEY}`
      },
      cache: 'no-store'
    })

    if (!upstream.ok) {
      const errorText = await upstream.text()
      return NextResponse.json(
        { error: errorText || `Upstream error: ${upstream.status}` },
        { status: upstream.status }
      )
    }

    const data = await upstream.json()
    const modelUrls = getModelUrls(data)
    const generatedAt = new Date().toISOString()
    const resultId = data?.id ?? null

    const supabase = await createClient()
    await supabase.from('generate_records').upsert(
      {
        task_id: taskId,
        result_id: resultId,
        model_urls: modelUrls,
        generated_at: generatedAt
      },
      { onConflict: 'task_id' }
    )

    return NextResponse.json({
      task_id: taskId,
      id: resultId ?? taskId,
      status: data?.status,
      model_urls: modelUrls,
      generated_at: generatedAt
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

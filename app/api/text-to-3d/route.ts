import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ModelUrls = Record<string, string | undefined>
type UploadErrors = Record<string, string>

const MESHY_BASE_URL = 'https://api.meshy.ai/openapi/v2'
const MESHY_API_KEY =
  process.env.MESHY_API_KEY ?? 'msy_dummy_api_key_for_test_mode_12345678'
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'generated-models'

const getModelUrls = (data: any): ModelUrls => {
  return (
    data?.model_urls ??
    data?.result?.model_urls ??
    data?.output?.model_urls ??
    {}
  )
}

const getExtension = (key: string, url: string, contentType: string) => {
  const cleanUrl = url.split('?')[0] ?? ''
  const fromUrl = cleanUrl.split('.').pop()?.toLowerCase()
  if (fromUrl) return fromUrl

  if (contentType.includes('model/gltf-binary')) return 'glb'
  if (contentType.includes('model/vnd.usdz+zip')) return 'usdz'
  if (contentType.includes('application/octet-stream')) return key
  return 'bin'
}

const persistModelUrlsToStorage = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  sourceModelUrls: ModelUrls
): Promise<{ modelUrls: ModelUrls; uploadErrors: UploadErrors }> => {
  const entries = Object.entries(sourceModelUrls).filter(
    ([, value]) => typeof value === 'string' && value.length > 0
  ) as Array<[string, string]>

  if (entries.length === 0) {
    return {
      modelUrls: {},
      uploadErrors: { _reason: 'model_urls is empty (task may still be pending)' }
    }
  }

  const ownEntries = await Promise.all(
    entries.map(async ([key, url]) => {
      try {
        const fileResponse = await fetch(url, { cache: 'no-store' })
        if (!fileResponse.ok) {
          return [key, url, `download failed: ${fileResponse.status}`] as const
        }

        const fileBuffer = await fileResponse.arrayBuffer()
        const contentType =
          fileResponse.headers.get('content-type') ?? 'application/octet-stream'
        const extension = getExtension(key, url, contentType)
        const filePath = `${taskId}/${key}.${extension}`

        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, fileBuffer, {
            contentType,
            upsert: true
          })

        if (error) {
          return [key, url, `upload failed: ${error.message}`] as const
        }

        const { data } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath)
        return [key, data.publicUrl, undefined] as const
      } catch (error) {
        return [
          key,
          url,
          `unexpected error: ${error instanceof Error ? error.message : 'unknown'}`
        ] as const
      }
    })
  )

  const modelUrls: ModelUrls = {}
  const uploadErrors: UploadErrors = {}

  ownEntries.forEach(([key, finalUrl, error]) => {
    modelUrls[key] = finalUrl
    if (error) uploadErrors[key] = error
  })

  return { modelUrls, uploadErrors }
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

    const getInfo = await fetch(`${MESHY_BASE_URL}/text-to-3d/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MESHY_API_KEY}`
      },
      cache: 'no-store'
    })

    if (!getInfo.ok) {
      const errorText = await getInfo.text()
      return NextResponse.json(
        { error: errorText || `Upstream error: ${getInfo.status}` },
        { status: getInfo.status }
      )
    }
    const getInfoData = await getInfo.json()
    const status = getInfoData?.status as string | undefined
    const sourceModelUrls = getModelUrls(getInfoData)
    const generatedAt = new Date().toISOString()
    const resultId = getInfoData?.id ?? null
    const supabase = await createClient()
    const { modelUrls: ownModelUrls, uploadErrors } =
      await persistModelUrlsToStorage(
      supabase,
      taskId,
      sourceModelUrls
    )

    await supabase.from('generate_records').upsert(
      {
        task_id: taskId,
        result_id: resultId,
        mode: payload.mode ?? '',
        texture_prompt: payload.texture_prompt ?? '',
        preview_task_id: payload.preview_task_id ?? '',
        prompt: payload.prompt ?? '',
        source_model_urls: sourceModelUrls,
        model_urls: ownModelUrls,
        generated_at: generatedAt
      },
      { onConflict: 'task_id' }
    )

    return NextResponse.json({
      task_id: taskId,
      id: resultId ?? taskId,
      mode: payload.mode,
      texture_prompt: payload.texture_prompt||'',
      preview_task_id: payload.preview_task_id||'',
      prompt: payload.prompt||'',
      status,
      model_urls: ownModelUrls,
      source_model_urls: sourceModelUrls,
      upload_errors: uploadErrors,
      generated_at: generatedAt,
      record_url: `/api/text-to-3d?taskId=${encodeURIComponent(taskId)}&source=db`
    })
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

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('generate_records')
      .select('task_id, result_id, model_urls, source_model_urls, generated_at')
      .eq('task_id', taskId)
      .single()

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    return NextResponse.json({
      task_id: data.task_id,
      id: data.result_id ?? data.task_id,
      model_urls: data.model_urls ?? {},
      source_model_urls: data.source_model_urls ?? {},
      generated_at: data.generated_at,
      mode: data.mode,
      texture_prompt: data.texture_prompt,
      preview_task_id: data.preview_task_id,
      prompt: data.prompt,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

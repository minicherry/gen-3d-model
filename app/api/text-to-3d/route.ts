import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { persistModelUrlsToStorage,persistImageUrlToStorage,persistImageUrlsToStorage } from '@/lib/server/util'
type ModelUrls = Record<string, string | undefined>
type ImageUrls = Record<string, string | undefined>
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
    console.log(getInfoData)
    const status = getInfoData?.status as string | undefined
    const sourceModelUrls = getModelUrls(getInfoData)
    const sourceTextureUrls: ImageUrls[] = Array.isArray(getInfoData?.texture_urls)
      ? getInfoData.texture_urls
      : []
    const sourceThumbnailUrl = getInfoData?.thumbnail_url??''
    const textureImageUrls: ImageUrls[] = []
    const generatedAt = new Date().toISOString()
    const resultId = getInfoData?.id ?? null
    const supabase = await createClient()
    const { modelUrls: ownModelUrls, uploadErrors: ModelUploadErrors } =
      await persistModelUrlsToStorage(
      supabase,
      taskId,
      sourceModelUrls
    )
    const textureResults = await Promise.all(
      sourceTextureUrls.map(async (item: ImageUrls) => {
        const { imageUrls: ownImageUrls } = await persistImageUrlsToStorage(
          supabase,
          taskId,
          item
        )
        return ownImageUrls
      })
    )
    textureImageUrls.push(...textureResults)
    const { imageUrl:thumbnail_url, uploadErrors: ImageUploadErrors } =
      await persistImageUrlToStorage(
      supabase,
      taskId,
      sourceThumbnailUrl
    )
    const record = {
      task_id: taskId,
      result_id: resultId,
      type: 'text-to-3d',
      mode: getInfoData.mode ?? '',
      name: getInfoData.name ?? '',
      model_type: getInfoData.model_type ?? '',
      seed: getInfoData.seed ?? null,
      art_style: getInfoData.art_style ?? '',
      texture_richness: getInfoData.texture_richness ?? '',
      prompt: getInfoData.prompt ?? '',
      negative_prompt: getInfoData.negative_prompt ?? '',
      texture_prompt: getInfoData.texture_prompt ?? '',
      texture_image_url: getInfoData.texture_image_url ?? '',
      preview_task_id: payload.preview_task_id ?? '',
      status: getInfoData.status ?? '',
      created_at: getInfoData.created_at ?? null,
      progress: getInfoData.progress ?? null,
      started_at: getInfoData.started_at ?? null,
      finished_at: getInfoData.finished_at ?? null,
      expires_at: getInfoData.expires_at ?? null,
      preceding_tasks: getInfoData.preceding_tasks ?? null,
      task_error: getInfoData.task_error ?? null,
      source_model_urls: sourceModelUrls,
      model_urls: ownModelUrls,
      texture_urls: textureImageUrls,
      thumbnail_url: thumbnail_url,
      video_url: getInfoData.video_url ?? '',
      generated_at: generatedAt
    }
    await supabase.from('generate_records').upsert(record, { onConflict: 'task_id' })

    return NextResponse.json({
      task_id: taskId,
      id: resultId ?? taskId,
      type: 'text-to-3d',
      mode: getInfoData.mode,
      texture_prompt: getInfoData.texture_prompt||'',
      preview_task_id: payload.preview_task_id||'',
      prompt: getInfoData.prompt||'',
      status,
      model_urls: ownModelUrls,
      texture_urls: textureImageUrls,
      thumbnail_url: thumbnail_url,
      source_model_urls: sourceModelUrls,
      upload_errors: ModelUploadErrors,
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
      .select(
        'task_id, result_id, model_urls, source_model_urls, generated_at, mode, texture_prompt, preview_task_id, prompt'
      )
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

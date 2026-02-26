export interface TextTo3DPayload {
  mode: 'preview' | 'refine'
  prompt?: string
  preview_task_id?: string
  texture_prompt?: string
  [key: string]: unknown
}

export interface ModelUrls {
  glb?: string
  usdz?: string
  fbx?: string
  obj?: string
  mtl?: string
}

export interface GenerateTaskDetailResponse {
  id: string
  status?: string
  model_urls?: ModelUrls
  generated_at?: string
}

export const generateTextTo3D = async (payload: TextTo3DPayload) => {
  const response = await fetch('/api/text-to-3d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Create task failed: ${response.status}`)
  }

  const data = (await response.json()) as { taskId: string }
  return data.taskId
}

export const getGenerate = async (taskId: string) => {
  const response = await fetch(
    `/api/text-to-3d?taskId=${encodeURIComponent(taskId)}`
  )

  if (!response.ok) {
    throw new Error(`Get task failed: ${response.status}`)
  }

  return (await response.json()) as GenerateTaskDetailResponse
}
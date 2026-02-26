import axiosInstance from '@/lib/request'

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
  const data = (await axiosInstance.post('/api/text-to-3d', payload)) as GenerateTaskDetailResponse
  return data
}

export const getGenerate = async (taskId: string) => {
  const response = (await axiosInstance.get(
    `/api/text-to-3d?taskId=${encodeURIComponent(taskId)}`
  )) as GenerateTaskDetailResponse
  return response
}
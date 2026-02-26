import axiosInstance from '../request';

interface GenerateTaskCreateResponse {
  result: string;
}

interface ModelUrls {
  glb?: string;
  usdz?: string;
  fbx?: string;
  obj?: string;
  mtl?: string;
}

export interface GenerateTaskDetailResponse {
  id?: string;
  status?: string;
  model_urls?: ModelUrls;
  result?: {
    model_urls?: ModelUrls;
  };
}

export const generateTextTo3D = async (payload: any) => {
  const response = await axiosInstance.post('/text-to-3d', payload);
  return (response as unknown as GenerateTaskCreateResponse).result;
}

export const getGenerate = async (taskId: string) => {
  const response = await axiosInstance.get(`/text-to-3d/${taskId}`);
  return response as unknown as GenerateTaskDetailResponse;
}
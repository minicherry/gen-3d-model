import axiosInstance from '../request';

export const generateTextTo3D = async (payload: any) => {
  const response = await axiosInstance.post('/text-to-3d', payload);
  
  return response.result;
}

export const getGenerate = async (taskId: string) => {
  const response = await axiosInstance.get(`/text-to-3d/${taskId}`);
  return response;
}
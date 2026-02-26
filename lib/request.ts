// lib/axios.js
import axios from 'axios';

// 创建实例
const axiosInstance = axios.create({
  baseURL: '', // 从环境变量读取
  timeout: 60*1000,
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer msy_dummy_api_key_for_test_mode_12345678` }
});
// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 关键：只在客户端执行，避免 SSR 报错
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response.data, // 直接返回 data，减少 .data 嵌套
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，跳转到登录页
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    // 统一错误提示（可结合 antd/message 等 UI 库）
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);
export default axiosInstance;
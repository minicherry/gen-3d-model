import { createOpenAI } from '@ai-sdk/openai';

export const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com', // DeepSeek OpenAI 兼容 API
    name: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY, // 你的密钥，存储在.env.local
});


// app/api/chat/route.ts
import { streamText } from 'ai';
import { deepseek } from '@/lib/ai-provider'; // 导入自定义提供商

export async function POST(req: Request) {
    const body = await req.json();
    const prompt = typeof (body as { prompt?: unknown }).prompt === 'string'
        ? (body as { prompt: string }).prompt.trim()
        : '';

    if (!prompt) {
        return new Response('Prompt is required', { status: 400 });
    }

    // 使用自定义的 deepseek 提供商
    const result = await streamText({
        model: deepseek.chat('deepseek-chat'), // 强制使用 chat/completions 兼容接口
        prompt,
    });
    return result.toUIMessageStreamResponse();
}
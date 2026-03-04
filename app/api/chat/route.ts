import { NextResponse } from 'next/server'
import { DynamicTool } from 'langchain/tools'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { ChatOpenAI } from '@langchain/openai'
import { POST as textTo3DPost } from '@/app/api/text-to-3d/route'
import { POST as imageTo3DPost } from '@/app/api/image-to-3d/route'

const wantsGenerateModel = (text: string, imageTo3DUrl: string) =>
  /(生成|建模|3d|模型|model|generate)/i.test(text)||imageTo3DUrl

const parseJsonSafe = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      prompt?: unknown
      imageTo3DUrl?: unknown
    }
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    const imageTo3DUrl = typeof body?.imageTo3DUrl === 'string' ? body.imageTo3DUrl.trim() : ''
    if (!prompt && !imageTo3DUrl) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }
    if (imageTo3DUrl) {
      const modelResult = await callImageTo3D(imageTo3DUrl)
      return NextResponse.json({ reply: `检测到模型生成需求，已切换到直连模式并创建任务：${JSON.stringify(modelResult)}` })
    }
    const callTextTo3D = async (input: string) => {
      const internalRequest = new Request(new URL('/api/text-to-3d', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'preview',
          prompt: input
        })
      })
      const response = await textTo3DPost(internalRequest)
      const rawText = await response.text()
      const data = parseJsonSafe<{
        task_id?: string
        status?: string
        model_urls?: Record<string, string>
        record_url?: string
        error?: string
      }>(rawText)

      if (!response.ok) {
        throw new Error(
          `text-to-3d failed: ${
            data?.error ??
            rawText.slice(0, 200) ??
            `HTTP ${response.status}`
          }`
        )
      }

      if (!data) {
        throw new Error(
          `text-to-3d returned non-JSON response: ${rawText.slice(0, 200)}`
        )
      }
      const modelUrl = data.model_urls?.glb ?? ''

      return {
        task_id: data.task_id ?? '',
        status: data.status ?? '',
        model_url: modelUrl,
        record_url: data.record_url ?? ''
      }
    }

    const generateModelByTextTool = new DynamicTool({
      name: 'generate_model_from_text',
      description:
        '当用户要求生成3D模型时使用。输入为模型描述文本；直接调用 text-to-3d 接口生成模型。',
      func: async (input: string) => {
        const result = await callTextTo3D(input)
        return JSON.stringify(result)
      }
    })
    async function callImageTo3D(input: string) {
      const internalRequest = new Request(new URL('/api/image-to-3d', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: input,
        })
      })
      const response = await imageTo3DPost(internalRequest)
      const rawText = await response.text()
      const data = parseJsonSafe<{
        task_id?: string
        status?: string
        model_urls?: Record<string, string>
        error?: string
      }>(rawText)

      if (!response.ok) {
        throw new Error(
          `image-to-3d failed: ${
            data?.error ??
            rawText.slice(0, 200) ??
            `HTTP ${response.status}`
          }`
        )
      }

      if (!data) {
        throw new Error(
          `image-to-3d returned non-JSON response: ${rawText.slice(0, 200)}`
        )
      }
      const modelUrl = data.model_urls?.glb ?? ''

      return {
        task_id: data.task_id ?? '',
        status: data.status ?? '',
        model_url: modelUrl,
        record_url: data.record_url ?? ''
      }
    }
    const generateModelByImageTool = new DynamicTool({
      name: 'generate_model_from_image',
      description:
        '当用户要求生成3D模型时使用。输入为图片URL；直接调用 image-to-3d 接口生成模型。',
      func: async (input: string) => {
        const result = await callImageTo3D(input)
        return JSON.stringify(result)
      }
    })
    const llm = new ChatOpenAI({
      model: 'deepseek-chat',
      apiKey: process.env.DEEPSEEK_API_KEY,
      configuration: { baseURL: 'https://api.deepseek.com' },
      temperature: 0.2
    })

    const tools = [generateModelByTextTool, generateModelByImageTool]
    const executor = await initializeAgentExecutorWithOptions(tools, llm, {
      agentType: 'openai-functions',
      verbose: false,
      agentArgs: {
        prefix:
          '你是3D模型助手。若用户明确表达“生成3D模型/建模/做一个模型”等意图，优先调用 generate_model_from_text 工具。若只是闲聊或问答，直接文字回答。'
      }
    })

    let result: { output?: unknown }
    try {
      result = await executor.invoke({ input: prompt })
    } catch (invokeError) {
      const message =
        invokeError instanceof Error ? invokeError.message : String(invokeError)
      const isInsufficientBalance =
        /402|insufficient balance|余额不足/i.test(message)

      if (!isInsufficientBalance) {
        throw invokeError
      }

      // Fallback mode when LLM billing is unavailable.
      if (wantsGenerateModel(prompt, imageTo3DUrl)) {
        const modelResult = await callTextTo3D(prompt)
        return NextResponse.json({
          reply: `检测到模型生成需求，已切换到直连模式并创建任务：${JSON.stringify(
            modelResult
          )}`
        })
      }

      return NextResponse.json({
        reply:
          '当前 LLM 账户余额不足（402），已进入降级模式。请直接描述你想生成的3D模型，我会直连创建任务。'
      })
    }

    const reply =
      typeof result.output === 'string'
        ? result.output
        : JSON.stringify(result.output)

    return NextResponse.json({ reply })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
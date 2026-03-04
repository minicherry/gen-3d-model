'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Send, User, Bot, Sparkles, Link2, CircleX } from 'lucide-react'
import styles from './chat.module.scss'
import { Upload, message } from 'antd'
import type { RcFile } from 'antd/es/upload'
type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const parseJsonSafe = <T,>(text: string): T | null => {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export function Chat() {
  const [input, setInput] = useState('')
  const [imageTo3DUrl, setImageTo3DUrl] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = input.trim()
    if ((!text && !imageTo3DUrl) || isLoading) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text
    }
    if (imageTo3DUrl) {
      userMessage.text = '图片生成3D模型' + text
    } else {
      userMessage.text = text
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setImageTo3DUrl('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, imageTo3DUrl: imageTo3DUrl })
      })
      const rawText = await response.text()
      const data = parseJsonSafe<{ reply?: string; error?: string }>(rawText)

      if (!response.ok) {
        throw new Error(data?.error || rawText || 'chat request failed')
      }

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text:
          data?.reply?.trim() ||
          rawText.trim() ||
          '已收到请求，但暂时没有返回内容。'
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant-error`,
        role: 'assistant',
        text: `请求失败：${error instanceof Error ? error.message : '未知错误'}`
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }
  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result as string))
    reader.readAsDataURL(img)
  }
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!')
    }
    return isJpgOrPng
  }
  const uploadImage = (options: any) => {
    getBase64(options.file, (url) => {
      setImageTo3DUrl(url)
    })
  }
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className={styles.chatCard}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <div className={styles.logoBox}>
            <Sparkles className={styles.logoIcon} />
          </div>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>Gen3D AI</h2>
            <div className={styles.onlineWrap}>
              <span className={styles.onlinePing}>
                <span className={styles.onlinePingInner}></span>
                <span className={styles.onlineDot}></span>
              </span>
              <p className={styles.onlineText}>Online</p>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className={styles.loadingDots}>
            <span className={styles.dot} />
            <span className={`${styles.dot} ${styles.delay1}`} />
            <span className={`${styles.dot} ${styles.delay2}`} />
          </div>
        )}
      </div>

      <div ref={scrollRef} className={styles.messageList}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <Bot className={styles.emptyIcon} />
            </div>
            <div className={styles.emptyTextWrap}>
              <p className={styles.emptyTitle}>准备好开始对话了吗？</p>
              <p className={styles.emptyDesc}>
                我是 Gen3D AI 驱动的极简助手，
                <br />
                随时为您提供精准的回答。
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            return (
              <div
                key={message.id}
                className={`${styles.messageRow} ${
                  message.role === 'user' ? styles.messageRowUser : ''
                }`}
              >
                <div
                  className={`${styles.avatar} ${
                    message.role === 'user'
                      ? styles.avatarUser
                      : styles.avatarBot
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className={styles.avatarIcon} />
                  ) : (
                    <Bot className={styles.avatarIcon} />
                  )}
                </div>
                <div
                  className={`${styles.bubble} ${
                    message.role === 'user'
                      ? styles.bubbleUser
                      : styles.bubbleBot
                  }`}
                >
                  {message.text}
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputWrap}>
          {imageTo3DUrl && (
            <div className={styles.showAsset}>
              {imageTo3DUrl && (
                <img
                  src={imageTo3DUrl}
                  alt="image"
                  className={styles.imageTo3D}
                />
              )}
              <CircleX
                className={styles.closeIcon}
                size={15}
                onClick={() => setImageTo3DUrl('')}
              />
            </div>
          )}
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入您的问题..."
            className={styles.input}
            disabled={isLoading}
          />
          <div className={styles.opBtnWrap}>
            <Upload
              name="file"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={uploadImage}
              beforeUpload={beforeUpload}
            >
              <Link2 />
            </Upload>

            <Button
              type="submit"
              size="icon"
              disabled={(!input.trim() && !imageTo3DUrl) || isLoading}
              className={`${styles.submitBtn} ${
                input.trim() || imageTo3DUrl ? styles.submitBtnVisible : ''
              }`}
            >
              <Send className={styles.sendIcon} />
            </Button>
          </div>
        </div>
        <div className={styles.footerHint}>
          <div className={styles.footerLine} />
          <p className={styles.footerText}>GEN3D AI • PRECISION & SPEED</p>
          <div className={styles.footerLine} />
        </div>
      </form>
    </div>
  )
}

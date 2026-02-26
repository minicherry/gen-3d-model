'use client'

import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Send, User, Bot, Sparkles } from 'lucide-react'
import styles from './chat.module.scss'

export function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages }) => {
        const latestUserMessage = [...messages]
          .reverse()
          .find((message) => message.role === 'user')

        const prompt =
          latestUserMessage?.parts
            ?.filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('')
            .trim() ?? ''

        return {
          body: { prompt }
        }
      }
    })
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
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
            <h2 className={styles.title}>DeepSeek AI</h2>
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
                我是 DeepSeek 驱动的极简助手，
                <br />
                随时为您提供精准的回答。
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const text =
              message.parts
                ?.filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('') ?? ''

            return (
              <div
                key={message.id}
                className={`${styles.messageRow} ${
                  message.role === 'user' ? styles.messageRowUser : ''
                }`}
              >
                <div
                  className={`${styles.avatar} ${
                    message.role === 'user' ? styles.avatarUser : styles.avatarBot
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
                    message.role === 'user' ? styles.bubbleUser : styles.bubbleBot
                  }`}
                >
                  {text}
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputWrap}>
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入您的问题..."
            className={styles.input}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className={`${styles.submitBtn} ${
              input.trim() ? styles.submitBtnVisible : ''
            }`}
          >
            <Send className={styles.sendIcon} />
          </Button>
        </div>
        <div className={styles.footerHint}>
          <div className={styles.footerLine} />
          <p className={styles.footerText}>DEEPSEEK AI • PRECISION & SPEED</p>
          <div className={styles.footerLine} />
        </div>
      </form>
    </div>
  )
}

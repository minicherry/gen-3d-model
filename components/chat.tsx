'use client'

import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Send, User, Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="flex flex-col w-full max-w-2xl mx-auto h-[600px] border border-border/40 rounded-2xl bg-background shadow-2xl shadow-black/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground/90">
              DeepSeek AI
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Online
              </p>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="flex gap-1 items-center bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
            <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
            <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-xs mx-auto animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-2 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">准备好开始对话了吗？</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
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
                className={cn(
                  'flex items-start gap-4 transition-all animate-in fade-in slide-in-from-bottom-3 duration-500',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors',
                    message.role === 'user'
                      ? 'bg-primary border-primary shadow-sm text-primary-foreground'
                      : 'bg-muted/50 border-border/50 text-muted-foreground'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-[1.6] transition-all whitespace-pre-wrap',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/10'
                      : 'bg-muted/30 text-foreground rounded-tl-none border border-border/20'
                  )}
                >
                  {text}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 border-t border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="relative flex items-center group">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入您的问题..."
            className="pr-14 py-7 bg-muted/10 border-border/30 focus-visible:ring-primary/10 transition-all rounded-2xl text-[14px]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className={cn(
              'absolute right-2.5 h-10 w-10 rounded-xl shadow-lg transition-all active:scale-95',
              input.trim()
                ? 'bg-primary opacity-100 scale-100'
                : 'opacity-0 scale-90'
            )}
          >
            <Send className="w-4.5 h-4.5" />
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-border/40" />
          <p className="text-[10px] text-muted-foreground font-medium tracking-tight">
            DEEPSEEK AI • PRECISION & SPEED
          </p>
          <div className="h-px w-8 bg-border/40" />
        </div>
      </form>
    </div>
  )
}

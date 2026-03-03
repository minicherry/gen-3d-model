'use client'

import React, { useState, useEffect } from 'react'
import ModelViewer from '@/components/ModelViewer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Wand2,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  AlertCircle,
  Plus
} from 'lucide-react'
import { Upload, message } from 'antd'
import type { RcFile } from 'antd/es/upload'
import {
  generateTextTo3D,
  TextTo3DPayload,
  generateImageTo3D,
  ImageTo3DPayload
} from '@/lib/api/generate'
import styles from './genModel.module.scss'

interface GenModelProps {
  onModelUrlChange?: (url: string) => void
}

const GenModel = ({ onModelUrlChange }: GenModelProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [imageTo3DUrl, setImageTo3DUrl] = useState('')

  const handleGenerateText = async () => {
    if (mode === 'text' && !prompt.trim()) return

    setIsGenerating(true)
    const payload: TextTo3DPayload = {
      mode: 'preview',
      prompt: prompt
    }
    try {
      const response = await generateTextTo3D(payload)
      onModelUrlChange?.(response?.model_urls?.glb ?? '')
    } catch (error) {
      console.error(error)
    }
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
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
  const handleGenerateImage = async () => {
    if (mode === 'image' && !imageTo3DUrl) return

    setIsGenerating(true)
    const payload: TextTo3DPayload = {
      image_url: imageTo3DUrl,
      should_texture: false
    }
    try {
      const response = await generateImageTo3D(payload)
      onModelUrlChange?.(response?.model_urls?.glb ?? '')
    } catch (error) {
      console.error(error)
    }
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }
  const genImageButton = (
    <Button
      className={styles.generateBtn}
      onClick={handleGenerateImage}
      disabled={
        isGenerating ||
        (mode === 'text' ? prompt.trim().length === 0 : !imageTo3DUrl)
      }
    >
      {isGenerating ? (
        <>
          <Loader2 className={styles.spinner} />
          生成中...
        </>
      ) : (
        <>
          <Sparkles className={styles.spinner} />
          开始生成
        </>
      )}
    </Button>
  )
  return (
    <div className={styles.leftPanel}>
      <div className={styles.intro}>
        <h1 className={styles.introTitle}>生成模型</h1>
        <p className={styles.introDesc}>配置参数以生成独特的 3D 资产</p>
      </div>

      <div className={styles.modeSection}>
        <div className={styles.modeTabs}>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`${styles.modeButton} ${
              mode === 'text'
                ? styles.modeButtonActive
                : styles.modeButtonInactive
            }`}
          >
            <Wand2 className={styles.iconSm} />
            文生 3D
          </button>
          <button
            type="button"
            onClick={() => setMode('image')}
            className={`${styles.modeButton} ${
              mode === 'image'
                ? styles.modeButtonActive
                : styles.modeButtonInactive
            }`}
          >
            <ImageIcon className={styles.iconSm} />
            图生 3D
          </button>
        </div>

        {mode === 'text' ? (
          <div className={styles.formGroup}>
            <div className={styles.formGroup}>
              <Label htmlFor="prompt" className={styles.label}>
                提示词 (Prompt)
              </Label>
              <textarea
                id="prompt"
                placeholder="例如：一个赛博朋克风格的武士头盔，带有发光的霓虹灯带，磨损的金属质感..."
                className={styles.textarea}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <p className={styles.hintRow}>
                <span>越详细的描述效果越好</span>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      '一个低多边形风格的太空头盔，银色金属材质，蓝色发光面罩'
                    )
                  }
                  className={styles.exampleBtn}
                >
                  试一试示例
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <div className={styles.uploadCard}>
              <div className={styles.uploadIconWrap}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  customRequest={uploadImage}
                  beforeUpload={beforeUpload}
                >
                  {imageTo3DUrl ? (
                    <img
                      draggable={false}
                      src={imageTo3DUrl}
                      alt="avatar"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Plus />
                  )}
                </Upload>
              </div>
            </div>
            <div className={styles.noteBox}>
              <AlertCircle className={styles.noteIcon} />
              <p className={styles.noteText}>
                为了获得最佳效果，请上传物体轮廓清晰、背景简单的图片。
              </p>
            </div>
          </div>
        )}
      </div>
      <div className={styles.actionFooter}>
        {mode === 'text' ? (
          <Button
            className={styles.generateBtn}
            onClick={handleGenerateText}
            disabled={
              isGenerating ||
              (mode === 'text' ? prompt.trim().length === 0 : !uploadedFileName)
            }
          >
            {isGenerating ? (
              <>
                <Loader2 className={styles.spinner} />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className={styles.spinner} />
                开始生成
              </>
            )}
          </Button>
        ) : (
          genImageButton
        )}
        <div className={styles.statusRow}>
          <span>预计消耗: 4 积分</span>
          <span>剩余积分: 120</span>
        </div>
      </div>
    </div>
  )
}

export default GenModel

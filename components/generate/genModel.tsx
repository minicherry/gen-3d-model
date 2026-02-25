'use client'

import React, { useState, useEffect } from 'react'
import ModelViewer from '@/components/ModelViewer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Wand2,
  Image as ImageIcon,
  Upload,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { generateTextTo3D, getGenerate } from '@/lib/api/generate'
import styles from './genModel.module.scss'

const GenModel = ({ onModelUrlChange }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const handleGenerate = async () => {
    if (mode === 'text' && !prompt.trim()) return
    if (mode === 'image' && !uploadedFileName) return

    setIsGenerating(true)
    const payload = {
      mode: 'preview',
      prompt: prompt
    }
    try {
      const response = await generateTextTo3D(payload)

      const taskId = response
      const getResponse = await getGenerate(taskId)
      onModelUrlChange(getResponse.model_urls.glb)
    } catch (error) {
      console.error(error)
    }
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className={styles.leftPanel}>
      <div className={styles.intro}>
        <h1 className={styles.introTitle}>创作中心</h1>
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
                <Upload className={styles.uploadIcon} />
              </div>
              <h3 className={styles.uploadTitle}>点击或拖拽上传图片</h3>
              <p className={styles.uploadDesc}>支持 JPG, PNG 格式，最大 10MB</p>
              <input
                type="file"
                accept="image/png,image/jpeg"
                aria-label="上传用于生成 3D 的图片"
                className={styles.fileInput}
                onChange={(e) =>
                  setUploadedFileName(e.target.files?.[0]?.name ?? '')
                }
              />
              {uploadedFileName ? (
                <p className={styles.fileName}>已选择：{uploadedFileName}</p>
              ) : null}
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
        <Button
          className={styles.generateBtn}
          onClick={handleGenerate}
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
        <div className={styles.statusRow}>
          <span>预计消耗: 4 积分</span>
          <span>剩余积分: 120</span>
        </div>
      </div>
    </div>
  )
}

export default GenModel

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ModelViewer from '@/components/genShow/modelViewer'
import { Button } from '@/components/ui/button'
import { Package, Box, Grid3X3 } from 'lucide-react'
import GenModel from '@/components/generate/genModel'
import GenTexture from '@/components/generate/genTexture'
import styles from './page.module.scss'
const Generate = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewerRemoteUrl, setViewModelUrl] = useState('')
  const [nowPanel, setNowPanel] = useState<'model' | 'texture'>('model')
  useEffect(() => {
    console.log('页面初始化，调用方法')
    // fetchData()

    return () => {
      console.log('组件卸载，清理工作')
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          返回首页
        </Link>
        <h1 className={styles.title}>3D 生成</h1>
        <div className={styles.headerPlaceholder} />
      </header>

      <main className={styles.main}>
        <div className={styles.leftMenu}>
          <div
            className={`${styles.leftMenuItem} ${nowPanel === 'model' ? styles.leftMenuItemActive : ''}`}
            onClick={() => setNowPanel('model')}
          >
            <Package />
            <div>模型</div>
          </div>
          <div
            className={`${styles.leftMenuItem} ${nowPanel === 'texture' ? styles.leftMenuItemActive : ''}`}
            onClick={() => setNowPanel('texture')}
          >
            <Grid3X3 />
            <div>贴图</div>
          </div>
        </div>
        {nowPanel === 'model' ? (
          <GenModel onModelUrlChange={(url: string) => setViewModelUrl(url)} />
        ) : (
          <GenTexture
            onModelUrlChange={(url: string) => setViewModelUrl(url)}
          />
        )}

        <div className={styles.rightPanel}>
          <div className={styles.toolbar}>
            <Button variant="secondary" size="sm" className={styles.toolbarBtn}>
              线框模式
            </Button>
            <Button variant="secondary" size="sm" className={styles.toolbarBtn}>
              显示贴图
            </Button>
            <Button variant="secondary" size="sm" className={styles.toolbarBtn}>
              环境光照
            </Button>
          </div>

          <div className={styles.viewerWrap}>
            <div className={styles.viewerCard}>
              <ModelViewer remoteUrl={viewerRemoteUrl} />
            </div>
          </div>

          <div className={styles.history}>
            <h3 className={styles.historyTitle}>历史记录</h3>
            <div className={styles.historyList}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={styles.historyItem}>
                  <div className={styles.historyOverlay}>
                    <span className={styles.historyOverlayText}>查看</span>
                  </div>
                  {/* Placeholder for history item thumbnail */}
                  <div className={styles.historyThumb}>
                    <Box className={styles.historyIcon} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Generate

import React, { useState, useEffect } from 'react'
import { Maximize2, RotateCw, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModelViewerProps {
  isGenerating?: boolean
}

const ModelViewer: React.FC<ModelViewerProps> = ({ isGenerating = false }) => {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (!isGenerating) {
      const interval = setInterval(() => {
        setRotation((r) => (r + 0.5) % 360)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isGenerating])

  return (
    <div className="relative w-full h-full bg-black/40 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center group">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform:
            'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
          transformOrigin: 'top center'
        }}
      />

      {isGenerating ? (
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
          <div className="text-primary font-medium animate-pulse">
            正在构建几何体...
          </div>
        </div>
      ) : (
        <div
          className="relative z-10 transform-style-3d transition-transform duration-100"
          style={{ transform: `rotateY(${rotation}deg)` }}
        ></div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
          title="重置视角"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
          title="全屏"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-white/20 mx-1"></div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
          title="分享"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:bg-primary/20 hover:text-primary rounded-full"
          title="下载模型"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-6 right-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-muted-foreground border border-white/10">
        预览模式
      </div>
    </div>
  )
}

export default ModelViewer

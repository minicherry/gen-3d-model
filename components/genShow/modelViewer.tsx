'use client'

import React, { useEffect, useRef } from 'react'
import styles from './modelViewer.module.scss'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
const REMOTE_GLB_URL = ''
interface ModelViewerProps {
  isGenerating?: boolean
  remoteUrl?: string
}

const buildProxyModelUrl = (url: string): string => {
  if (process.env.NODE_ENV === 'development') {
    const parsed = new URL(url)
    return `/generated-models${parsed.pathname}${parsed.search}`
  }
  return `/api/model-proxy?url=${encodeURIComponent(url)}`
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  isGenerating = false,
  remoteUrl = REMOTE_GLB_URL
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof window === 'undefined') return

    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )

    scene.background = new THREE.Color(0x000)

    camera.position.z = 5

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    container.appendChild(renderer.domElement)
    const canvas = renderer.domElement
    canvas.id = 'threejs-main-canvas' // 添加 ID
    canvas.className = 'threejs-canvas interactive-scene' // 添加类名
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.update()

    // 添加光源
    // 环境光 - 提供整体基础照明（更亮的白色）
    const ambientLight = new THREE.AmbientLight(0xffffff, 3)
    scene.add(ambientLight)

    // 主方向光 - 从右上方照射（增强强度）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(50, 100, 100)
    scene.add(directionalLight)

    // 底部光 - 从下方照射，照亮底部红色部分
    const bottomLight = new THREE.DirectionalLight(0xffffff, 2)
    bottomLight.position.set(0, -50, 0)
    scene.add(bottomLight)

    // 补光 - 从前方照射
    const frontLight = new THREE.DirectionalLight(0xffffff, 1)
    frontLight.position.set(0, 0, 50)
    // scene.add(frontLight)
    const loader = new GLTFLoader()
    //TODO：后端开发压缩后开启dracoLoader
    const dracoLoader = new DRACOLoader()

    dracoLoader.setDecoderPath(
      'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'
    )
    dracoLoader.setDecoderConfig({ type: 'js' })
    loader.setDRACOLoader(dracoLoader)
    if (remoteUrl) {
      console.log('remoteUrl', remoteUrl)
      const showProxyUrl = buildProxyModelUrl(remoteUrl)
      loader.load(showProxyUrl, (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const _scale = maxDim
        // model.scale.setScalar(scale)
        model.name = 'pikachu_SceneRootNode'
        model.userData = {
          type: 'model'
        }
        scene.add(model)
      })
    }
    let frameId = 0
    // 动画循环
    const animate = () => {
      frameId = requestAnimationFrame(animate)

      controls.update()

      renderer.render(scene, camera)
    }

    animate()
    // 处理窗口大小变化
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', handleResize)
    // 清理函数
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      container.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [isGenerating, remoteUrl])

  return (
    <div className={styles.viewerRoot}>
      {isGenerating ? (
        <div className={styles.generatingWrap}>
          <div className={styles.loaderWrap}>
            <div className={styles.loaderPulse}></div>
            <div className={styles.loaderSpin}></div>
          </div>
          <div className={styles.generatingText}>正在构建几何体...</div>
        </div>
      ) : (
        <div className={styles.modelPlaceholder} ref={containerRef}></div>
      )}

      <div className={styles.previewBadge}>预览模式</div>
    </div>
  )
}

export default ModelViewer

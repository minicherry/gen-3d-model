import React from 'react'
import FeatureCard from '@/components/FeatureCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ArrowRight,
  Box,
  Wand2,
  Zap,
  Layers,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 w-full max-w-[1440px] mx-auto pt-16">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 flex flex-col items-center text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Pixso3D V2.0 现已发布
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl glow-text animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            将创意瞬间转化为 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              3D 现实
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            新一代 AI 3D 生成引擎。支持文本和图片输入，极速生成高精度、可商用的
            3D 资产。为游戏开发、影视制作和产品设计赋能。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/generate">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-primary hover:bg-primary/90 shadow-custom rounded-full"
              >
                立即开始生成
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base border-white/20 hover:bg-white/10 rounded-full"
            >
              查看作品库
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-20 pt-10 border-t border-white/5 animate-in fade-in duration-1000 delay-500">
            <div>
              <div className="text-3xl font-bold text-white mb-1">10s</div>
              <div className="text-sm text-muted-foreground">平均生成时间</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">4K</div>
              <div className="text-sm text-muted-foreground">纹理分辨率</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">10W+</div>
              <div className="text-sm text-muted-foreground">已生成模型</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">OBJ/GLB</div>
              <div className="text-sm text-muted-foreground">多格式导出</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">全流程 AI 赋能</h2>
            <p className="text-muted-foreground">从概念到模型，仅需几秒钟</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Wand2}
              title="文本生成 3D"
              description="无需建模基础，只需输入一句描述，AI 即可理解并构建出复杂的 3D 结构，包含纹理和材质。"
            />
            <FeatureCard
              icon={ImageIcon}
              title="图片生成 3D"
              description="上传一张 2D 概念图或照片，算法自动推断深度和侧面信息，还原完整的立体模型。"
            />
            <FeatureCard
              icon={Box}
              title="生产级拓扑"
              description="生成的模型拥有干净的四边面拓扑结构，UV 展开合理，可直接导入 Blender、Unity 或 UE 中使用。"
            />
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 py-20 bg-card/30 rounded-3xl mb-10 border border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold">加速您的工作流</h2>
              <ul className="space-y-4">
                {[
                  '游戏资产快速原型制作',
                  '电商产品 3D 展示',
                  'AR/VR 内容创作',
                  '3D 打印模型生成'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary w-5 h-5" />
                    <span className="text-lg text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="link"
                className="text-primary p-0 h-auto font-semibold"
              >
                了解更多场景 &rarr;
              </Button>
            </div>
            <div className="flex-1 w-full relative h-[400px] bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              {/* Decorative floating elements */}
              <div className="absolute w-32 h-32 bg-primary/30 rounded-full blur-3xl top-10 left-10"></div>
              <div className="absolute w-40 h-40 bg-blue-500/30 rounded-full blur-3xl bottom-10 right-10"></div>
              <Box className="w-32 h-32 text-white/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 bg-black/40">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 font-medium">Pixso3D © 2024</span>
          </div>
          <div className="flex gap-8 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              隐私政策
            </a>
            <a href="#" className="hover:text-white transition-colors">
              服务条款
            </a>
            <a href="#" className="hover:text-white transition-colors">
              联系我们
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

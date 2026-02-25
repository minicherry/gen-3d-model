import React from 'react'
import Link from 'next/link'
import { Box, Sparkles, Layers, History, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Header = () => {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Box className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Pixso<span className="text-primary">3D</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-white' : 'text-muted-foreground'}`}
          >
            首页
          </Link>
          <Link
            href="/generate"
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/generate') ? 'text-white' : 'text-muted-foreground'}`}
          >
            开始生成
          </Link>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            模型库
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            定价
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-white"
          >
            <Github className="w-5 h-5" />
          </Button>
          <Link to="/generate">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-custom">
              <Sparkles className="w-4 h-4" />
              立即生成
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header

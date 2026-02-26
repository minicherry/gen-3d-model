# Gen 3D Model

一个基于 Next.js 的 3D 资产生成应用，支持：

- 文生 3D（Text to 3D）
- 贴图生成（Refine）
- 3D 模型在线预览
- 生成记录存储与查询
- AI 对话（DeepSeek）

## 在线访问

- 生成页面：<https://gen-3d-model.vercel.app/generate>

## 项目功能

- **3D 生成工作台**
  - 支持模型与贴图两种模式切换
  - 输入 Prompt 后发起 Meshy `text-to-3d` 任务
- **后端接口封装**
  - 统一由 Next.js API Route 代理第三方接口
  - 前端不直接暴露第三方 API Key
- **数据落库**
  - 保存 `task_id`、`result_id`、`model_urls`、`generated_at`
  - 支持按时间倒序读取历史记录
- **模型预览**
  - 使用 Three.js 渲染 GLB
  - 支持代理加载，规避跨域问题

## 技术栈

- **前端**：React 19、Next.js App Router、TypeScript、SCSS Module
- **3D**：Three.js、GLTFLoader、DRACOLoader、OrbitControls
- **后端接口**：Next.js Route Handlers（`app/api/*`）
- **第三方服务**：
  - Meshy API（`/text-to-3d`）
  - DeepSeek（聊天）
- **数据库**：Supabase（Postgres + RLS）
- **部署**：Vercel

## 目录结构（核心）

```bash
app/
  api/
    text-to-3d/route.ts        # 封装 Meshy text-to-3d
    model-proxy/route.ts       # 模型资源代理
    chat/route.ts              # AI 对话
  generate/page.tsx            # 生成页
components/
  generate/                    # 生成参数面板
  genShow/modelViewer.tsx      # 模型预览
lib/
  api/generate.ts              # 前端调用封装
  request.ts                   # axios 实例
  supabase/server.ts           # Supabase 服务端客户端
```

## 快速开始

### 1) 安装依赖

```bash
pnpm install
```

### 2) 配置环境变量（`.env.local`）

请至少配置：

```env
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxx
MESHY_API_KEY=xxx
DEEPSEEK_API_KEY=xxx
```

### 3) 初始化数据表

在 Supabase SQL Editor 执行：

- `generate-records-table.sql`

### 4) 本地启动

```bash
pnpm dev
```

访问：`http://localhost:3000/generate`

## 接口说明（简版）

### `POST /api/text-to-3d`

- 作用：创建 Meshy 任务
- 入参：`mode`、`prompt`（或 `preview_task_id` + `texture_prompt`）
- 返回：`{ taskId }`
- 同时入库一条初始记录

### `GET /api/text-to-3d?taskId=xxx`

- 作用：查询任务详情
- 返回：`{ task_id, id, status, model_urls, generated_at }`
- 同时更新数据库中的 `result_id`、`model_urls`、`generated_at`

## 贴图 / 页面预览

你可以把截图放到仓库后，在这里展示，例如：

```md
![生成页面截图](./docs/generate-page.png)
```

## 备注

- 开发环境支持代理转发资源，减少跨域问题
- 线上推荐通过后端代理第三方接口，避免密钥泄露

# NovelForge - AI 小说生成器

通过性格测试分析你的内在人格，AI 为你量身打造独一无二的小说世界。

**🌐 在线体验：[novelforge-site.netlify.app](https://novelforge-site.netlify.app)**

## 功能

- 🧠 **18 道性格测试题**：6 维度人格分析（勇气、理想、热血、利他、叛逆、开朗）
- 🦸 **AI 主角塑造**：DeepSeek 根据你的性格画像创建主角
- 📖 **小说生成**：自动生成世界观设定、故事主线和精彩小说名
- 🔐 **用户系统**：注册/登录，保存每一篇生成的小说

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 + React 18 + Tailwind CSS |
| 后端 | Express.js + Prisma ORM |
| 数据库 | SQLite（可切换 PostgreSQL） |
| 认证 | JWT (jsonwebtoken + bcrypt) |
| AI | DeepSeek API |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Yinkikiyin/novelforge.git
cd novelforge
```

### 2. 配置后端

```bash
cd backend
npm install
cp .env.example .env
```

编辑 `.env`，填入你的 DeepSeek API Key：

```
DEEPSEEK_API_KEY="你的API密钥"
```

启动数据库：

```bash
npx prisma db push
```

### 3. 启动后端（终端1）

```bash
npm run dev
# → http://localhost:3001
```

### 4. 配置并启动前端（终端2）

```bash
cd ../frontend
npm install
npm run dev
# → http://localhost:3000
```

### 5. 打开浏览器

访问 http://localhost:3000，注册账号后开始测试。

## 公网部署（可选）

使用 Cloudflare Tunnel 获得临时公网地址：

```bash
cloudflared tunnel --url http://localhost:3000
```

## 项目结构

```
novelforge/
├── backend/
│   ├── prisma/schema.prisma    # 数据库模型
│   ├── src/
│   │   ├── index.js            # Express 入口
│   │   ├── routes/             # API 路由
│   │   ├── services/deepseek.js # AI 生成服务
│   │   ├── middleware/auth.js   # JWT 认证
│   │   └── data/questions.js   # 测试题库
│   └── .env.example            # 配置模板
├── frontend/
│   └── src/
│       ├── app/                # Next.js 页面
│       │   ├── page.js         # 首页
│       │   ├── quiz/           # 测试题 + 结果
│       │   ├── login/          # 登录
│       │   ├── register/       # 注册
│       │   ├── novel/          # 小说详情
│       │   ├── dashboard/      # 用户中心
│       │   └── api/            # API 代理
│       ├── components/         # 复用组件
│       └── lib/                # 工具库
└── .gitignore
```

## 获取 DeepSeek API Key

1. 注册 https://platform.deepseek.com
2. 进入 API Keys 页面
3. 创建新 Key 并复制
4. 填入 `backend/.env` 的 `DEEPSEEK_API_KEY`

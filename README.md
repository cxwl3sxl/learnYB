# LearnYB — 英语音标学习工具

基于 Web 的交互式英语国际音标（IPA）学习平台。涵盖 48 个音标的认知、辨音、发音练习，配合游戏化激励和云端同步。

[在线使用](https://learnyb.app) · [提交反馈](https://github.com/yourname/learnYB/issues)

## 功能概览

| 模块 | 功能 |
|------|------|
| 音标表 | 48 个音标交互卡片，点击查看详情，悬停预览发音，双击标记掌握 |
| 对比练习 | 5 组相似音标对比（长/短元音、清/浊辅音、易混淆音） |
| 听力练习 | 10 题一轮测验，3 种题型，倒计时，结果回顾 |
| 跟读录音 | 麦克风录音 + Canvas 实时波形 + 语音识别对比 |
| 学习路径 | 7 阶段技能树，自动解锁，阶段专项练习 |
| 单词查询 | 输入单词显示音标拆分，每个音标链接到详情 |
| 激励中心 | XP 等级、连续打卡、12 枚成就徽章、周日历 |
| 云端同步 | 注册登录，多设备数据同步，全局排行榜 |

## 快速开始

### 纯前端模式（零后端）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:5173
```

纯前端模式下所有数据存储在浏览器 localStorage 中，无需后端。

### 完整模式（含后端 + 同步）

```bash
# 终端 1：启动后端
cd server && npm install && node index.js
# → http://localhost:3001

# 终端 2：启动前端
npm run dev
# → http://localhost:5173（API 自动代理到 3001）
```

### 生产构建

```bash
npm run build
# → dist/ 目录可直接部署到任何静态托管
```

### 技术栈

| 前端 | 后端 |
|------|------|
| 原生 JS (ES Modules) + Vite 6 | Node.js + Express 4 |
| Web Speech API (TTS + STT) | better-sqlite3 |
| MediaRecorder + Canvas | bcrypt + JWT |
| Service Worker (PWA) | |

## 项目结构

```
learnYB/
├── index.html                        # 主页面（9 个 Tab）
├── package.json                      # 前端脚本
├── vite.config.js                    # Vite + API proxy
├── .gitignore
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service Worker
│   └── icon-{192,512}.png            # PWA 图标
├── src/
│   ├── main.js                       # 入口（模块初始化 + 自动同步）
│   ├── style.css                     # 全局样式（~27KB，响应式）
│   ├── data/
│   │   └── ipa.js                    # 48 个音标数据
│   ├── utils/
│   │   ├── audio.js                  # Web Speech API 封装
│   │   └── sync.js                   # 云同步核心逻辑
│   └── components/
│       ├── soundCard.js              # 音标卡片组件
│       ├── practice.js               # 听力练习引擎
│       ├── recording.js              # 录音 + 波形 + 识别
│       ├── learningPath.js           # 7 阶段技能树
│       ├── gamification.js           # XP / 打卡 / 成就
│       ├── wordLookup.js             # 单词音标查询
│       └── sync.js                   # 登录 / 同步 UI + 排行榜
├── server/
│   ├── package.json
│   ├── index.js                      # Express 入口
│   ├── data/learnyb.db               # SQLite DB（运行时生成，不提交）
│   ├── middleware/
│   │   ├── db.js                     # 数据库初始化 + 建表
│   │   └── auth.js                   # JWT 认证中间件
│   └── routes/
│       ├── auth.js                   # 注册 / 登录 / 登出 / me
│       ├── sync.js                   # push / pull / status
│       └── leaderboard.js            # 全局排行榜
└── docs/
    └── roadmap.md                    # 迭代规划文档
```

## 数据流

```
┌─────────────┐     push (30s 间隔)      ┌──────────────┐
│  localStorage │ ──────────────────────→ │   Express    │
│  (6 类数据)   │                         │   + SQLite   │
│              │ ←────────────────────── │              │
└─────────────┘     pull (手动)           └──────────────┘
       ↑                                          │
       │ 各组件读写                                │ 排行榜
       │                                          ▼
  soundCard.js ── mastered, attempts
  practice.js   ── attempts (自动统计)
  recording.js  ── recording_history
  learningPath.js ── learning_stages
  gamification.js ── gamification (XP, streak, achievements)
  wordLookup.js ── search_history
```

## 开发规范

- 前端纯 ESM 模块，通过 Vite 的 `?used` 自动 Tree-shaking
- 新功能以独立 `src/components/` 文件添加，在 `main.js` 中初始化
- CSS 按模块分区注释，响应式媒体查询统一管理
- 后端路由前缀 `/api/`，认证中间件保护同步和排行榜接口
- 提交信息格式：`feat: S{阶段} {功能描述}`

## 许可证

MIT

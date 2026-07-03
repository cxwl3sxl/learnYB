# LearnYB 项目迭代规划

> 本文档记录 LearnYB 从规划到实现的完整迭代过程。实际实现状态见 README.md。

## 阶段总览

| 阶段 | 名称 | 状态 | 提交 |
|------|------|------|------|
| S1 | 音标表核心 | ✅ 完成 | `107eeff` |
| S2 | 听力辨音练习 | ✅ 完成 | `12f7394` |
| S3 | 跟读录音 | ✅ 完成 | `f0eeab5` |
| S4 | 学习路径 | ✅ 完成 | `732b846` |
| S5 | 打卡与激励 | ✅ 完成 | `732b846` |
| S6 | 单词查询 | ✅ 完成 | `732b846` |
| S7 | 后端用户系统 + PWA | ✅ 完成 | `3a88c10` |

## 各阶段规划 vs 实际实现

### S1: 音标表核心 (107eeff)

**规划：** 48个音标交互式卡片 + 对比练习 + 进度跟踪
**实现：** 完整达成
- 48个国际音标（20元音 + 28辅音）完整数据
- 点击卡片弹出详情 Modal（发音技巧、例词、自动播放）
- 鼠标悬停预览发音
- 双击标记已掌握（localStorage 持久化）
- 5组相似音标对比模块（长/短元音、清/浊辅音、易混淆音）
- 进度总览（已掌握数、百分比、待学习清单）

**文件：** `src/data/ipa.js`, `src/components/soundCard.js`, `src/main.js`

---

### S2: 听力辨音练习 (12f7394)

**规划：** 听音选音标、看音标选单词的交互练习
**实现：** 超出预期
- 3种题型：听音辨音标、听音选单词、看音标选单词
- 分类筛选：全部/单元音/双元音/爆破音/摩擦音/其他辅音
- 每题 10 秒倒计时，超时自动判错
- 答题即时反馈（正确绿色脉冲、错误红色抖动 + 揭示正确答案）
- 结果页面：百分比评分 + 逐题回顾（✅/❌ + 正确答案对比）
- "再练一次"按钮重置练习

**文件：** `src/components/practice.js`

---

### S3: 跟读录音 (f0eeab5)

**规划：** 录音对比、波形可视化、发音评分
**实现：** 完整达成
- MediaRecorder API 麦克风录音
- Canvas 实时波形可视化（录音时红色动态波形 + 录制指示器）
- 录音完成后静态频谱波形回放
- Web Speech API 语音识别对比用户发音 vs 标准单词
- 录音历史记录（localStorage 持久化，最近 50 条）
- 16个精选例词，流程：选词 → 听标准 → 录音 → 对比播放 → 识别反馈
- 支持回放用户录音和"标准 vs 我的"顺序对比播放

**文件：** `src/components/recording.js`

---

### S4: 学习路径 (732b846)

**规划：** 7阶段课程体系、技能树、每日任务
**实现：** 完整达成，超出预期
- 7阶段技能树可视化（常见辅音 → 摩擦音 → 流音半元音 → 单元音 → 双元音 → 综合实战 → 进阶应用）
- 每个节点显示：图标、阶段编号、标题、描述、音标列表、进度条
- 自动解锁机制（前一阶段掌握 ≥50% 解锁下一阶段）
- 已掌握音标绿色高亮，锁定节点灰色 + 锁图标
- 当前阶段蓝色高亮 + 脉冲阴影
- 阶段内专项练习（5题一轮，15秒倒计时）
- 完成后显示得分 + "再练一次"/"返回路径"
- 顶部统计面板（已掌握数 / 总音标数 / 已解锁阶段数）

**文件：** `src/components/learningPath.js`

---

### S5: 打卡与激励 (732b846)

**规划：** 连续打卡、XP系统、成就徽章
**实现：** 超出预期
- XP 等级系统：每完成练习获得 XP，100XP 升一级，带进度条
- 连续打卡天数（streak fire emoji），断签自动重置
- 12 枚成就徽章：
  - 连续：3天 🔥、7天 🔥🔥、30天 🔥🔥🔥
  - 掌握：10个 🏆、24元音 🏆、48全部 👑
  - 练习：50题 📝、200题 📝
  - 等级：Lv.5 ⭐、Lv.10 ⭐⭐
  - 特殊：第一次录音 🎤、第一次练习 🎯
- 成就解锁弹出动画通知（顶部 toast）
- 周日历打卡视图（周一到周日，已练习日期绿色标记）
- 学习统计面板：已掌握数、练习题数、正确率、近7天练习天数
- 全部 localStorage 持久化

**文件：** `src/components/gamification.js`

---

### S6: 单词查询 (732b846)

**规划：** 输入单词显示音标拆分、链接到音标卡片
**实现：** 完整达成
- 输入任意英文单词显示音标拆分
- 基于拼写规则的简易音标转换算法（处理元音字母组合、辅音组合、th 清浊判断等）
- 每个音标显示：符号、名称、发音技巧、播放按钮
- 点击音标符号可播放发音
- 搜索历史记录（最近 20 条，可清空）
- 历史标签点击快速查询

**文件：** `src/components/wordLookup.js`

---

### S7: 后端用户系统 + PWA 离线支持 (3a88c10)

**规划：** 多设备数据同步、离线使用
**实现：** 完整达成

**后端 (Node.js + Express + SQLite)：**
- 用户注册/登录/登出（bcrypt 密码哈希 + JWT 令牌，30天有效期）
- RESTful API：
  - `POST /api/auth/register` — 注册
  - `POST /api/auth/login` — 登录
  - `POST /api/auth/logout` — 登出
  - `GET /api/auth/me` — 当前用户信息
  - `POST /api/sync/push` — 推送本地数据到云端
  - `GET /api/sync/pull` — 从云端拉取数据
  - `GET /api/sync/status` — 同步状态
  - `GET /api/leaderboard/global` — 全局排行榜
  - `GET /api/health` — 健康检查
- 数据同步支持 6 类数据：mastered、attempts、gamification、learning_stages、recording_history、search_history
- 全局排行榜：按 mastered×10 + XP 计算总分，显示 Top 10 + 我的排名
- SQLite 持久化，支持多用户，CORS 跨域

**PWA 离线支持：**
- Service Worker (`public/sw.js`)：静态资源缓存优先，API 网络优先
- Web App Manifest (`public/manifest.json`)：可安装到桌面
- 自动注册 SW，离线时所有功能可用（数据存在 localStorage）
- 离线/在线无缝切换

**文件：** `server/`（7个文件），`public/sw.js`, `public/manifest.json`, `src/components/sync.js`, `src/utils/sync.js`

---

## 技术栈总览

| 层级 | 技术 |
|------|------|
| 前端框架 | 原生 JS (ES Modules) + Vite 6 |
| 样式 | 纯 CSS（变量系统、响应式、动画） |
| 语音 | Web Speech API（TTS 发音 + STT 识别） |
| 录音 | MediaRecorder API + AudioContext + Canvas |
| 存储（前端） | localStorage（6 类数据持久化） |
| 后端 | Node.js + Express 4 |
| 数据库 | better-sqlite3（单文件，零配置） |
| 认证 | bcryptjs + jsonwebtoken（JWT） |
| 离线 | Service Worker + Web App Manifest |

## 开发原则

- 每阶段可独立运行、独立提交
- 数据驱动 UI，减少硬编码
- 移动端优先响应式
- 纯前端零依赖也可运行（后端为可选增强）

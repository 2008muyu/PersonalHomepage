# 叙事型 3D 个人主页 执行计划

> 元信息：版本 v1 · 日期 2026-10-20 · 规模=完整版 · 状态=待批准
> 执行模式：AI 施工 + 人类裁决。开工前须清空「待拍板清单」。
> 工作区：`/Users/2008muyu/Desktop/CodeWorkspace/PersonalHomepage`（空仓库，本计划新立规范，无既有文档可引用）

## 0. 待拍板清单（开工前必须逐项裁决）

| # | 决策点 | 选项与默认建议 | 影响 |
|---|---|---|---|
| 1 | 仓库形态与访问地址 | **默认**：创建 `<username>.github.io` 仓库，地址 `https://<username>.github.io`，Vite `base: '/'`。备选：项目仓库（如 `homepage`），则 `base` 必须改为 `/<repo>/` | T0.4、T0.5、T3.4 |
| 2 | 个人信息与项目素材 | **默认**：先用占位内容推进开发(T1.2/T1.3)，真实内容最迟在 T1.7 目检前由 T1.1 提供 | T1.1、T1.5、T1.7 |
| 3 | 视觉基调 | **默认**：深蓝黑背景 + 青色辉光 + 粒子/网格，科技感。备选：暖色极简、赛博霓虹（洋红/紫） | T1.4、T2.3、T2.5 |
| 4 | 3D 素材策略 | **默认**：纯程序化几何与粒子（Shader/Points/Line），不引入外部 `.glb`。备选：后续接入用户提供模型 | T2.3–T2.5、T3.5 |
| 5 | 展示项目数量 | **默认**：3 个（同一模板可扩展，不影响架构）。素材需含截图 1 张/项目 | T1.1、T1.5 |
| 6 | 联系渠道 | **默认**：GitHub 主页 + 邮箱 `mailto:`。备选：不公开邮箱，只留社交链接 | T1.1、T1.5 |
| 7 | 站点语言 | **默认**：简体中文（姓名可附英文）。多语言切换范围外 | T1.2、T1.3 |
| 8 | 访问统计 | **默认**：不接入。备选：Plausible/GA4（需在 T3.4 加脚本并考虑隐私声明） | T3.4 |
| 9 | 自定义域名 | **默认**：不做（范围外）。需要则新增任务：DNS + CNAME + Pages 设置 | T0.4、T3.4 |
| 10 | 「酷炫」的验收人 | **默认**：M2 结束由用户目检 60 秒录屏，最多调整 2 轮。备选：提供参考网站清单作为验收基准 | T2.7、T3.7 |

> 用户可只回「按默认」。第 1、2 项必须在 T0.4 / T1.1 开工前明确。

## 1. 背景与目标

- **背景**：用户要在 GitHub Pages 上从零搭建个人主页，用于对外展示个人介绍、简历与作品集。形态已确定为独立静态网站（非 Profile README）；视觉上要求「酷炫」，采用 Three.js 3D 场景，内容组织采用叙事性滚动结构（scrollytelling）。当前目录为空仓库，无既有代码、无规范文档，本计划同时承担立项与技术基线职责。
- **目标**（完成后应达成，逐条可验证）：
  1. **线上可用**：`https://<username>.github.io` 返回 HTTP 200，首屏加载无 console error。
  2. **叙事完整**：桌面端从顶部滚动到底部，依次经历 5 幕（开场/关于/经历/作品/联系），每幕有对应 3D 状态，全程无黑屏、无相机跳变。
  3. **内容真实**：姓名、定位、≥3 段经历、≥3 个项目、联系方式均为最终文案，页面内无 `lorem`/占位符。
  4. **移动可用**：390×844 设备模拟下无横向滚动、无内容遮挡，动画 ≥30fps；`prefers-reduced-motion` 下内容静态完整可读。
  5. **性能基线**：Lighthouse（Desktop）Performance ≥ 80；主 JS 产物 gzip ≤ 600KB。

## 2. 范围

- **范围内**（新建文件/目录）：
  - `index.html`、`vite.config.js`、`package.json`
  - `src/main.js`、`src/experience/**`（Three.js 渲染与场景）、`src/sections/**`（DOM 与滚动交互）、`src/data/**`（内容数据）、`src/styles/**`
  - `public/assets/**`（截图、favicon 等）
  - `.github/workflows/deploy.yml`
  - `README.md`、`docs/plans/**`、`docs/evidence/**`、`docs/backlog.md`
- **范围外**（本轮明确不做）：
  - 博客/文章系统、CMS、评论、RSS
  - 后端、联系表单提交服务（联系区仅 mailto/外链）
  - 多语言切换、暗/亮主题切换
  - 自定义域名与 DNS 配置
  - 外部 3D 模型制作与 glb 资产管线（默认程序化几何）
  - 访问统计、A/B 测试
  - 单元测试/E2E 测试框架（纯展示站，改为人工回归清单，见 §7）
  - GitHub Profile README（本轮只做 Pages 网站）
  - 登录、后台、任何非公开内容
- **冻结区**：`public/assets/**` 内的原始素材只读——不得就地压缩/覆盖，派生文件另存（如 `*-opt.webp`）；`dist/**` 为构建产物，不入库、不手改。

## 3. 项目架构

### 3.1 模块图

```
index.html ──> src/main.js
                 ├── src/experience/Experience.js      渲染器/相机/RAF/resize/可见性暂停
                 │     ├── CameraRig.js                滚动全局进度 → 相机关键帧
                 │     ├── SceneStateMachine.js        5 幕场景状态 enter/exit/update
                 │     ├── scenes/HeroScene.js          开场（粒子/几何 + 入场时间线）
                 │     ├── scenes/AboutScene.js
                 │     ├── scenes/JourneyScene.js
                 │     ├── scenes/WorkScene.js
                 │     ├── scenes/ContactScene.js
                 │     └── utils/（缓动、性能档位、程序化几何）
                 ├── src/sections/                     每幕 DOM 注入与 ScrollTrigger 入场
                 ├── src/data/profile.js               个人信息、经历（唯一文案来源）
                 ├── src/data/projects.js              项目列表（唯一项目来源）
                 └── src/styles/main.css               变量/排版/布局/降级样式
```

### 3.2 数据流

滚动位置 → ScrollTrigger 计算全局进度 `p(0→1)` 与当前幕 → `CameraRig` 插值相机、`SceneStateMachine` 切换/更新场景 → RAF 渲染。DOM 侧由同一 ScrollTrigger 实例触发每幕内容入场动画。**数据流单向：data → DOM/场景，场景不反向读写 DOM 业务内容。**

### 3.3 关键设计决策

1. **单 canvas + 场景状态机**，而非每幕一个 canvas：避免多 WebGL context 与重复渲染开销；同一渲染器便于统一性能降级。
2. **一镜到底**：canvas `position: fixed` 始终在底层，DOM 各幕在其上滚动。用户滚动的是内容，变化的是 3D 空间，这是叙事感的核心。
3. **原生 JS（无框架）**：单页无状态管理需求；React Three Fiber 会引入 reconciler 与运行时体积，收益不匹配。
4. **程序化几何**：零外部模型依赖、体积可控；视觉定制通过 Shader、粒子分布、相机路径实现。
5. **内容与实现分离**：所有个人文案/项目数据在 `src/data/*.js`，改内容不碰场景代码。
6. **优雅降级三层**：正常 3D → 低性能档（降 DPR/粒子）→ 静态背景（reduced-motion 或极低端设备），内容始终可读。

## 4. 技术选型

| 选型点 | 决定 | 备选与否决理由 | 依赖/版本 |
|---|---|---|---|
| 构建工具 | Vite（`create-vite` vanilla 模板） | 备选 Webpack：配置成本高，无收益 | 安装时最新稳定版，锁定于 `package-lock.json`；Node ≥20（本机 22.22.3） |
| 3D 引擎 | Three.js（按需 import） | 备选 Babylon.js：生态偏重游戏，作品站示例少；否决 | 安装时最新稳定版并锁定 |
| 滚动动画 | GSAP 3.12+ 含 ScrollTrigger | 备选手写 IntersectionObserver + 插值：scrub/pin/时间轴回放手写成本高且易抖 | `gsap@^3.12` |
| UI 框架 | 无（原生 ES Modules） | 备选 React + R3F：为单页叙事引入额外运行时与依赖树；否决 | 无 |
| 样式 | 原生 CSS + CSS 变量 | 备选 Tailwind：小站点收益低且增加构建链；否决 | 无 |
| 部署 | GitHub Actions → GitHub Pages | 备选 Netlify/Vercel：用户明确要求 GitHub；否决 | `actions/checkout@v4`、`setup-node@v4`、`upload-pages-artifact@v3`、`deploy-pages@v4` |
| 资源格式 | 截图 WebP/PNG；favicon SVG+PNG | — | — |

## 5. 代码规范

本仓库为空，本节**新立**规范（无既有 lint 配置；本轮不引入 ESLint，靠约定 + review）：

- **模块职责**：`experience/**` 只做 3D 与渲染，禁止直接查询业务 DOM；`sections/**` 只做 DOM 与滚动触发，禁止直接操作 WebGL 对象；`data/**` 只导出纯数据，无副作用。
- **文案来源**：个人信息、经历、项目描述只能写在 `src/data/*.js`；HTML 模板中除 UI 标签（如「查看项目」「联系我」）外不得硬编码个人信息。
- **资源路径**：`public/` 下资源以 `/` 开头引用；源码内资源用相对路径。
- **渲染循环**：动画更新必须走统一 RAF；禁止在滚动回调中新建对象/gc 敏感操作（预分配 Vector3 等）。
- **红线**：`dist/` 不入库；不手改 `package-lock.json`；不覆盖 `public/assets/` 原始素材；不在 `main` 上强推。
- **提交信息**：`feat: / fix: / style: / perf: / docs: / chore: + 中文描述`，一次提交一个任务（与任务号对应，如 `feat(T1.3): 五幕语义骨架`）。

## 6. 任务分解与排期

### 6.1 里程碑

| 阶段 | 内容 | 完成标志（可验证） |
|---|---|---|
| M0 基础设施 | 脚手架、依赖、目录、GitHub 仓库、Actions 部署 | 线上 URL 200 且为占位页；push 自动部署成功 |
| M1 内容与静态叙事 | 数据层、五幕 DOM、基础样式、滚动触发、真实内容 | 无 3D 时五幕可完整阅读，内容非占位，目检通过 |
| M2 3D 叙事 | 渲染核心、场景状态机、相机路径、五幕场景、联动 | 桌面端 60 秒录屏全程连贯，用户目检确认「酷炫」 |
| M3 打磨 | 移动端降级、reduced-motion、加载、SEO、体积、链接 | 全端回归截图归档，指标达标 |
| M4 上线 | 全量回归、README、最终验收、收尾 | 用户确认可公开；tag v1.0.0；backlog 建立 |

### 6.2 任务表（WBS）

> 估算基准：**1× = 1 个 AI 会话可完成的提交量**（约 0.5–1 天工作量）。人任务按实际耗时。总 AI 工作量约 27×（不含返工）。状态列：☐ 未开始 / ◐ 进行中 / ☑ 完成。

| # | 任务 | 执行者 | 依赖 | 估算 | 验收口径 | 验证方式 | 状态 |
|---|---|---|---|---|---|---|---|
| T0.1 | 初始化 Vite 项目（`npm create vite@latest . -- --template vanilla`），清理示例计数器与样式 | [AI] | — | 1× 基准 | `npm run dev` 页面可访问且无 Vite 示例内容；`npm run build` exit 0 | 执行两条命令 + 浏览器目检 | ☐ |
| T0.2 | 安装并锁定 `three`、`gsap` | [AI] | T0.1 | 0.5× | `package.json` dependencies 含两者；`npm ls three gsap` 无 UNMET；lock 文件已生成 | `npm ls three gsap`；查看 lock 存在 | ☐ |
| T0.3 | 建立目录骨架与入口（`experience/ sections/ data/ styles/`、`public/assets/`、`docs/plans/`、`docs/evidence/`） | [AI] | T0.1 | 0.5× | 目录树与 §3.1 一致；`npm run build` exit 0 | `tree -L 3 src` + build | ☐ |
| T0.4 | [人] 创建 GitHub 公开仓库，Settings→Pages 的 Source 设为 **GitHub Actions**；填写仓库描述 | [人] | — | 0.5h | 仓库 URL 可访问；Pages 设置页显示 GitHub Actions 来源 | 仓库链接 + 设置截图 | ☐ |
| T0.5 | 编写 `.github/workflows/deploy.yml`（build→upload-pages-artifact→deploy-pages，`permissions: pages/id-token/contents`，concurrency 取消旧任务） | [AI] | T0.4 | 1× | 文件存在且 push 后 Actions 能解析出 build/deploy 两个 job | GitHub Actions 页面 | ☐ |
| T0.6 | 首次部署验证：push 至 main，确认线上占位页 | [AI] | T0.3、T0.4、T0.5 | 0.5× | Actions run 绿色；`curl -sI https://<user>.github.io` 返回 200；页面标题为占位标题 | `curl -I` + 浏览器目检 | ☐ |
| T0.7 | 编写 README（项目简介、技术栈、本地运行、部署说明） | [AI] | T0.3 | 0.5× | README 含 `npm install`/`npm run dev`/`npm run build` 三条命令及线上地址占位 | 目检 | ☐ |
| T1.1 | [人] 提供最终素材：姓名、一句话定位、自述、3 段经历（时间/角色/描述）、3 个项目（名称/一句话/技术栈/链接/截图）、联系渠道；截图放入 `public/assets/` | [人] | — | 1–2h | 素材清单逐项齐全；3 张项目截图可直接引用 | 对照清单勾选 | ☐ |
| T1.2 | 数据层：定义并填充 `profile.js`、`projects.js`（先占位，T1.1 后替换） | [AI] | T0.3 | 0.5× | 字段与 T1.1 清单一对应；import 无报错；build 通过 | build + 代码目检 | ☐ |
| T1.3 | `index.html` 五幕语义骨架：`header.hero`、`section.about`、`section.journey`、`section.work`、`section.contact`，含标题与内容容器 | [AI] | T0.3 | 1× | 五幕 DOM 存在；禁用 CSS 后按叙事顺序可读；无 div 汤（标题用 h1/h2） | DevTools Elements + 禁用样式目检 | ☐ |
| T1.4 | 基础样式系统：CSS 变量（配色/字号/间距）、深色底、容器宽度、每幕 `min-height`、基础排版 | [AI] | T1.3 | 1× | 1440×900 与 390×844 均无横向滚动；正文对比度 ≥4.5:1 | DevTools 设备模拟 + 截图 | ☐ |
| T1.5 | 数据渲染：经历时间线、项目卡片从 data 生成（截图、技术栈标签、外链、hover 态） | [AI] | T1.1、T1.2、T1.4 | 1.5× | 3 张项目卡片完整渲染；改动 `projects.js` 中名称后页面同步变化；外链可点击 | 改数据复测 + 点击目检 | ☐ |
| T1.6 | 滚动叙事基线：注册 ScrollTrigger，每幕进入/离开写入 `body.dataset.section`，CSS 入场动画 | [AI] | T0.2、T1.3 | 1× | 滚动到第 N 幕时 `dataset.section` 为对应值；Console 无 error | DevTools Elements/Console | ☐ |
| T1.7 | [AI→人验收] 静态版目检：五幕内容完整、顺序合理、无占位文本 | [AI→人验收] | T1.5、T1.6 | 0.5× + 15min | 5 张截图归档 `docs/evidence/static/`；用户确认内容与节奏 | 截图 + 人确认 | ☐ |
| T2.1 | Experience 核心：Renderer（antialias、DPR≤2）、相机、场景、RAF、resize、`visibilitychange` 暂停 | [AI] | T0.2、T0.3 | 1.5× | 全屏 canvas 渲染测试立方体；窗口缩放不变形；切后台后帧循环停止（log 验证） | DevTools 目检 + Console | ☐ |
| T2.2 | 场景状态机：注册 5 场景，支持 `go(name)` 与 `update(progress)` | [AI] | T2.1 | 1× | `go('about')` 后场景切换且无 WebGL 报错；Console 打印状态 | Console + 目检 | ☐ |
| T2.3 | HeroScene：程序化粒子/几何场 + 入场时间线（标题与相机） | [AI] | T2.1 | 2× | 首屏 3s 内完成入场；桌面 Chrome Performance 录制 10s ≥55fps | Performance 面板 + 目检 | ☐ |
| T2.4 | CameraRig：全局滚动进度映射相机关键帧（位置/朝向/lookAt），带缓动 | [AI] | T2.2、T1.6 | 1.5× | 0→1 全程相机连续移动，录屏逐段无跳变/穿模 | 60s 录屏逐段目检 | ☐ |
| T2.5 | 四幕场景：About/Journey/Work/Contact 各自 3D 元素与幕间转场 | [AI] | T2.4 | 3× | 每幕有可辨识 3D 状态；切换无黑屏、无闪烁 | 录屏目检 | ☐ |
| T2.6 | 3D 与 DOM 联动：Hero 文案随推进淡出、各幕内容在场景到位后入场 | [AI] | T1.5、T2.5 | 1× | 3D 转场与 DOM 入场同步，目检无明显错位 | 录屏目检 | ☐ |
| T2.7 | [AI→人验收] 桌面端 3D 叙事整体目检 | [AI→人验收] | T2.6 | 0.5× + 15min | 60s 录屏归档 `docs/evidence/m2/`；用户确认「酷炫且叙事连贯」或给出 1–2 条修改点 | 录屏 + 人确认 | ☐ |
| T3.1 | 移动端适配与性能降级：DPR≤1.5、粒子数降至 30%、必要时静态背景；`100dvh` 替代 `100vh` | [AI] | T2.7 | 1.5× | 390×844 模拟无横向滚动；Performance 录制 ≥30fps；地址栏收展不跳动 | 设备模拟 + 录屏 | ☐ |
| T3.2 | `prefers-reduced-motion` 降级：禁用 scrub 动画与大幅位移，场景静态，内容直接可见 | [AI] | T1.6、T2.4 | 1× | 模拟该设置后滚动不触发相机动画；五幕内容全部可读 | DevTools Rendering 模拟 | ☐ |
| T3.3 | 加载体验：HTML 内联 loading 覆盖层（不依赖 JS），场景就绪后淡出；图片 `loading="lazy"` | [AI] | T2.3 | 1× | 刷新先见 loading，2s 内淡出；CLS <0.1（Lighthouse） | Network 限速 + Lighthouse | ☐ |
| T3.4 | SEO/元信息：title、description、OG/Twitter、favicon、`lang="zh-CN"`、语义标签 | [AI] | T1.3 | 0.5× | head 字段齐全；View Source 可读；favicon 200 | View Source + Network | ☐ |
| T3.5 | 构建体积核查：three 按需导入、检查产物 | [AI] | T2.7 | 0.5× | 主 JS gzip ≤600KB；`npm run build` 输出记录归档 | build 输出 + gzip 统计 | ☐ |
| T3.6 | 资源与外链检查：无 404、无 `#` 占位、mailto 正确 | [AI] | T1.5、T3.4 | 0.5× | Network 面板 404 数 = 0；每个外链点击可达 | 点击 + Network | ☐ |
| T3.7 | [AI→人验收] 全端回归：1440/1280/768/390、reduced-motion | [AI→人验收] | T3.1–T3.6 | 0.5× + 15min | 截图归档 `docs/evidence/qa/`；用户确认 | 截图 + 人确认 | ☐ |
| T4.1 | 全量回归：build exit 0；线上 console error = 0；资源 404 = 0 | [AI] | T3.7 | 0.5× | 三项均达标 | build + DevTools | ☐ |
| T4.2 | README 更新：线上地址、截图、如何新增项目（改 `projects.js` 的步骤） | [AI] | T4.1 | 0.5× | README 含线上链接与「新增项目」三步说明 | 目检 | ☐ |
| T4.3 | [人] 最终验收：内容准确性、隐私（联系方式/经历）、公开意愿 | [人] | T4.2 | 0.5h | 用户明确回复「可上线」 | 消息确认 | ☐ |
| T4.4 | 收尾：清理临时文件/分支；打 tag `v1.0.0`；P2 事项登记 `docs/backlog.md` | [AI] | T4.3 | 0.5× | `git status` 干净；tag 存在；backlog 文件含 ≥1 条 P2 去向 | `git status` / `git tag` / 目检 | ☐ |

**依赖环检查**：以上依赖全部指向更早任务，无环。

**可并行项**：T0.4（人建仓）与 T0.1–T0.3 可并行；T1.1（人备料）与 M0 全程可并行；T2.1/T2.3 可在 T1.6 完成前先行。

## 7. 测试方案

纯展示型静态站，本轮**不引入自动化测试框架**（单测/E2E 范围外）。验证分五层：

| 层级 | 职责 | 判定口径 |
|---|---|---|
| 构建 | 每次提交前 | `npm run build` exit code = 0 |
| 运行时 | 桌面 + 移动模拟 | DevTools Console error 数 = 0；Network 404 数 = 0 |
| 性能 | 首屏与滚动 | Lighthouse Desktop Performance ≥80；移动设备模拟滚动 ≥30fps；主 JS gzip ≤600KB |
| 视觉目检 | 叙事、布局、转场 | 按 T2.7/T3.7 截图/录屏清单逐项勾选，用户签字 |
| 部署 | 每次 push main | Actions run 绿色；线上 URL 200 |

**新增测试清单**：无自动化用例（明确声明）。人工回归清单 = T3.7 的 4 个视口 + reduced-motion 模拟 + 外链点击，共 6 项。

**复跑既有套件清单**：仓库新建，无既有测试套件。

**可复制验证命令**：

```bash
# 本地开发与构建
npm ci
npm run dev            # 浏览器打开 http://localhost:5173
npm run build          # 期望 exit 0

# 本地预览产物
npx vite preview       # 浏览器打开 http://localhost:4173

# 线上部署验证（替换为实际地址）
curl -sI https://<username>.github.io | head -1   # 期望 HTTP/2 200

# 体积统计（构建后执行，取入口主包；文件名以构建输出为准）
gzip -c dist/assets/index-*.js | wc -c
```

**目检通道**：截图统一存 `docs/evidence/<阶段>/`；3D 叙事验收用 60s 录屏（QuickTime 或 DevTools 录屏），文件存同目录。判定以用户确认消息为准。

## 8. 验收标准

**P0（不满足即拒收）**
1. 线上 URL 返回 200，首屏 console error = 0。验证：`curl -I` + DevTools；证据存 `docs/evidence/qa/`。
2. 五幕叙事完整，滚动可从头到尾，每幕内容与 3D 状态对应。验证：录屏逐幕目检。
3. 页面内容全部为真实内容，无占位符/lorem。验证：全文搜索 `lorem|占位|TODO` 结果为 0。
4. 移动端 390×844 无横向滚动、无遮挡。验证：设备模拟截图。
5. 所有外链可点击、无 404、无 `href="#"` 占位。验证：Network 面板 + 逐一点击。

**P1（本轮必须）**
6. Lighthouse Desktop Performance ≥80。验证：Lighthouse 报告 JSON/截图归档。
7. 移动端设备模拟动画 ≥30fps。验证：Performance 录屏。
8. `prefers-reduced-motion` 下降级生效，内容完整可读。验证：DevTools Rendering 模拟 + 截图。
9. 主 JS gzip ≤600KB。验证：§7 体积命令输出。
10. 每阶段线上部署成功（M0 起至少 5 次绿色 Actions）。验证：Actions 历史。

**P2（可带病交付，须登记去向）**
11. 自定义域名与 HTTPS 绑定 → 登记 `docs/backlog.md`，用户后续决定。
12. OG 分享图设计 → 登记 backlog，可用默认渐变图占位。
13. iOS 真机回归（非模拟器）→ 登记 backlog，标记「未验证设备」。
14. 高端后处理（Bloom/景深）→ 登记 backlog，视性能余量再定。

**总验收 = 全部 P0 + P1 达成。** P2 条目必须在 `docs/backlog.md` 有记录（条目、影响、建议排期）。

## 9. 风险与回滚

| 风险 | 概率/影响 | 预防 | 触发时的应对 |
|---|---|---|---|
| 移动端 3D 掉帧（<30fps） | 高/高 | 粒子预算、DPR 上限、按设备分档；M2 结束即测移动端 | 降为静态渐变背景 + 保留 DOM 叙事；3D 仅桌面启用 |
| 首屏体积过大、白屏久 | 中/高 | three 按需导入、非首屏场景延迟初始化、内联 loading | 拆包 + 延迟加载；loading 延长但保证 2s 内可见内容 |
| 「酷炫」主观不达预期 | 中/高 | T2.7 设目检门，调整上限 2 轮 | 优先调配色/辉光/相机节奏，不加新依赖；仍不达预期则记录分歧并交付当前版本 |
| GitHub Pages 部署失败 | 低/中 | M0 先打通空白页；workflow 固定 major 版本 | 在 Actions 页面 Re-run 上一次成功 run；或 `git revert` 触发重新部署 |
| iOS Safari `100vh`/滚动回弹异常 | 高/中 | 使用 `100dvh`；慎用 scroll-snap | 移除 scroll-snap；布局改 `dvh`；实机验证 |
| 素材缺失或隐私顾虑 | 中/中 | T1.1 给出明确清单；联系方式只放愿意公开项 | 用通用描述 + 仅 GitHub 链接；邮箱暂不公开 |
| 并行改动冲突（多会话同仓） | 低/中 | 单人仓库 main 直推；若多会话，按任务号开分支合并 | `git revert <merge>`；冲突时以计划任务边界裁决 |
| 第三方依赖升级破坏 API | 低/低 | lock 文件入库；不随手升级 | `npm ci` 回滚 lock；或 revert 升级提交 |

**回滚方式（具体动作）**：每阶段完成打 tag（`m0`/`m1`/`m2`/`m3`），上线版本打 `v1.0.0`。线上回滚执行 `git revert <目标提交>` 后 push，Actions 自动重新部署；紧急情况下在 GitHub Actions 页面选择上一次成功的 deploy run 点击 Re-run。

## 10. 追踪与变更

- **进度口径**：本文件 §6.2 任务表「状态」列（☐/◐/☑）为唯一进度来源；每个里程碑完成后在文末追加「阶段记录」（日期、完成项、遗留项）。不做单独日报。
- **变更门槛**：
  - 必须回来改计划并重新确认：范围增减（如加博客）、验收阈值调整（性能/体积）、架构变更（引入框架、改多 canvas）、新增外部服务。
  - 可现场决定：动效参数、配色微调、等价实现替换、文案措辞、组件内部结构。
  - 执行中发现新决策点：先补进 §0 待拍板清单再动手，不先斩后奏。
- **交付物清单**：
  - 代码：GitHub 仓库 main 分支（含 `dist` 之外的源码与配置）
  - 计划：`docs/plans/2026-10-20-personal-homepage-execution-plan.md`（本文件）
  - 证据：`docs/evidence/static|m2|qa/`（截图、录屏、Lighthouse 报告）
  - 遗留：`docs/backlog.md`（P2 事项）
  - 线上：`https://<username>.github.io`

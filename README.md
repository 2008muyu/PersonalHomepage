# PersonalHomepage · 叙事型 3D 个人主页

用 Three.js + GSAP ScrollTrigger 打造的滚动叙事（scrollytelling）个人主页：一镜到底的 3D 粒子场景随五幕内容连续变形——星系 → 数据波场 → 时间隧道 → 晶体阵 → 星球。

**线上地址**：<https://2008muyu.github.io/PersonalHomepage/>

> 部署说明：`2008muyu.github.io` 根仓库已有存量站点，本站部署于项目仓库路径 `/PersonalHomepage/`（对应 Vite `base` 配置）。若未来迁移到根域，把 `vite.config.js` 的 `base` 改回 `/` 即可。

## 技术栈

- **Vite** — 构建与开发服务器（vanilla，无框架）
- **Three.js** — 单 canvas + 场景状态机，共享粒子场 GPU morph
- **GSAP + ScrollTrigger** — 滚动进度、幕切换、DOM 入场
- **原生 CSS** — CSS 变量设计系统（深蓝黑 + 青色辉光）

## 本地运行

```bash
npm install     # 安装依赖
npm run dev     # 开发服务器 http://localhost:5173
npm run build   # 构建（产物 dist/，不入库）
npm run preview # 本地预览构建产物
```

## 部署

push 到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）自动构建并发布到 GitHub Pages。

## 如何新增项目（三步）

1. 在 `src/data/projects.js` 数组追加一条：名称、一句话、描述、技术栈、链接、封面图路径
2. 封面图放入 `public/assets/`（建议 640×400）
3. 提交推送，Actions 自动部署

个人信息、经历、联系方式同理改 `src/data/profile.js` —— 数据与实现完全分离，不需要碰场景代码。

## 目录结构

```
index.html            五幕语义骨架 + SEO meta + 内联 loading
src/main.js           入口编排（3D / 滚动 / 入场时间线）
src/experience/       3D 层：Experience / CameraRig / SceneStateMachine / ParticlesField / scenes/*
src/sections/         DOM 层：数据渲染 / 滚动叙事控制器
src/data/             内容数据（profile.js / projects.js，唯一文案来源）
src/styles/main.css   设计系统
public/assets/        封面图与图标
docs/                 执行计划、验收证据、backlog
```

## 性能与降级

- 设备分档：桌面 12000 粒子 / 移动 4200 / 低端 2600，DPR 上限 2 / 1.5 / 1.25
- `prefers-reduced-motion`：跳过 3D 与滚动动画，内容静态完整可读
- WebGL 不可用：静态渐变背景 + 全部内容照常渲染

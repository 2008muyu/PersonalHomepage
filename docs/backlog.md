# Backlog（P2 遗留事项）

> v1.0.0（2026-10-20）验收时登记。P2 定义见计划 §8：可带病交付，但须记录条目、影响与建议排期。
> P0 / P1 已全部达成，详见 `docs/evidence/qa/` 与最终工作报告。

## 待办清单

| # | 条目 | 影响 | 建议排期 | 备注 |
|---|---|---|---|---|
| 1 | 自定义域名与 HTTPS 绑定 | 无（当前 `2008muyu.github.io/PersonalHomepage/` 已全站 HTTPS） | 用户有域名需求时 | 需 DNS CNAME + Pages 设置 + `vite.config.js` 的 `base` 改回 `/`，属计划 §0 决策点 9 范围外 |
| 2 | OG 分享图精细化 | 低（当前已有 1200×630 设计稿 `public/assets/og-cover.svg`，微信/Twitter 可正常抓取） | v1.1 | SVG 在部分抓取器不支持时可转 PNG；建议实机发一条推文/消息验证卡片效果 |
| 3 | iOS 真机回归（非模拟器） | 中（Safari 实机的 `100dvh`、滚动回弹、WebGL 上下文丢失策略未在真机验证） | 借到 iPhone 时 | 回归清单：五幕滚动、无横向滚动、3D 流畅、reduced-motion 可读；当前仅 IAB/Chromium 模拟验证 |
| 4 | 高端后处理（Bloom / 景深） | 无（当前用加法混合 + 雾已达成辉光观感） | v1.2 视性能余量 | 需 EffectComposer，会显著增加移动端 GPU 负担；先在桌面档位试验 |
| 5 | 真实项目截图替换 SVG 封面 | 低（当前三张为设计版 SVG 封面，无虚假信息） | 有真实截图后 | 替换 `public/assets/project-*.svg` 或改 `projects.js` 的 cover 路径即可，卡片自适应 |
| 6 | 个人信息与文案复核 | 中（姓名/定位/时间线/联系方式系根据公开 GitHub 资料自动整理，**未经本人逐句确认**） | 尽快 | 修改只需编辑 `src/data/profile.js`；涉及隐私项（邮箱已公开于 GitHub，如不愿公开可移除） |
| 7 | 项目卡懒加载图片的 WebP 化 | 极低（当前 SVG 矢量封面本身极小） | 与 #5 一并处理 | 若换真实位图截图，建议转 WebP 并保留 `loading="lazy"` |
| 8 | GitHub raw 新文件短暂 404 | 极低（CDN 缓存延迟，约几十秒后可用，重试即得） | 无需处理 | 仅影响证据截图外链评审，不影响站点本身 |
| 9 | Lighthouse 移动端实测 | 低（桌面端已实测归档；移动端仅做了 IAB 模拟性能档位验证） | 与 #3 一并 | `npx lighthouse <url> --preset=perf` 归档至 `docs/evidence/qa/` |

## 已知非问题（测试环境产物，记录备查）

- **IAB webview rAF 冻结**：内嵌浏览器页面未被合成时 `requestAnimationFrame` 完全暂停（`visibilityState` 仍谎报 `visible`），导致滚动叙事/加载淡出看似"卡死"。唤醒方式：截图一次。真实浏览器无此现象（线上 Chrome 回归全绿）。
- **远程视觉评审服务间歇 400**：`analyze_image` 对部分 JPEG 偶发"图片输入格式/解析错误"，重试或换文件可恢复；评审结论已用 DOM 几何测量交叉验证。

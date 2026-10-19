// 个人信息 —— 全站文案唯一来源（改这里即可，不碰场景与样式代码）
export const profile = {
  name: 'muyu',
  handle: '@2008muyu',
  tagline: 'AI 应用工程师 · 独立开发者 —— 把想法做成能跑的工具',
  metaLine: 'Three.js / MCP / TypeScript · 中国',

  aboutTitle: '你好，我是 muyu',
  lead: '我在 AI 应用与开发者工具的交叉地带工作：喜欢把复杂的系统（舆情数据、树莓派指标、大模型调用）做成普通人能用的产品。相信好的工具应该自己会说话，于是大部分业余时间都花在造工具、写指南、折腾自托管基础设施上。',

  // 经历时间线（时间倒序）
  timeline: [
    {
      time: '2026',
      role: '独立开发 · 基础设施',
      description:
        '为家里的树莓派集群打造可观测性工具链：pi-stats-insight 做指标洞察、pi-notify 做轻量告警，全部 TypeScript 编写，持续迭代中。',
    },
    {
      time: '2025',
      role: 'AI 应用工程',
      description:
        '开发 TrendRadar——聚合 35 个平台热点的 AI 舆情分析工具，基于 MCP 提供趋势追踪、情感分析等 13 种自然语言分析能力；同期参与 AgentGuide 的整理，系统梳理 LangGraph 与 RAG 实战路线。',
    },
    {
      time: '2013 →',
      role: '长期主义的开源爱好者',
      description:
        '注册 GitHub 账号，从此把 side project 当成习惯：游戏开发工具、数据可视化、自动化脚本，仓库记录了一路的兴趣迁移。',
    },
  ],

  facts: [
    { k: 'GitHub', v: '2013 年注册，公开仓库持续更新' },
    { k: '主方向', v: 'AI Agent · MCP 工具链 · 数据可视化' },
    { k: '副方向', v: '树莓派自托管 · 游戏开发工具' },
    { k: '常用技术', v: 'TypeScript / Python / Three.js / Docker' },
  ],

  contactLead: '如果你在做有趣的东西，或者想聊聊 AI 应用、自托管、创意编程——欢迎找我。通常会在 GitHub 上最快回复。',
  contactLinks: [
    { label: 'GitHub 主页', href: 'https://github.com/2008muyu', icon: 'github' },
    { label: '发送邮件', href: 'mailto:506634967@qq.com', icon: 'mail' },
  ],
  footer: '© 2026 muyu · 用 Three.js + GSAP 手工打造 · 源码托管于 GitHub',
}

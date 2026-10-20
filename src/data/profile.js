// 个人信息 —— 全站文案唯一来源（改这里即可，不碰场景与样式代码）
export const profile = {
  name: 'muyu',
  handle: '@2008muyu',
  greeting: '👋 你好，我是',
  tagline: '喜欢把想法做成能跑的工具：一会儿写 AI 应用，一会儿折腾树莓派，偶尔玩玩创意编程。',
  metaLine: '坐标中国 · 常写 TypeScript 和 Python',

  aboutTitle: '关于我',
  lead: '我在 AI 应用和开发者工具的交叉地带待着，最大的乐趣是把复杂的系统——舆情数据、树莓派指标、大模型调用——做成普通人也能用的东西。相信好工具自己会说话，所以业余时间基本都花在造工具、写指南、折腾自托管上。',

  // 经历时间线（时间倒序，成长小故事口吻）
  timeline: [
    {
      time: '2026',
      role: '给家里的开发板做「体检」',
      description:
        '今年在给树莓派集群打磨一套可观测性工具链：pi-stats-insight 负责看指标，pi-notify 负责发告警，都用 TypeScript 写的，还在慢慢迭代。',
    },
    {
      time: '2025',
      role: '把热点数据玩出花',
      description:
        '做了 TrendRadar——把 35 个平台的热点聚到一起，接上大模型做趋势追踪和情感分析；同年整理 AgentGuide，把 LangGraph 和 RAG 的实战路线系统梳理了一遍。',
    },
    {
      time: '2013 →',
      role: '一个长期主义者',
      description:
        '注册了 GitHub 账号，从此把 side project 当成习惯：游戏开发工具、数据可视化、自动化脚本……仓库列表记录了我一路的兴趣迁移。',
    },
  ],

  facts: [
    { k: 'GitHub 龄', v: '2013 年注册，公开仓库持续更新' },
    { k: '主线', v: 'AI Agent · MCP 工具链 · 数据可视化' },
    { k: '支线', v: '树莓派自托管 · 游戏开发工具' },
    { k: '顺手会用', v: 'TypeScript / Python / Three.js / Docker' },
  ],

  contactLead: '如果你在做有趣的东西，或者想聊聊 AI 应用、自托管、创意编程——欢迎找我，GitHub 上回复最快。',
  contactLinks: [
    { label: 'GitHub 主页', href: 'https://github.com/2008muyu', icon: 'github' },
    { label: '给我发邮件', href: 'mailto:506634967@qq.com', icon: 'mail' },
  ],
  footer: '© 2026 muyu · 这个站是我自己写的，源码在 GitHub',
}

// 项目列表 —— 作品集唯一数据来源
// 新增公开项目三步：① 在此数组追加一条 ② 截图放入 public/assets/ ③ 重新部署
//
// 私有项目（代码/仓库不可公开）同样进此数组，两档写法：
//  完整档：内容可写时 —— 照常填 oneLiner/description/stack，但 link 留 null，
//          卡片自动显示「🔒 私有项目 · 可面谈详述」徽标（不渲染外链）
//  极简档：内容敏感时 —— 只填 name/title/oneLiner（领域+角色一句话，如
//          「某零售企业数据平台 · 独立开发」），省略 description/stack 亦可
// 封面统一用 public/assets/project-private.svg（抽象封存风，勿放真实截图）
// 另有连提都不便提的项目：在下方 undisclosed.count 填真实数量，汇总行会自动出现
export const projects = [
  {
    name: 'TrendRadar',
    title: 'TrendRadar 趋势雷达',
    year: '2025',
    oneLiner: '多平台热点聚合 + 基于 MCP 的 AI 舆情分析工具',
    description:
      '聚合抖音、知乎、B 站、财联社等 35 个平台的热点数据，支持智能筛选、多渠道推送（飞书 / 钉钉 / Telegram / 邮件），内置 13 种自然语言分析工具：趋势追踪、情感分析、相似检索。30 秒网页部署，无需编程。',
    stack: ['Python', 'MCP', 'Docker', 'LLM'],
    link: 'https://github.com/2008muyu/TrendRadar',
    cover: '/assets/project-trendradar.svg',
    accent: '#22d3ee',
  },
  {
    name: 'pi-stats-insight',
    title: '树莓派可观测性工具链',
    year: '2026',
    oneLiner: 'pi-stats-insight + pi-notify：家用小机群的监控与告警',
    description:
      '为树莓派自托管集群打造的监控组合：pi-stats-insight 负责指标采集与可视化洞察，pi-notify 负责轻量通知推送。用 TypeScript 编写，部署即用，让家里的每一块开发板都有「体检报告」。',
    stack: ['TypeScript', 'Raspberry Pi', 'Self-hosted'],
    link: 'https://github.com/2008muyu/pi-stats-insight',
    cover: '/assets/project-pistats.svg',
    accent: '#818cf8',
  },
  {
    name: 'AgentGuide',
    title: 'AgentGuide 开发指南',
    year: '2025',
    oneLiner: 'AI Agent 开发指南：LangGraph 实战 · 高级 RAG · 大模型面试',
    description:
      '系统性整理的 AI Agent 学习路线：从 LangGraph 实战、高级 RAG 到强化学习与数据合成，覆盖转行大模型与算法面试题库。线上可直接阅读的中文知识库。',
    stack: ['LangGraph', 'RAG', 'Docs'],
    link: 'https://github.com/2008muyu/AgentGuide',
    cover: '/assets/project-agentguide.svg',
    accent: '#34d399',
  },
]

// 因保密连列都不便列的项目数量（0 = 不显示汇总行；填真实数字后自动出现）
export const undisclosed = { count: 0 }

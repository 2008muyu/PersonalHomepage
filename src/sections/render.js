// DOM 渲染：把 src/data 的纯数据注入五幕骨架。
// 职责边界：只操作 DOM，不触碰 WebGL（方案 §5 模块职责）
import { profile } from '../data/profile.js'
import { projects } from '../data/projects.js'

// public/ 资源以 '/' 开头时，需补上部署 base（项目仓库路径）避免 404
const withBase = (path) =>
  path.startsWith('/') ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path

const SVG_ICONS = {
  github:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
}

function el(tag, className, html) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (html != null) node.innerHTML = html
  return node
}

function esc(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function renderSections() {
  // Hero
  setText('[data-profile="tagline"]', profile.tagline)
  setText('[data-profile="metaLine"]', profile.metaLine)
  setText('[data-profile="aboutTitle"]', profile.aboutTitle)
  setText('[data-profile="lead"]', profile.lead)

  // About facts
  const facts = document.querySelector('[data-profile="facts"]')
  facts.innerHTML = profile.facts
    .map((f) => `<li class="fact"><span class="k mono">${esc(f.k)}</span><span class="v">${esc(f.v)}</span></li>`)
    .join('')

  // Journey timeline
  const timeline = document.getElementById('timeline')
  timeline.innerHTML = profile.timeline
    .map(
      (item) => `
      <li class="reveal">
        <p class="time mono">${esc(item.time)}</p>
        <h3 class="role">${esc(item.role)}</h3>
        <p class="desc">${esc(item.description)}</p>
      </li>`,
    )
    .join('')

  // Work projects
  const wrap = document.getElementById('projects')
  wrap.innerHTML = projects
    .map(
      (p) => `
      <article class="project-card reveal">
        <img class="project-cover" src="${withBase(p.cover)}" alt="${esc(p.title)} 封面" loading="lazy" decoding="async" width="640" height="400" />
        <div class="project-body">
          <p class="project-year mono">${esc(p.year)}</p>
          <h3 class="project-name">${esc(p.name)}</h3>
          <p class="project-one">${esc(p.oneLiner)}</p>
          <p class="project-desc">${esc(p.description)}</p>
          <div class="project-stack">${p.stack.map((s) => `<span class="tag mono">${esc(s)}</span>`).join('')}</div>
          <a class="project-link" href="${p.link}" target="_blank" rel="noopener noreferrer">查看项目 <span class="arrow">→</span></a>
        </div>
      </article>`,
    )
    .join('')

  // Contact
  setText('[data-profile="contactLead"]', profile.contactLead)
  const links = document.querySelector('[data-profile="contactLinks"]')
  links.innerHTML = profile.contactLinks
    .map(
      (l) =>
        `<a class="contact-link" href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${SVG_ICONS[l.icon] || ''}<span>${esc(l.label)}</span></a>`,
    )
    .join('')
  setText('[data-profile="footer"]', profile.footer)
}

function setText(selector, text) {
  const node = document.querySelector(selector)
  if (node) node.textContent = text
}

// 为每个 section 内的离散内容块加 reveal 类（Hero 已由入场时间线接管，跳过）
export function markRevealTargets() {
  document.querySelectorAll('.about .about-grid > *').forEach((n) => n.classList.add('reveal'))
  document.querySelectorAll('.section-index, .section-title').forEach((n) => n.classList.add('reveal'))
  document.querySelectorAll('.contact-lead, .contact-links').forEach((n) => n.classList.add('reveal'))
}

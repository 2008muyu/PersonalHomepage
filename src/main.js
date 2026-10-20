// 入口：数据渲染 → 3D/滚动叙事编排 → loading 淡出 → Hero 入场时间线
import './styles/main.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { renderSections, markRevealTargets } from './sections/render.js'
import { createScrollNarrative } from './sections/scroll.js'
import { Experience } from './experience/Experience.js'
import { webglSupported } from './experience/utils/perf.js'

gsap.registerPlugin(ScrollTrigger)

// 全局错误捕获（测试与线上排障用）
window.__pageErrors = []
window.addEventListener('error', (e) => {
  window.__pageErrors.push(String(e.message ?? e.error ?? e.type))
})
window.addEventListener('unhandledrejection', (e) => {
  window.__pageErrors.push('rejection: ' + String(e.reason))
})

// ?reduced=1 测试钩子：强制走 prefers-reduced-motion 降级路径（QA 用）
const reducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  new URLSearchParams(location.search).has('reduced')
const can3d = !reducedMotion && webglSupported()

// 1. 内容先行：无论 3D 是否可用，五幕内容必须完整可读
renderSections()
markRevealTargets()

// 2. 3D 体验（三层降级：正常 → 低配 → 静态背景）
let experience = null
if (can3d) {
  try {
    experience = new Experience({
      canvas: document.getElementById('gl'),
      onFirstFrame: () => {
        finishLoading()
        heroEntrance()
      },
    })
  } catch (err) {
    window.__pageErrors.push('Experience init failed: ' + String(err))
    experience = null
  }
}
if (!experience) {
  document.body.classList.add('no-3d')
  if (reducedMotion) document.body.classList.add('reduced-motion')
}

// 3. 滚动叙事
const narrative = createScrollNarrative({
  reducedMotion,
  onProgress: (p) => experience?.setProgress(p),
  onSection: (name) => experience?.setSection(name),
  onSectionProgress: (name, sp) => experience?.setSectionProgress(name, sp),
})

// 测试/排障钩子
window.__homepage = { experience, narrative }

// 4. loading 覆盖层淡出（HTML 内联可见，JS 就绪后撤除；2.5s 兜底）
let loadingDone = false
function finishLoading() {
  if (loadingDone) return
  loadingDone = true
  document.getElementById('loading').classList.add('done')
}
if (!experience) finishLoading()
setTimeout(finishLoading, 2500)

// 5. Hero 入场时间线：文案逐级浮现 + 相机推近
function heroEntrance() {
  if (reducedMotion) return
  if (experience) {
    experience.rig.setIntro(1)
    gsap.to(experience.rig, { intro: 0, duration: 2.4, ease: 'power3.out' })
  }
  gsap.fromTo(
    '.hero-inner > *',
    { autoAlpha: 0, y: 40 },
    { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.14, ease: 'power3.out', delay: 0.25 },
  )
}

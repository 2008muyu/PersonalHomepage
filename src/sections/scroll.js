// 滚动叙事控制器：唯一的全局进度来源。
// 滚动 → ScrollTrigger 计算 p(0→1)、当前幕、幕内进度 → 通知 Experience + DOM 入场 + body.dataset.section
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SECTION_NAMES = ['hero', 'about', 'journey', 'work', 'contact']

export function createScrollNarrative({ reducedMotion, onProgress, onSection, onSectionProgress }) {
  // 顶部进度条
  const bar = document.createElement('div')
  bar.id = 'scrollbar'
  bar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(bar)

  let activeSection = null
  const setSection = (name) => {
    if (name === activeSection) return
    activeSection = name
    document.body.dataset.section = name
    onSection?.(name)
  }

  if (reducedMotion) {
    // 降级：无 scrub 动画，内容直接可见；仅维护 dataset.section
    document.querySelectorAll('.reveal').forEach((n) => {
      n.style.opacity = '1'
      n.style.transform = 'none'
    })
    SECTION_NAMES.forEach((name) => {
      ScrollTrigger.create({
        trigger: `#${name}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setSection(name),
      })
    })
    return { kill: () => ScrollTrigger.getAll().forEach((t) => t.kill()) }
  }

  // 全局进度：整页滚动 → p(0→1)（相机路径用）
  ScrollTrigger.create({
    trigger: '#story',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      onProgress?.(self.progress)
      bar.style.transform = `scaleX(${self.progress})`
    },
  })

  // 每幕：幕内进度（粒子变形）+ 当前幕判定 + DOM 入场
  SECTION_NAMES.forEach((name) => {
    ScrollTrigger.create({
      trigger: `#${name}`,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => onSectionProgress?.(name, self.progress),
    })

    ScrollTrigger.create({
      trigger: `#${name}`,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => self.isActive && setSection(name),
    })

    const targets = document.querySelectorAll(`#${name} .reveal`)
    if (targets.length) {
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: `#${name}`,
            start: 'top 68%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    }
  })

  return { kill: () => ScrollTrigger.getAll().forEach((t) => t.kill()) }
}

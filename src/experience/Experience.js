// Experience：单 canvas 渲染核心 —— 渲染器 / 相机 / RAF / resize / 可见性暂停
// 模块职责：只做 3D 与渲染，禁止查询业务 DOM（方案 §5）
import * as THREE from 'three'
import { CameraRig } from './CameraRig.js'
import { SceneStateMachine } from './SceneStateMachine.js'
import { ParticlesField } from './ParticlesField.js'
import { HeroScene } from './scenes/HeroScene.js'
import { AboutScene } from './scenes/AboutScene.js'
import { JourneyScene } from './scenes/JourneyScene.js'
import { WorkScene } from './scenes/WorkScene.js'
import { ContactScene } from './scenes/ContactScene.js'
import { detectTier } from './utils/perf.js'

const SECTION_NAMES = ['hero', 'about', 'journey', 'work', 'contact']

export class Experience {
  constructor({ canvas, onFirstFrame }) {
    this.tier = detectTier()
    this.canvas = canvas
    this.onFirstFrame = onFirstFrame
    this.running = true
    this.firstFrameEmitted = false

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.tier.maxDpr))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x050810, 1)

    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x050810, 0.062)

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60)
    this.camera.position.set(0, 1.7, 16.6)

    this.rig = new CameraRig(this.camera)
    this.particles = new ParticlesField(this.tier.particleCount)
    this.scene.add(this.particles.points)

    this.sm = new SceneStateMachine(this.scene)
    this.sm.register('hero', new HeroScene(this.tier.accentDetail))
    this.sm.register('about', new AboutScene())
    this.sm.register('journey', new JourneyScene())
    this.sm.register('work', new WorkScene(this.tier.accentDetail))
    this.sm.register('contact', new ContactScene())
    this.sm.go('hero')

    // 粒子交互状态（预分配，渲染循环内零分配）
    this._progress = 0
    this._prevProgress = 0
    this._ndcX = 0
    this._ndcY = 0
    this._pointerSeen = false
    this._pointerAt = -1e3 // 上次指针移动时刻（elapsed 域）
    this._rippleSlot = 0
    this._mouseTarget = new THREE.Vector3(0, 0, 999)
    this._rayPoint = new THREE.Vector3()
    this._rayDir = new THREE.Vector3()

    this._onPointerMove = (e) => {
      this._ndcX = (e.clientX / window.innerWidth) * 2 - 1
      this._ndcY = -(e.clientY / window.innerHeight) * 2 + 1
      this._pointerSeen = true
      this._pointerAt = this.elapsed
      this._updateMouseTarget(e.clientX, e.clientY)
    }
    this._onPointerDown = (e) => {
      this._updateMouseTarget(e.clientX, e.clientY)
      this.particles.spawnRipple(this._mouseTarget, this.elapsed)
    }
    this._onPointerLeave = () => {
      this._pointerSeen = false
    }
    window.addEventListener('pointermove', this._onPointerMove, { passive: true })
    window.addEventListener('pointerdown', this._onPointerDown, { passive: true })
    document.documentElement.addEventListener('mouseleave', this._onPointerLeave)

    this.clock = new THREE.Clock()
    this.elapsed = 0

    this._onResize = () => {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.tier.maxDpr))
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', this._onResize)

    this._onVisibility = () => {
      this.running = !document.hidden
      if (this.running) {
        this.clock.getDelta() // 丢弃后台期间累积的时间
        this.loop = this.loop.bind(this)
        requestAnimationFrame(this.loop)
      }
    }
    document.addEventListener('visibilitychange', this._onVisibility)

    this.loop = this.loop.bind(this)
    requestAnimationFrame(this.loop)
  }

  /** 全局滚动进度（相机关键帧 + 湍流强度来源） */
  setProgress(p) {
    this._progress = Math.max(0, Math.min(1, p))
    this.rig.setProgress(p)
  }

  /** 当前幕切换（场景状态机） */
  setSection(name) {
    this.sm.go(name)
  }

  /** 幕内进度：驱动粒子向下一形态变形（后半程过渡，前半程驻留） */
  setSectionProgress(name, sp) {
    const idx = SECTION_NAMES.indexOf(name)
    if (idx < 0) return
    const t = clamp01((sp - 0.55) / 0.42)
    this.particles.setMix(idx, Math.min(idx + 1, SECTION_NAMES.length - 1), t)
  }

  loop() {
    if (!this.running) return
    requestAnimationFrame(this.loop)

    const dt = Math.min(this.clock.getDelta(), 0.05)
    this.elapsed += dt

    this.rig.update(dt)
    this.particles.update(dt, this.elapsed)
    this.sm.update(dt, this.elapsed)
    this._updateInteraction(dt)
    this.renderer.render(this.scene, this.camera)

    if (!this.firstFrameEmitted) {
      this.firstFrameEmitted = true
      this.onFirstFrame?.()
    }
  }

  /** 指针屏幕坐标 → 粒子云深度处的世界坐标（随相机移动，始终指向视觉主体） */
  _updateMouseTarget(clientX, clientY) {
    this._rayPoint
      .set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1, 0.5)
      .unproject(this.camera)
    this._rayDir.copy(this._rayPoint).sub(this.camera.position).normalize()
    this._mouseTarget.copy(this.camera.position).addScaledVector(this._rayDir, 10.5)
  }

  /** 交互强度缓动：引力场跟随/衰减、湍流快起慢落（强度全部封顶） */
  _updateInteraction(dt) {
    const u = this.particles.material.uniforms
    const kTarget = this._pointerSeen && this.elapsed - this._pointerAt < 1.4 ? 1 : 0
    u.uMouseK.value += (kTarget - u.uMouseK.value) * (1 - Math.exp(-7 * dt))
    u.uMouse.value.lerp(this._mouseTarget, 1 - Math.exp(-9 * dt))
    const vel = Math.abs(this._progress - this._prevProgress) / Math.max(dt, 1e-4)
    this._prevProgress = this._progress
    const turbTarget = Math.min(1, vel * 1.4)
    const ease = turbTarget > u.uTurb.value ? 14 : 2.4 // 快起慢落
    u.uTurb.value += (turbTarget - u.uTurb.value) * (1 - Math.exp(-ease * dt))
  }

  dispose() {
    this.running = false
    window.removeEventListener('resize', this._onResize)
    window.removeEventListener('pointermove', this._onPointerMove)
    window.removeEventListener('pointerdown', this._onPointerDown)
    document.documentElement.removeEventListener('mouseleave', this._onPointerLeave)
    document.removeEventListener('visibilitychange', this._onVisibility)
    this.rig.dispose()
    this.particles.dispose()
    this.renderer.dispose()
  }
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

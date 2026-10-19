// 相机轨道：全局滚动进度 p(0→1) → 关键帧插值 + 阻尼跟随 + 鼠标视差 + 入场推近
import * as THREE from 'three'

const KEYS = [
  { p: 0.0, pos: [0, 0.5, 9.6], look: [0, 0.15, 0] }, // hero：星系正面
  { p: 0.25, pos: [4.2, 1.8, 8.0], look: [-0.8, -0.2, 0] }, // about：掠过波场
  { p: 0.5, pos: [0, 0.3, 7.4], look: [0, 0, -3] }, // journey：进入隧道深处
  { p: 0.75, pos: [-4.0, 1.5, 8.6], look: [0.5, 0, 0] }, // work：环视晶体阵
  { p: 1.0, pos: [0, 0.7, 9.2], look: [0, 0.1, 0] }, // contact：面向星球
]

export class CameraRig {
  constructor(camera) {
    this.camera = camera
    this.progress = 0
    this.intro = 0 // 入场推近偏移（1→0）
    this.damping = 4.2

    this.targetPos = new THREE.Vector3(...KEYS[0].pos)
    this.targetLook = new THREE.Vector3(...KEYS[0].look)
    this.currentLook = this.targetLook.clone()
    this.parallax = new THREE.Vector2()
    this._pos = new THREE.Vector3()
    this._look = new THREE.Vector3()

    this._onPointer = (e) => {
      this.parallax.set(
        (e.clientX / window.innerWidth - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      )
    }
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', this._onPointer, { passive: true })
    }
  }

  setProgress(p) {
    this.progress = Math.max(0, Math.min(1, p))
  }

  setIntro(v) {
    this.intro = v
  }

  update(dt) {
    sampleKeys(this.progress, this._pos, this._look)
    // 入场：从更远处推近
    this._pos.z += this.intro * 7
    this._pos.y += this.intro * 1.2
    // 鼠标视差（弱）
    this._pos.x += this.parallax.x * 0.5
    this._pos.y -= this.parallax.y * 0.3
    this._look.x += this.parallax.x * 0.25

    const alpha = 1 - Math.exp(-this.damping * dt)
    this.camera.position.lerp(this._pos, alpha)
    this.currentLook.lerp(this._look, alpha)
    this.camera.lookAt(this.currentLook)
  }

  dispose() {
    window.removeEventListener('pointermove', this._onPointer)
  }
}

function sampleKeys(p, outPos, outLook) {
  let a = KEYS[0]
  let b = KEYS[KEYS.length - 1]
  for (let k = 0; k < KEYS.length - 1; k++) {
    if (p >= KEYS[k].p && p <= KEYS[k + 1].p) {
      a = KEYS[k]
      b = KEYS[k + 1]
      break
    }
  }
  const span = b.p - a.p || 1
  const t = smoothstep((p - a.p) / span)
  outPos.set(
    a.pos[0] + (b.pos[0] - a.pos[0]) * t,
    a.pos[1] + (b.pos[1] - a.pos[1]) * t,
    a.pos[2] + (b.pos[2] - a.pos[2]) * t,
  )
  outLook.set(
    a.look[0] + (b.look[0] - a.look[0]) * t,
    a.look[1] + (b.look[1] - a.look[1]) * t,
    a.look[2] + (b.look[2] - a.look[2]) * t,
  )
}

function smoothstep(t) {
  t = Math.max(0, Math.min(1, t))
  return t * t * (3 - 2 * t)
}

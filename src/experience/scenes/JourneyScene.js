// 幕2 · 历程：粒子隧道 + 沿途等距光圈，营造穿越时间走廊的推进感
import * as THREE from 'three'
import { BaseScene, wireMaterial } from './BaseScene.js'

export class JourneyScene extends BaseScene {
  constructor() {
    super()
    this.ringMat = this.track(wireMaterial(0x22d3ee, 0.14))
    this.rings = []
    for (let i = 0; i < 9; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.015, 6, 64), this.ringMat)
      ring.position.z = -11 + i * 2.8
      this.group.add(ring)
      this.rings.push(ring)
    }
  }

  update(dt, elapsed) {
    for (const ring of this.rings) {
      ring.rotation.z += dt * 0.1
      const phase = (elapsed * 0.55 + ring.position.z * 0.35) % (Math.PI * 2)
      ring.scale.setScalar(1 + Math.sin(phase) * 0.05)
    }
  }
}

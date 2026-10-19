// 幕1 · 关于：粒子波场上方悬浮两道数据环
import * as THREE from 'three'
import { BaseScene, wireMaterial } from './BaseScene.js'

export class AboutScene extends BaseScene {
  constructor() {
    super()
    this.ringMatA = this.track(wireMaterial(0x22d3ee, 0.22))
    this.ringMatB = this.track(wireMaterial(0x818cf8, 0.16))

    this.ringA = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.02, 8, 96), this.ringMatA)
    this.ringA.rotation.x = Math.PI / 2.25
    this.ringA.position.set(-1.2, 1.4, -1)

    this.ringB = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.02, 8, 72), this.ringMatB)
    this.ringB.rotation.x = Math.PI / 1.9
    this.ringB.rotation.y = 0.4
    this.ringB.position.set(1.6, 2.1, -2)

    this.group.add(this.ringA, this.ringB)
  }

  update(dt, elapsed) {
    this.ringA.rotation.z += dt * 0.16
    this.ringB.rotation.z -= dt * 0.22
    this.ringA.position.y = 1.4 + Math.sin(elapsed * 0.6) * 0.12
    this.ringB.position.y = 2.1 + Math.cos(elapsed * 0.5) * 0.1
  }
}

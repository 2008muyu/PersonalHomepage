// 幕0 · 开场：星系粒子场 + 双层晶核，缓慢自转悬浮
import * as THREE from 'three'
import { BaseScene, wireMaterial } from './BaseScene.js'

export class HeroScene extends BaseScene {
  constructor(detail = 2) {
    super()
    this.coreMat = this.track(wireMaterial(0x22d3ee, 0.5))
    this.shellMat = this.track(wireMaterial(0x818cf8, 0.28))

    this.core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, Math.min(detail, 1)), this.coreMat)
    this.shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 1), this.shellMat)
    this.group.add(this.core, this.shell)
  }

  update(dt, elapsed) {
    this.core.rotation.y += dt * 0.22
    this.core.rotation.x += dt * 0.07
    this.shell.rotation.y -= dt * 0.1
    this.shell.rotation.z += dt * 0.05
    const breathe = 1 + Math.sin(elapsed * 0.8) * 0.035
    this.core.scale.setScalar(breathe)
  }
}

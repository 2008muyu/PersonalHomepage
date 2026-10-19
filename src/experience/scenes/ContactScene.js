// 幕4 · 联系：星球粒子外壳 + 脉动线框球 + 上升光柱（灯塔意象）
import * as THREE from 'three'
import { BaseScene, wireMaterial } from './BaseScene.js'

export class ContactScene extends BaseScene {
  constructor() {
    super()
    this.sphereMat = this.track(wireMaterial(0x22d3ee, 0.18))
    this.beaconMat = this.track(wireMaterial(0x818cf8, 0.12))

    this.sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(2.45, 1), this.sphereMat)

    this.beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.5, 7, 12, 1, true),
      this.beaconMat,
    )
    this.beacon.position.set(0, 2.2, 0)

    this.group.add(this.sphere, this.beacon)
  }

  update(dt, elapsed) {
    this.sphere.rotation.y += dt * 0.12
    this.sphere.scale.setScalar(1 + Math.sin(elapsed * 1.1) * 0.03)
    this.beacon.rotation.y += dt * 0.3
  }
}

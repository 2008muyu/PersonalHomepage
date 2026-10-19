// 幕3 · 作品：三簇晶体各配一枚线框八面体，与粒子阵同位呼应
import * as THREE from 'three'
import { BaseScene, wireMaterial } from './BaseScene.js'

const CENTERS = [
  [-4.1, 0.2, 0],
  [0, 0.35, 0.4],
  [4.1, 0.2, 0],
]

export class WorkScene extends BaseScene {
  constructor(detail = 2) {
    super()
    this.mat = this.track(wireMaterial(0x7ceefb, 0.4))
    this.meshes = CENTERS.map((c, idx) => {
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, idx % 2), this.mat.clone())
      mesh.material.userData.baseOpacity = 0.4
      this.materials.push(mesh.material)
      mesh.position.set(...c)
      mesh.userData.spin = 0.18 + idx * 0.07
      mesh.userData.phase = idx * 2.1
      this.group.add(mesh)
      return mesh
    })
  }

  update(dt, elapsed) {
    for (const mesh of this.meshes) {
      mesh.rotation.y += dt * mesh.userData.spin
      mesh.rotation.x += dt * mesh.userData.spin * 0.4
      mesh.position.y = mesh.userData.phaseY + Math.sin(elapsed * 0.7 + mesh.userData.phase) * 0.16
    }
  }

  enter() {
    this.meshes.forEach((m, i) => (m.userData.phaseY = CENTERS[i][1]))
  }
}

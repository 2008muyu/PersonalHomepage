// 场景基类：统一的 group / 透明度 / 自转管理
import * as THREE from 'three'

export class BaseScene {
  constructor() {
    this.group = new THREE.Group()
    this.materials = []
  }

  track(material) {
    material.transparent = true
    material.depthWrite = false
    this.materials.push(material)
    return material
  }

  setOpacity(v) {
    for (const m of this.materials) m.opacity = m.userData.baseOpacity * v
  }

  registerBaseOpacity(material, base) {
    material.userData.baseOpacity = base
    material.opacity = base
  }

  update(_dt, _elapsed) {}
  enter() {}
  exit() {}
}

export function wireMaterial(color, opacity) {
  const m = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  m.userData.baseOpacity = opacity
  return m
}

// 场景状态机：五幕场景的 enter / exit / update 调度。
// 场景只操作自己的 THREE.Group，互不感知；可见性切换带透明度过渡，杜绝黑屏闪烁。
export class SceneStateMachine {
  constructor(rootScene) {
    this.rootScene = rootScene
    this.scenes = new Map()
    this.active = null
    this.previous = null
    this.transition = 1 // 0→1 淡入完成度
  }

  register(name, scene) {
    scene.group.visible = false
    scene.setOpacity(0)
    this.rootScene.add(scene.group)
    this.scenes.set(name, scene)
  }

  go(name) {
    if (!this.scenes.has(name) || name === this.active?.name) return
    this.previous = this.active
    this.active = { name, scene: this.scenes.get(name) }
    this.transition = 0
    this.active.scene.group.visible = true
    this.active.scene.enter?.()
    this.previous?.scene.exit?.()
  }

  update(dt, elapsed) {
    if (!this.active) return
    this.transition = Math.min(1, this.transition + dt * 2.2)
    const fadeIn = easeOutCubic(this.transition)

    for (const [name, scene] of this.scenes) {
      const isActive = name === this.active.name
      if (scene.group.visible) {
        scene.setOpacity(isActive ? Math.max(fadeIn, 0.001) : 0)
        scene.update?.(dt, elapsed)
      }
      // 上一幕完全淡出后停止更新并隐藏
      if (!isActive && scene.group.visible && name === this.previous?.name && this.transition >= 1) {
        scene.group.visible = false
        this.previous = null
      } else if (!isActive && scene.group.visible && name !== this.previous?.name) {
        scene.group.visible = false
      }
    }
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

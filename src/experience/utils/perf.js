// 性能档位：按设备特征决定粒子预算 / DPR 上限（方案 §3.3 优雅降级三层）
export function detectTier() {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 768
  const memory = navigator.deviceMemory || 8
  const cores = navigator.hardwareConcurrency || 8
  const isMobile = coarse || small

  if (isMobile) {
    return {
      name: 'mobile',
      particleCount: 4200,
      maxDpr: 1.5,
      accentDetail: 1,
    }
  }
  if (memory <= 4 || cores <= 4) {
    return {
      name: 'low',
      particleCount: 2600,
      maxDpr: 1.25,
      accentDetail: 1,
    }
  }
  return {
    name: 'desktop',
    particleCount: 12000,
    maxDpr: 2,
    accentDetail: 2,
  }
}

export function webglSupported() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

// 确定性伪随机（同一份种子 → 同一形态，便于回归目检）
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

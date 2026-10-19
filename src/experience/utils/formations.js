// 五幕粒子形态生成器：星系 / 波场 / 隧道 / 晶体阵 / 星球（全部程序化，无外部模型）
import { mulberry32 } from './perf.js'

/** 幕0 · 星系：三条旋臂 + 薄盘面 */
function galaxy(count) {
  const rand = mulberry32(11)
  const arr = new Float32Array(count * 3)
  const arms = 3
  for (let i = 0; i < count; i++) {
    const arm = i % arms
    const r = Math.pow(rand(), 0.65) * 7.5 + 0.3
    const spin = r * 0.55 + (rand() - 0.5) * 0.7
    const angle = (arm / arms) * Math.PI * 2 + spin
    const scatter = (rand() - 0.5) * (0.5 + r * 0.14)
    arr[i * 3] = Math.cos(angle) * r + scatter
    arr[i * 3 + 1] = (rand() - 0.5) * (0.35 + r * 0.06)
    arr[i * 3 + 2] = Math.sin(angle) * r + scatter
  }
  return arr
}

/** 幕1 · 波场：数据平面网格，随波浪相位起伏 */
function waveGrid(count) {
  const rand = mulberry32(23)
  const arr = new Float32Array(count * 3)
  const side = Math.ceil(Math.sqrt(count))
  for (let i = 0; i < count; i++) {
    const gx = i % side
    const gz = Math.floor(i / side)
    const x = (gx / (side - 1) - 0.5) * 16
    const z = (gz / (side - 1) - 0.5) * 11
    const y = Math.sin(x * 0.6) * 0.55 + Math.cos(z * 0.75 + x * 0.3) * 0.45 + (rand() - 0.5) * 0.12
    arr[i * 3] = x
    arr[i * 3 + 1] = y - 0.6
    arr[i * 3 + 2] = z
  }
  return arr
}

/** 幕2 · 隧道：圆柱内壁 + 前后延伸的流光 */
function tunnel(count) {
  const rand = mulberry32(37)
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2
    const streak = Math.pow(rand(), 1.6)
    const r = 2.15 + (rand() - 0.5) * 0.3
    arr[i * 3] = Math.cos(angle) * r
    arr[i * 3 + 1] = Math.sin(angle) * r * 0.82
    arr[i * 3 + 2] = (streak - 0.5) * 26
  }
  return arr
}

/** 幕3 · 晶体阵：三簇八面体壳，对应三张项目卡片 */
function crystals(count) {
  const rand = mulberry32(53)
  const arr = new Float32Array(count * 3)
  const centers = [
    [-4.1, 0.2, 0],
    [0, 0.35, 0.4],
    [4.1, 0.2, 0],
  ]
  for (let i = 0; i < count; i++) {
    const c = centers[i % 3]
    // 八面体壳采样：|x|+|y|+|z| = R
    const r = 1.05 + Math.pow(rand(), 2.2) * 0.55
    let x = rand() * 2 - 1
    let y = rand() * 2 - 1
    let z = rand() * 2 - 1
    const norm = (Math.abs(x) + Math.abs(y) + Math.abs(z)) || 1
    x = (x / norm) * r
    y = (y / norm) * r
    z = (z / norm) * r
    // 少量游离尘埃
    if (rand() > 0.86) {
      x += (rand() - 0.5) * 2.4
      y += (rand() - 0.5) * 1.8
      z += (rand() - 0.5) * 1.4
    }
    arr[i * 3] = c[0] + x
    arr[i * 3 + 1] = c[1] + y
    arr[i * 3 + 2] = c[2] + z
  }
  return arr
}

/** 幕4 · 星球：斐波那契均匀球 + 稀疏外环光晕 */
function sphere(count) {
  const rand = mulberry32(71)
  const arr = new Float32Array(count * 3)
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    if (rand() > 0.88) {
      // 外环
      const a = rand() * Math.PI * 2
      const r = 4.2 + rand() * 1.6
      arr[i * 3] = Math.cos(a) * r
      arr[i * 3 + 1] = (rand() - 0.5) * 0.22
      arr[i * 3 + 2] = Math.sin(a) * r
    } else {
      const y = 1 - (i / count) * 2
      const rad = Math.sqrt(1 - y * y)
      const theta = phi * i
      const r = 2.45 + (rand() - 0.5) * 0.1
      arr[i * 3] = Math.cos(theta) * rad * r
      arr[i * 3 + 1] = y * r
      arr[i * 3 + 2] = Math.sin(theta) * rad * r
    }
  }
  return arr
}

export function buildFormations(count) {
  return [galaxy(count), waveGrid(count), tunnel(count), crystals(count), sphere(count)]
}

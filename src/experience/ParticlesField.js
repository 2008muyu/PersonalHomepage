// 共享粒子场：同一组粒子在五幕之间连续变形（GPU 端 mix，CPU 仅在跨段时烘焙基态）
// 交互三件套（v1.2）：光标引力场 / 点击涟漪 / 滚动湍流 —— 全部着色器 uniform 驱动，零新增 draw call
import * as THREE from 'three'
import { buildFormations } from './utils/formations.js'
import { mulberry32 } from './utils/perf.js'

const MAX_RIPPLES = 4

const VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aRand;
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uMouse;
  uniform float uMouseK;
  uniform vec4 uRipples[${MAX_RIPPLES}];
  uniform float uTurb;
  varying float vRand;
  varying float vDepth;
  varying float vGlow;
  void main() {
    vec3 p = mix(position, aTarget, uMorph);
    float t = uTime;
    p.x += sin(t * 0.35 + aRand * 6.2831) * 0.05;
    p.y += cos(t * 0.3 + aRand * 4.71) * 0.05;
    p.z += sin(t * 0.22 + aRand * 3.14) * 0.04;
    // 滚动湍流：滚得越快粒子越躁，停下缓缓平息
    p.x += sin(t * 2.3 + aRand * 12.6) * 0.17 * uTurb;
    p.y += cos(t * 1.9 + aRand * 9.4) * 0.17 * uTurb;
    p.z += sin(t * 2.7 + aRand * 15.7) * 0.13 * uTurb;
    // 光标引力场：附近粒子被推开（明显可感，位移封顶）
    vec3 dm = p - uMouse;
    float md = length(dm);
    float push = smoothstep(3.8, 0.2, md) * uMouseK;
    p += (dm / max(md, 0.001)) * push * 1.7;
    float glow = push * 0.9;
    // 点击涟漪：球形波前扫过，波及粒子推起并提亮
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      float age = t - uRipples[i].w;
      if (age > 0.0 && age < 1.3) {
        vec3 d = p - uRipples[i].xyz;
        float dist = length(d);
        float e = (dist - age * 7.5) * 1.5;
        float band = exp(-e * e);
        float amp = band * (1.0 - age / 1.3);
        p += (d / max(dist, 0.001)) * amp * 1.2;
        glow += amp;
      }
    }
    vGlow = glow;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.6 + aRand * 1.1) * (150.0 / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
    vRand = aRand;
    vDepth = clamp(-mv.z / 24.0, 0.0, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vRand;
  varying float vDepth;
  varying float vGlow;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);
    vec3 color = mix(uColorA, uColorB, vRand);
    color += vGlow * 0.35;
    // 安静背景：整体低亮度，近处略亮、远处快速沉入背景；交互处按 vGlow 提亮并封顶
    float fogFade = mix(0.72, 0.1, vDepth);
    float alpha = soft * (0.22 + 0.58 * vRand) * fogFade * uOpacity * (1.0 + vGlow * 0.9);
    gl_FragColor = vec4(color, min(alpha, 0.85));
  }
`

export class ParticlesField {
  constructor(count) {
    this.count = count
    this.formations = buildFormations(count)
    this.i = 0
    this.j = 0
    this.t = 0

    const rand = mulberry32(97)
    const positions = new Float32Array(this.formations[0])
    const targets = new Float32Array(this.formations[0])
    const rands = new Float32Array(count)
    for (let k = 0; k < count; k++) rands[k] = rand()

    const geometry = new THREE.BufferGeometry()
    this.positionAttr = new THREE.BufferAttribute(positions, 3)
    this.targetAttr = new THREE.BufferAttribute(targets, 3)
    this.positionAttr.setUsage(THREE.DynamicDrawUsage)
    this.targetAttr.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', this.positionAttr)
    geometry.setAttribute('aTarget', this.targetAttr)
    geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uMorph: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 1.8 },
        uColorA: { value: new THREE.Color('#22d3ee') },
        uColorB: { value: new THREE.Color('#818cf8') },
        uOpacity: { value: 0.55 },
        uMouse: { value: new THREE.Vector3(0, 0, 999) },
        uMouseK: { value: 0 },
        uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, 999, -1e3)) },
        uTurb: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(geometry, this.material)
    this.points.frustumCulled = false
    this._rippleIdx = 0
  }

  /** 生成一圈涟漪：pos=世界坐标点击点，time=当前 elapsed（槽位循环复用） */
  spawnRipple(pos, time) {
    const slot = this._rippleIdx++ % MAX_RIPPLES
    this.material.uniforms.uRipples.value[slot].set(pos.x, pos.y, pos.z, time)
  }

  /** i=当前幕形态, j=下一形态, t∈[0,1] 混合进度（跨段时把当前视觉状态烘焙为基态，保证连续） */
  setMix(i, j, t) {
    i = Math.max(0, Math.min(4, i))
    j = Math.max(0, Math.min(4, j))
    if (i !== this.i || j !== this.j) {
      const pos = this.positionAttr.array
      const tgt = this.targetAttr.array
      const baked = smoothstep(this.t)
      for (let k = 0; k < pos.length; k++) {
        pos[k] = pos[k] + (tgt[k] - pos[k]) * baked
      }
      tgt.set(this.formations[j])
      this.positionAttr.needsUpdate = true
      this.targetAttr.needsUpdate = true
      this.i = i
      this.j = j
    }
    this.t = t
    this.material.uniforms.uMorph.value = smoothstep(t)
  }

  update(dt, elapsed) {
    this.material.uniforms.uTime.value = elapsed
  }

  dispose() {
    this.points.geometry.dispose()
    this.material.dispose()
  }
}

function smoothstep(t) {
  t = Math.max(0, Math.min(1, t))
  return t * t * (3 - 2 * t)
}

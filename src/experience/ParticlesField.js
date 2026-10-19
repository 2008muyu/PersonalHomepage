// 共享粒子场：同一组粒子在五幕之间连续变形（GPU 端 mix，CPU 仅在跨段时烘焙基态）
import * as THREE from 'three'
import { buildFormations } from './utils/formations.js'
import { mulberry32 } from './utils/perf.js'

const VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aRand;
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  varying float vRand;
  varying float vDepth;
  void main() {
    vec3 p = mix(position, aTarget, uMorph);
    float t = uTime;
    p.x += sin(t * 0.35 + aRand * 6.2831) * 0.05;
    p.y += cos(t * 0.3 + aRand * 4.71) * 0.05;
    p.z += sin(t * 0.22 + aRand * 3.14) * 0.04;
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
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);
    vec3 color = mix(uColorA, uColorB, vRand);
    // 近亮远暗，制造纵深
    float fogFade = mix(1.0, 0.25, vDepth);
    gl_FragColor = vec4(color, soft * (0.28 + 0.72 * vRand) * fogFade * uOpacity);
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
        uSize: { value: 2.4 },
        uColorA: { value: new THREE.Color('#22d3ee') },
        uColorB: { value: new THREE.Color('#818cf8') },
        uOpacity: { value: 0.9 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(geometry, this.material)
    this.points.frustumCulled = false
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

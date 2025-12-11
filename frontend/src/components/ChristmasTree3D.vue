<template>
  <div class="christmas-tree-container" ref="containerRef">
    <canvas ref="canvasRef" class="tree-canvas" @click="handleCanvasClick"></canvas>
    
    <!-- 控制按钮 -->
    <div class="tree-controls">
      <button 
        class="control-btn" 
        @click="toggleState"
        :class="{ 'active': sceneState === 'FORMED' }"
      >
        {{ sceneState === 'CHAOS' ? '组装树' : '分散' }}
      </button>
    </div>
    
    <!-- 状态信息 -->
    <div class="tree-stats">
      <div class="stat-item">
        <p class="stat-label">Memories</p>
        <p class="stat-value stat-value-gold">{{ photoCount.toLocaleString() }} <span class="stat-unit">POLAROIDS</span></p>
      </div>
      <div class="stat-item">
        <p class="stat-label">Foliage</p>
        <p class="stat-value stat-value-emerald">{{ foliageCount }}K <span class="stat-unit">EMERALD NEEDLES</span></p>
      </div>
    </div>
    
    <!-- 图片查看器 -->
    <ImageViewer 
      v-if="selectedPhoto" 
      :images="[{ imageUrl: selectedPhoto }]"
      :index="0"
      :open="!!selectedPhoto"
      @close="selectedPhoto = null" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { inSphere } from 'maath/random'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  messages: {
    type: Array,
    default: () => []
  }
})

const containerRef = ref(null)
const canvasRef = ref(null)
const sceneState = ref('CHAOS')
const selectedPhoto = ref(null)
// 照片数量：始终显示配置中的 ornaments 数量（300），因为即使照片不够也会重复使用
const photoCount = computed(() => CONFIG.counts.ornaments)
const foliageCount = computed(() => Math.floor(CONFIG.counts.foliage / 1000))

// Three.js 相关
let scene, camera, renderer, controls, composer
let treeGroup, photoOrnaments = [], christmasElements = [], fairyLights = []
let animationId = null
let foliageParticles = null, foliageMaterial = null
let topStar = null
let sparkles = []
let stars = []
let clock = new THREE.Clock()
let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()

// 触摸/鼠标滑动控制
const rotationSpeed = ref(0)
let isDragging = false
let lastTouchX = 0
let lastTouchY = 0
let lastTouchTime = 0
let velocityX = 0
let velocityY = 0
const VELOCITY_DECAY = 0.95 // 速度衰减系数
const MAX_VELOCITY = 0.15 // 最大旋转速度

// 事件处理函数引用（用于清理）
let touchHandlers = null

// 配置 - 完全按照原始项目
const CONFIG = {
  colors: {
    emerald: '#004225',
    gold: '#FFD700',
    silver: '#ECEFF1',
    red: '#D32F2F',
    green: '#2E7D32',
    white: '#FFFFFF',
    warmLight: '#FFD54F',
    lights: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    borders: ['#FFFAF0', '#F0E68C', '#E6E6FA', '#FFB6C1', '#98FB98', '#87CEFA', '#FFDAB9'],
    giftColors: ['#D32F2F', '#FFD700', '#1976D2', '#2E7D32'],
    candyColors: ['#FF0000', '#FFFFFF']
  },
  counts: {
    foliage: 15000,
    ornaments: 300,
    elements: 200,
    lights: 400,
    sparkles: 600,
    stars: 5000
  },
  tree: {
    height: 22,
    radius: 9
  }
}

// 获取树形位置 - 完全按照原始项目
const getTreePosition = () => {
  const h = CONFIG.tree.height
  const rBase = CONFIG.tree.radius
  const y = (Math.random() * h) - (h / 2)
  const normalizedY = (y + (h / 2)) / h
  const currentRadius = rBase * (1 - normalizedY)
  const theta = Math.random() * Math.PI * 2
  const r = Math.random() * currentRadius
  return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta))
}

// 创建 Foliage Shader Material - 完全按照原始项目
const createFoliageMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(CONFIG.colors.emerald) },
      uProgress: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uProgress;
      attribute vec3 aTargetPos;
      attribute float aRandom;
      varying vec2 vUv;
      varying float vMix;
      
      float cubicInOut(float t) {
        return t < 0.5 
          ? 4.0 * t * t * t 
          : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
      }
      
      void main() {
        vUv = uv;
        vec3 noise = vec3(
          sin(uTime * 1.5 + position.x),
          cos(uTime + position.y),
          sin(uTime * 1.5 + position.z)
        ) * 0.15;
        float t = cubicInOut(uProgress);
        vec3 finalPos = mix(position, aTargetPos + noise, t);
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_PointSize = (60.0 * (1.0 + aRandom)) / -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
        vMix = t;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vMix;
      
      void main() {
        float r = distance(gl_PointCoord, vec2(0.5));
        if (r > 0.5) discard;
        vec3 finalColor = mix(uColor * 0.3, uColor * 1.2, vMix);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
}

// 创建树叶粒子 - 完全按照原始项目
const createFoliage = () => {
  const count = CONFIG.counts.foliage
  const geometry = new THREE.BufferGeometry()
  
  // 使用 maath 生成球体随机点作为初始位置
  const spherePoints = inSphere(new Float32Array(count * 3), { radius: 25 })
  
  const positions = new Float32Array(count * 3)
  const targetPositions = new Float32Array(count * 3)
  const randoms = new Float32Array(count)
  
  for (let i = 0; i < count; i++) {
    // 初始位置（球体随机点）
    positions[i * 3] = spherePoints[i * 3]
    positions[i * 3 + 1] = spherePoints[i * 3 + 1]
    positions[i * 3 + 2] = spherePoints[i * 3 + 2]
    
    // 目标位置（树形）
    const treePos = getTreePosition()
    targetPositions[i * 3] = treePos.x
    targetPositions[i * 3 + 1] = treePos.y
    targetPositions[i * 3 + 2] = treePos.z
    
    randoms[i] = Math.random()
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPositions, 3))
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
  
  foliageMaterial = createFoliageMaterial()
  foliageParticles = new THREE.Points(geometry, foliageMaterial)
  treeGroup.add(foliageParticles)
}

// 创建照片装饰（双面拍立得）- 完全按照原始项目
const createPhotoOrnaments = () => {
  // 获取照片URL列表
  const photoUrls = props.photos.length > 0 
    ? props.photos.map(p => p.imageUrl)
    : Array.from({ length: 32 }, (_, i) => `https://picsum.photos/seed/${i}/400/400`)
  
  // 确保至少有32张照片URL（如果不够就使用占位符）
  const basePhotoUrls = photoUrls.length > 0 
    ? photoUrls 
    : Array.from({ length: 32 }, (_, i) => `https://picsum.photos/seed/${i}/400/400`)
  
  // 目标数量：使用配置中的 ornaments 数量（300）
  const targetCount = CONFIG.counts.ornaments
  photoOrnaments = []
  
  const borderGeometry = new THREE.PlaneGeometry(1.2, 1.5)
  const photoGeometry = new THREE.PlaneGeometry(1, 1)
  
  const textureLoader = new THREE.TextureLoader()
  
  // 创建目标数量的照片，如果照片不够就重复使用
  for (let i = 0; i < targetCount; i++) {
    // 使用模运算循环使用照片URL，确保即使只有1张照片也能创建300张
    const photoUrl = basePhotoUrls[i % basePhotoUrls.length]
    
    textureLoader.load(photoUrl, (texture) => {
      // 分散位置 - 完全按照原始项目：范围 70
      const chaosPos = new THREE.Vector3(
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70
      )
      
      const h = CONFIG.tree.height
      const y = (Math.random() * h) - (h / 2)
      const rBase = CONFIG.tree.radius
      const currentRadius = (rBase * (1 - (y + (h / 2)) / h)) + 0.5
      const theta = Math.random() * Math.PI * 2
      const targetPos = new THREE.Vector3(
        currentRadius * Math.cos(theta),
        y,
        currentRadius * Math.sin(theta)
      )
      
      const isBig = Math.random() < 0.2
      // 完全按照原始项目：isBig ? 2.2 : 0.8 + Math.random() * 0.6
      const baseScale = isBig ? 2.2 : 0.8 + Math.random() * 0.6
      const weight = 0.8 + Math.random() * 1.2
      const borderColor = CONFIG.colors.borders[Math.floor(Math.random() * CONFIG.colors.borders.length)]
      
      const rotationSpeed = {
        x: (Math.random() - 0.5) * 1.0,
        y: (Math.random() - 0.5) * 1.0,
        z: (Math.random() - 0.5) * 1.0
      }
      const chaosRotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      
      // 照片材质 - 完全按照原始项目：emissiveIntensity 1.0
      // 但需要调整以匹配 React Three Fiber 的渲染效果
      texture.colorSpace = THREE.SRGBColorSpace
      texture.flipY = false  // React Three Fiber 默认不翻转纹理
      const photoMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
        metalness: 0,
        emissive: CONFIG.colors.white,
        emissiveMap: texture,
        emissiveIntensity: 1.0,
        side: THREE.FrontSide,
        // 确保材质正确渲染
        toneMapped: true
      })
      
      const borderMaterial = new THREE.MeshStandardMaterial({
        color: borderColor,
        roughness: 0.9,
        metalness: 0,
        side: THREE.FrontSide
      })
      
      // 正面
      const frontGroup = new THREE.Group()
      const frontPhoto = new THREE.Mesh(photoGeometry, photoMaterial.clone())
      const frontBorder = new THREE.Mesh(borderGeometry, borderMaterial.clone())
      frontBorder.position.set(0, -0.15, -0.01)
      frontGroup.add(frontPhoto)
      frontGroup.add(frontBorder)
      frontGroup.position.set(0, 0, 0.015)
      
      // 背面
      const backGroup = new THREE.Group()
      const backPhoto = new THREE.Mesh(photoGeometry, photoMaterial.clone())
      const backBorder = new THREE.Mesh(borderGeometry, borderMaterial.clone())
      backBorder.position.set(0, -0.15, -0.01)
      backGroup.add(backPhoto)
      backGroup.add(backBorder)
      backGroup.position.set(0, 0, -0.015)
      backGroup.rotation.y = Math.PI
      
      // 主组
      const photoGroup = new THREE.Group()
      photoGroup.add(frontGroup)
      photoGroup.add(backGroup)
      photoGroup.scale.set(baseScale, baseScale, baseScale)
      // 初始状态：设置为 chaosPos（CHAOS 状态）
      photoGroup.position.copy(chaosPos)
      photoGroup.rotation.copy(chaosRotation)
      
      const ornament = {
        group: photoGroup,
        chaosPos: chaosPos.clone(),
        targetPos: targetPos.clone(),  // 确保克隆，避免引用问题
        currentPos: chaosPos.clone(),   // 初始位置就是 chaosPos
        chaosRotation: chaosRotation.clone(),
        rotationSpeed: rotationSpeed,
        weight: weight,
        wobbleOffset: Math.random() * 10,
        wobbleSpeed: 0.5 + Math.random() * 0.5,
        photoUrl: photoUrl  // 保存照片URL用于点击查看
      }
      
      photoOrnaments.push(ornament)
      treeGroup.add(photoGroup)
    })
  }
}

// 创建圣诞元素 - 完全按照原始项目
const createChristmasElements = () => {
  const count = CONFIG.counts.elements
  christmasElements = []
  
  const boxGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
  const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16)
  const caneGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8)
  
  for (let i = 0; i < count; i++) {
    // 完全按照原始项目：范围 60
    const chaosPos = new THREE.Vector3(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60
    )
    
    const h = CONFIG.tree.height
    const y = (Math.random() * h) - (h / 2)
    const rBase = CONFIG.tree.radius
    const currentRadius = (rBase * (1 - (y + (h / 2)) / h)) * 0.95
    const theta = Math.random() * Math.PI * 2
    const targetPos = new THREE.Vector3(
      currentRadius * Math.cos(theta),
      y,
      currentRadius * Math.sin(theta)
    )
    
    const type = Math.floor(Math.random() * 3)
    let color, scale = 1
    if (type === 0) {
      color = CONFIG.colors.giftColors[Math.floor(Math.random() * CONFIG.colors.giftColors.length)]
      scale = 0.8 + Math.random() * 0.4
    } else if (type === 1) {
      color = CONFIG.colors.giftColors[Math.floor(Math.random() * CONFIG.colors.giftColors.length)]
      scale = 0.6 + Math.random() * 0.4
    } else {
      color = Math.random() > 0.5 ? CONFIG.colors.red : CONFIG.colors.white
      scale = 0.7 + Math.random() * 0.3
    }
    
    let geometry
    if (type === 0) geometry = boxGeometry
    else if (type === 1) geometry = sphereGeometry
    else geometry = caneGeometry
    
    // 完全按照原始项目：emissiveIntensity 0.2
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.3,
      metalness: 0.4,
      emissive: color,
      emissiveIntensity: 0.2
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.set(scale, scale, scale)
    mesh.position.copy(chaosPos)
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    
    const rotationSpeed = {
      x: (Math.random() - 0.5) * 2.0,
      y: (Math.random() - 0.5) * 2.0,
      z: (Math.random() - 0.5) * 2.0
    }
    
    christmasElements.push({
      mesh: mesh,
      chaosPos: chaosPos.clone(),
      targetPos: targetPos,
      currentPos: chaosPos.clone(),
      rotationSpeed: rotationSpeed,
      chaosRotation: mesh.rotation.clone()
    })
    
    treeGroup.add(mesh)
  }
}

// 创建彩灯 - 完全按照原始项目
const createFairyLights = () => {
  const count = CONFIG.counts.lights
  fairyLights = []
  
  const geometry = new THREE.SphereGeometry(0.8, 8, 8)
  
  for (let i = 0; i < count; i++) {
    // 完全按照原始项目：范围 60
    const chaosPos = new THREE.Vector3(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60
    )
    
    const h = CONFIG.tree.height
    const y = (Math.random() * h) - (h / 2)
    const rBase = CONFIG.tree.radius
    const currentRadius = (rBase * (1 - (y + (h / 2)) / h)) + 0.3
    const theta = Math.random() * Math.PI * 2
    const targetPos = new THREE.Vector3(
      currentRadius * Math.cos(theta),
      y,
      currentRadius * Math.sin(theta)
    )
    
    const color = CONFIG.colors.lights[Math.floor(Math.random() * CONFIG.colors.lights.length)]
    const speed = 2 + Math.random() * 3
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0,
      toneMapped: false
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.set(0.15, 0.15, 0.15)
    mesh.position.copy(chaosPos)
    
    fairyLights.push({
      mesh: mesh,
      chaosPos: chaosPos.clone(),
      targetPos: targetPos,
      currentPos: chaosPos.clone(),
      color: color,
      speed: speed,
      timeOffset: Math.random() * 100
    })
    
    treeGroup.add(mesh)
  }
}

// 创建顶部星星 - 完全按照原始项目
const createTopStar = () => {
  const starShape = new THREE.Shape()
  const outerRadius = 1.3
  const innerRadius = 0.7
  const points = 5
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    if (i === 0) {
      starShape.moveTo(radius * Math.cos(angle), radius * Math.sin(angle))
    } else {
      starShape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle))
    }
  }
  starShape.closePath()
  
  const starGeometry = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3
  })
  
  // 完全按照原始项目：emissiveIntensity 1.5
  const starMaterial = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.gold,
    emissive: CONFIG.colors.gold,
    emissiveIntensity: 1.5,
    roughness: 0.1,
    metalness: 1.0
  })
  
  topStar = new THREE.Mesh(starGeometry, starMaterial)
  topStar.position.set(0, CONFIG.tree.height / 2 + 1.8, 0)
  topStar.scale.set(0, 0, 0)
  treeGroup.add(topStar)
}

// 创建星星背景 - 模拟 drei Stars 组件效果
// 原始项目使用 <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
const createStars = () => {
  const geometry = new THREE.BufferGeometry()
  const count = CONFIG.counts.stars
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  
  const color = new THREE.Color(0xffffff)
  
  for (let i = 0; i < count; i++) {
    // 使用球体分布，radius=100, depth=50 意味着星星在 100-150 的范围内
    const radius = 100
    const depth = 50
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    const r = radius + Math.random() * depth
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
    
    // factor=4 影响大小，saturation=0 表示无饱和度（白色）
    const size = (Math.random() * 3 + 1) * 4  // factor=4
    sizes[i] = size
    
    // 白色星星，saturation=0
    color.setRGB(1, 1, 1)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('starColor', new THREE.BufferAttribute(colors, 3))  // 使用 starColor 避免与 Three.js 内置变量冲突
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  // 使用 ShaderMaterial 实现 fade 效果（距离越远越淡）
  // 注意：Three.js 会自动注入一些变量，所以我们需要使用不同的变量名
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 starColor;
      varying vec3 vColor;
      varying float vSize;
      uniform float time;
      
      void main() {
        vColor = starColor;
        vSize = size;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vSize;
      
      void main() {
        float r = distance(gl_PointCoord, vec2(0.5));
        if (r > 0.5) discard;
        // fade 效果：边缘更淡
        float alpha = 1.0 - (r * 2.0);
        gl_FragColor = vec4(vColor, alpha * 0.6);
      }
    `,
    transparent: true,
    vertexColors: false,  // 不使用 Three.js 的内置颜色系统，使用自定义属性
    blending: THREE.AdditiveBlending
  })
  
  const points = new THREE.Points(geometry, material)
  scene.add(points)
  stars.push({ mesh: points, material: material })
}

// 创建 Sparkles - 完全按照原始项目
const createSparkles = () => {
  const count = CONFIG.counts.sparkles
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50
    sizes[i] = Math.random() * 8
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      sparkleColor: { value: new THREE.Color(CONFIG.colors.silver) }  // 重命名避免冲突
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float time;
      uniform vec3 sparkleColor;
      void main() {
        vColor = sparkleColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float r = distance(gl_PointCoord, vec2(0.5));
        if (r > 0.5) discard;
        gl_FragColor = vec4(vColor, 0.4);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  })
  
  const points = new THREE.Points(geometry, material)
  treeGroup.add(points)
  sparkles.push({ mesh: points, material: material })
}

// 初始化 Three.js 场景 - 完全按照原始项目
const initThreeJS = () => {
  if (!canvasRef.value || !containerRef.value) return

  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000300)

  // 相机 - 完全按照原始项目：position [0, 8, 60]
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 8, 60)

  // 渲染器 - 完全按照原始项目：ReinhardToneMapping
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ReinhardToneMapping  // 使用原始项目的色调映射
  renderer.toneMappingExposure = 1.0  // 确保曝光正确
  renderer.outputColorSpace = THREE.SRGBColorSpace  // 确保颜色空间正确

  // 控制器 - 完全按照原始项目：maxPolarAngle Math.PI / 1.7
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.enableZoom = true
  controls.minDistance = 30
  controls.maxDistance = 120
  controls.autoRotate = true  // 默认启用自动旋转
  controls.autoRotateSpeed = 0.3
  controls.maxPolarAngle = Math.PI / 1.7  // 完全按照原始项目
  controls.target.set(0, -6, 0)  // 设置目标点为树的位置
  
  // 添加触摸/鼠标事件监听
  setupTouchControls()

  // 灯光 - 完全按照原始项目
  const ambientLight = new THREE.AmbientLight(0x003311, 0.4)
  scene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(0xFFD54F, 100, 100)
  pointLight1.position.set(30, 30, 30)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0xFFD700, 50, 100)
  pointLight2.position.set(-30, 10, -30)
  scene.add(pointLight2)

  const pointLight3 = new THREE.PointLight(0xffffff, 30, 100)
  pointLight3.position.set(0, -20, 10)
  scene.add(pointLight3)

  // 创建树组 - 完全按照原始项目：position [0, -6, 0]
  treeGroup = new THREE.Group()
  treeGroup.position.set(0, -6, 0)
  scene.add(treeGroup)

  // 创建各种元素
  createFoliage()
  createPhotoOrnaments()
  createChristmasElements()
  createFairyLights()
  createTopStar()
  createStars()
  createSparkles()

  // 后处理 - 完全按照原始项目：Bloom intensity 1.5, radius 0.5, threshold 0.8
  composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)
  
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.5,  // 完全按照原始项目
    0.5,  // 完全按照原始项目
    0.8   // 完全按照原始项目
  )
  composer.addPass(bloomPass)
  
  const outputPass = new OutputPass()
  composer.addPass(outputPass)

  // 动画循环
  animate()

  // 窗口大小调整
  window.addEventListener('resize', handleResize)
}

// 切换状态
const toggleState = () => {
  sceneState.value = sceneState.value === 'CHAOS' ? 'FORMED' : 'CHAOS'
  
  // 重置所有元素的 currentPos，确保动画能正确执行
  photoOrnaments.forEach((ornament) => {
    if (ornament && ornament.group) {
      ornament.currentPos = ornament.group.position.clone()
    }
  })
  
  christmasElements.forEach((element) => {
    if (element && element.mesh) {
      element.currentPos = element.mesh.position.clone()
    }
  })
  
  fairyLights.forEach((light) => {
    if (light && light.mesh) {
      light.currentPos = light.mesh.position.clone()
    }
  })
}

// 处理画布点击事件
const handleCanvasClick = (event) => {
  if (!canvasRef.value || !camera || !scene) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  // 更新 raycaster
  raycaster.setFromCamera(mouse, camera)
  
  // 检测与照片装饰的相交
  const intersects = raycaster.intersectObjects(
    photoOrnaments.map(ornament => ornament.group),
    true
  )
  
  if (intersects.length > 0) {
    // 找到被点击的照片装饰
    const clickedObject = intersects[0].object
    // 向上查找包含这个对象的 ornament
    for (const ornament of photoOrnaments) {
      if (ornament.group.children.includes(clickedObject.parent) || 
          ornament.group === clickedObject.parent ||
          ornament.group.children.some(child => child.children && child.children.includes(clickedObject))) {
        selectedPhoto.value = ornament.photoUrl
        break
      }
    }
  }
}

// 动画循环 - 完全按照原始项目
const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  const elapsedTime = clock.getElapsedTime()
  const delta = clock.getDelta()
  const isFormed = sceneState.value === 'FORMED'
  
  // 更新树叶粒子 Shader - 完全按照原始项目：damp 1.5
  if (foliageMaterial) {
    foliageMaterial.uniforms.uTime.value = elapsedTime
    const targetProgress = isFormed ? 1 : 0
    foliageMaterial.uniforms.uProgress.value = THREE.MathUtils.damp(
      foliageMaterial.uniforms.uProgress.value,
      targetProgress,
      1.5,  // 完全按照原始项目
      delta
    )
  }
  
  // 更新照片装饰 - 完全按照原始项目：lerp delta * (isFormed ? 0.8 * weight : 0.5)
  photoOrnaments.forEach((ornament) => {
    if (!ornament || !ornament.group) return  // 确保 ornament 和 group 存在
    
    const target = isFormed ? ornament.targetPos : ornament.chaosPos
    const lerpSpeed = isFormed ? 0.8 * ornament.weight : 0.5
    
    // 确保 currentPos 已初始化
    if (!ornament.currentPos) {
      ornament.currentPos = ornament.group.position.clone()
    }
    
    // 使用 lerp 平滑移动到目标位置
    // 注意：lerp 的第三个参数是插值因子，值越大移动越快
    const lerpFactor = delta * lerpSpeed
    ornament.currentPos.lerp(target, lerpFactor)
    ornament.group.position.copy(ornament.currentPos)
    
    // 当接近目标位置时，直接设置到目标位置（避免无限接近但永远到不了）
    const distance = ornament.currentPos.distanceTo(target)
    if (distance < 0.05) {
      ornament.group.position.copy(target)
      ornament.currentPos.copy(target)
    }
    
    if (isFormed) {
      // 完全按照原始项目：在 formed 状态时，rotation 应该是 [0,0,0]，然后通过 lookAt 朝向相机
      // 在 React Three Fiber 中，rotation 是通过 JSX 属性直接设置的，所以我们需要确保 rotation 正确
      // 先重置 rotation 到 [0,0,0]（使用 lerp 平滑过渡）
      if (Math.abs(ornament.group.rotation.x) > 0.01 || 
          Math.abs(ornament.group.rotation.y) > 0.01 || 
          Math.abs(ornament.group.rotation.z) > 0.01) {
        ornament.group.rotation.x = THREE.MathUtils.lerp(ornament.group.rotation.x, 0, delta * 3)
        ornament.group.rotation.y = THREE.MathUtils.lerp(ornament.group.rotation.y, 0, delta * 3)
        ornament.group.rotation.z = THREE.MathUtils.lerp(ornament.group.rotation.z, 0, delta * 3)
      } else {
        ornament.group.rotation.set(0, 0, 0)
      }
      
      // 朝向相机（在重置 rotation 之后）
      const targetLookPos = new THREE.Vector3(
        ornament.group.position.x * 2,
        ornament.group.position.y + 0.5,
        ornament.group.position.z * 2
      )
      ornament.group.lookAt(targetLookPos)
      
      // 轻微摆动（在 lookAt 之后添加，这样摆动会叠加在 lookAt 的旋转上）
      const wobbleX = Math.sin(elapsedTime * ornament.wobbleSpeed + ornament.wobbleOffset) * 0.05
      const wobbleZ = Math.cos(elapsedTime * ornament.wobbleSpeed * 0.8 + ornament.wobbleOffset) * 0.05
      ornament.group.rotation.x += wobbleX
      ornament.group.rotation.z += wobbleZ
    } else {
      // 分散状态：使用 chaosRotation 并持续旋转
      // 先平滑过渡到 chaosRotation
      ornament.group.rotation.x = THREE.MathUtils.lerp(ornament.group.rotation.x, ornament.chaosRotation.x, delta * 3)
      ornament.group.rotation.y = THREE.MathUtils.lerp(ornament.group.rotation.y, ornament.chaosRotation.y, delta * 3)
      ornament.group.rotation.z = THREE.MathUtils.lerp(ornament.group.rotation.z, ornament.chaosRotation.z, delta * 3)
      
      // 然后持续旋转
      ornament.group.rotation.x += delta * ornament.rotationSpeed.x
      ornament.group.rotation.y += delta * ornament.rotationSpeed.y
      ornament.group.rotation.z += delta * ornament.rotationSpeed.z
    }
  })
  
  // 更新圣诞元素 - 完全按照原始项目：lerp delta * 1.5
  christmasElements.forEach((element) => {
    if (!element || !element.mesh) return
    
    const target = isFormed ? element.targetPos : element.chaosPos
    if (!element.currentPos) {
      element.currentPos = element.mesh.position.clone()
    }
    
    element.currentPos.lerp(target, delta * 1.5)
    element.mesh.position.copy(element.currentPos)
    
    // 当接近目标位置时，直接设置到目标位置
    const distance = element.currentPos.distanceTo(target)
    if (distance < 0.05) {
      element.mesh.position.copy(target)
      element.currentPos.copy(target)
    }
    
    element.mesh.rotation.x += delta * element.rotationSpeed.x
    element.mesh.rotation.y += delta * element.rotationSpeed.y
    element.mesh.rotation.z += delta * element.rotationSpeed.z
  })
  
  // 更新彩灯 - 完全按照原始项目：lerp delta * 2.0, emissiveIntensity formed ? 3 + intensity * 4 : 0
  fairyLights.forEach((light) => {
    if (!light || !light.mesh) return
    
    const target = isFormed ? light.targetPos : light.chaosPos
    if (!light.currentPos) {
      light.currentPos = light.mesh.position.clone()
    }
    
    light.currentPos.lerp(target, delta * 2.0)
    light.mesh.position.copy(light.currentPos)
    
    // 当接近目标位置时，直接设置到目标位置
    const distance = light.currentPos.distanceTo(target)
    if (distance < 0.05) {
      light.mesh.position.copy(target)
      light.currentPos.copy(target)
    }
    
    const intensity = (Math.sin(elapsedTime * light.speed + light.timeOffset) + 1) / 2
    if (light.mesh.material) {
      light.mesh.material.emissiveIntensity = isFormed ? 3 + intensity * 4 : 0
    }
  })
  
  // 更新顶部星星 - 完全按照原始项目：lerp delta * 3
  if (topStar) {
    topStar.rotation.y += delta * 0.5
    const targetScale = isFormed ? 1 : 0
    topStar.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3)
  }
  
  // 更新 Sparkles
  sparkles.forEach((sparkle) => {
    if (sparkle.material.uniforms) {
      sparkle.material.uniforms.time.value = elapsedTime * 0.4
    }
  })
  
  // 更新星星（如果需要动画）
  stars.forEach((star) => {
    if (star.material && star.material.uniforms && star.material.uniforms.time) {
      star.material.uniforms.time.value = elapsedTime * 1.0  // speed=1
    }
  })
  
  // 更新旋转速度（应用触摸/鼠标滑动的惯性）
  if (controls && !isDragging) {
    // 速度衰减
    velocityX *= VELOCITY_DECAY
    velocityY *= VELOCITY_DECAY
    
    // 应用水平旋转（azimuthal angle）的惯性
    if (Math.abs(velocityX) > 0.001) {
      // 直接操作 controls 的 azimuthal angle（球坐标）
      if (controls.object) {
        const spherical = new THREE.Spherical()
        spherical.setFromVector3(controls.object.position.clone().sub(controls.target))
        spherical.theta -= velocityX * delta * 60 // 水平旋转
        spherical.makeSafe()
        controls.object.position.setFromSpherical(spherical).add(controls.target)
        controls.object.lookAt(controls.target)
      }
      rotationSpeed.value = -velocityX
    } else {
      rotationSpeed.value = 0
    }
    
    // 如果速度很小，直接设为0
    if (Math.abs(velocityX) < 0.001) {
      velocityX = 0
      rotationSpeed.value = 0
    }
    if (Math.abs(velocityY) < 0.001) {
      velocityY = 0
    }
  }
  
  // 更新 autoRotate 逻辑：只有在 rotationSpeed === 0 时才自动旋转
  // 分散状态和组装状态都可以自动旋转
  if (controls) {
    controls.autoRotate = rotationSpeed.value === 0
    controls.update()
  }
  
  // 渲染
  if (composer) {
    composer.render()
  } else {
    renderer.render(scene, camera)
  }
}

// 触摸/鼠标控制设置
const setupTouchControls = () => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  
  // 获取触摸/鼠标位置
  const getEventPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }
  
  // 开始拖动
  const onStart = (e) => {
    isDragging = true
    const pos = getEventPos(e)
    lastTouchX = pos.x
    lastTouchY = pos.y
    lastTouchTime = Date.now()
    velocityX = 0
    velocityY = 0
    
    // 禁用 autoRotate
    if (controls) {
      controls.autoRotate = false
    }
    
    e.preventDefault()
  }
  
  // 拖动中
  const onMove = (e) => {
    if (!isDragging) return
    
    const pos = getEventPos(e)
    const currentTime = Date.now()
    const deltaTime = Math.max(currentTime - lastTouchTime, 16) // 最小16ms，避免除零和异常大的值
    
    // 计算移动距离（像素）
    const deltaX = pos.x - lastTouchX
    const deltaY = pos.y - lastTouchY
    
    // 计算瞬时速度（像素/毫秒）
    const speedX = deltaX / deltaTime
    const speedY = deltaY / deltaTime
    
    // 转换为旋转速度（水平滑动控制水平旋转，垂直滑动控制垂直旋转）
    // 使用平滑处理，避免突然变化
    const targetVelocityX = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, speedX * 0.15))
    const targetVelocityY = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, speedY * 0.15))
    
    // 平滑过渡到目标速度
    velocityX = velocityX * 0.7 + targetVelocityX * 0.3
    velocityY = velocityY * 0.7 + targetVelocityY * 0.3
    
    // 应用旋转（直接应用，不等待动画循环）
    if (controls && controls.object) {
      // 使用球坐标来旋转相机
      const spherical = new THREE.Spherical()
      spherical.setFromVector3(controls.object.position.clone().sub(controls.target))
      
      // 水平旋转（azimuthal）- 直接应用移动距离的旋转
      const rotationAmount = deltaX * 0.01 // 将像素转换为弧度
      spherical.theta -= rotationAmount // 负号使方向符合直觉
      
      // 垂直旋转（polar）- 限制在 maxPolarAngle 范围内
      const polarRotationAmount = deltaY * 0.01
      spherical.phi += polarRotationAmount
      const maxPolar = Math.PI / 1.7
      spherical.phi = Math.max(0.1, Math.min(maxPolar, spherical.phi))
      
      spherical.makeSafe()
      controls.object.position.setFromSpherical(spherical).add(controls.target)
      controls.object.lookAt(controls.target)
      controls.update()
      
      rotationSpeed.value = -velocityX // 负号以匹配旋转方向
    }
    
    lastTouchX = pos.x
    lastTouchY = pos.y
    lastTouchTime = currentTime
    
    e.preventDefault()
  }
  
  // 结束拖动
  const onEnd = (e) => {
    if (!isDragging) return
    isDragging = false
    
    // 保持当前速度，让惯性继续
    // velocityX 和 velocityY 会在动画循环中衰减
    
    e.preventDefault()
  }
  
  // 保存事件处理函数引用
  touchHandlers = {
    onStart,
    onMove,
    onEnd
  }
  
  // 触摸事件
  canvas.addEventListener('touchstart', onStart, { passive: false })
  canvas.addEventListener('touchmove', onMove, { passive: false })
  canvas.addEventListener('touchend', onEnd, { passive: false })
  canvas.addEventListener('touchcancel', onEnd, { passive: false })
  
  // 鼠标事件
  canvas.addEventListener('mousedown', onStart)
  canvas.addEventListener('mousemove', onMove)
  canvas.addEventListener('mouseup', onEnd)
  canvas.addEventListener('mouseleave', onEnd)
}

// 窗口大小调整
const handleResize = () => {
  if (!containerRef.value || !camera || !renderer) return
  
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  
  if (composer) {
    composer.setSize(width, height)
  }
}

// 清理
const cleanup = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  window.removeEventListener('resize', handleResize)
  
  // 清理触摸/鼠标事件
  if (canvasRef.value && touchHandlers) {
    const canvas = canvasRef.value
    canvas.removeEventListener('touchstart', touchHandlers.onStart)
    canvas.removeEventListener('touchmove', touchHandlers.onMove)
    canvas.removeEventListener('touchend', touchHandlers.onEnd)
    canvas.removeEventListener('touchcancel', touchHandlers.onEnd)
    canvas.removeEventListener('mousedown', touchHandlers.onStart)
    canvas.removeEventListener('mousemove', touchHandlers.onMove)
    canvas.removeEventListener('mouseup', touchHandlers.onEnd)
    canvas.removeEventListener('mouseleave', touchHandlers.onEnd)
  }
  
  if (foliageParticles) {
    foliageParticles.geometry.dispose()
    foliageParticles.material.dispose()
  }
  
  photoOrnaments.forEach(ornament => {
    ornament.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material.map) child.material.map.dispose()
        child.material.dispose()
      }
    })
  })
  
  christmasElements.forEach(element => {
    element.mesh.geometry.dispose()
    element.mesh.material.dispose()
  })
  
  fairyLights.forEach(light => {
    light.mesh.geometry.dispose()
    light.mesh.material.dispose()
  })
  
  if (topStar) {
    topStar.geometry.dispose()
    topStar.material.dispose()
  }
  
  sparkles.forEach(sparkle => {
    sparkle.mesh.geometry.dispose()
    sparkle.material.dispose()
  })
  
  stars.forEach(star => {
    star.geometry.dispose()
    star.material.dispose()
  })
  
  if (composer) {
    composer.dispose()
  }
  
  if (renderer) {
    renderer.dispose()
  }
}

onMounted(() => {
  initThreeJS()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.christmas-tree-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  overflow: hidden;
}

.tree-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.tree-controls {
  position: absolute;
  bottom: 30px;
  right: 40px;
  z-index: 10;
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 12px 30px;
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.5);
  color: #FFD700;
  font-family: serif;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.3s;
}

.control-btn:hover {
  background-color: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.8);
}

.control-btn.active {
  background-color: rgba(255, 215, 0, 0.3);
  border-color: rgba(255, 215, 0, 0.9);
}

.tree-stats {
  position: absolute;
  bottom: 30px;
  left: 40px;
  color: #888;
  z-index: 10;
  font-family: sans-serif;
  user-select: none;
}

.stat-item {
  margin-bottom: 15px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 4px;
  color: #888;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.stat-value-gold {
  color: #FFD700;
}

.stat-value-emerald {
  color: #004225;
}

.stat-unit {
  font-size: 10px;
  color: #555;
  font-weight: normal;
}
</style>

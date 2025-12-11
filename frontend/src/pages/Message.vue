<template>
  <div class="message-container">
    <!-- 柔光圆形背景 -->
    <div class="page-glow"></div>
    
    <!-- 金粉粒子背景 -->
    <canvas id="goldParticles" class="gold-particles"></canvas>
    
    <div class="bg-texture"></div>
    
    <!-- 导航（仅在独立页面显示） -->
    <div v-if="!hideNav" class="nav-bar">
      <div class="back-btn" @click="handleBack"><i class="van-icon van-icon-arrow-left"></i></div>
      <div class="title">时光印记</div>
      <div class="nav-buttons">
        <div class="assemble-btn" @click="toggleSceneState">
          {{ sceneState === 'FORMED' ? '分散' : '组装树' }}
        </div>
      <div class="write-btn" @click="showWrite = true">写祝福</div>
      </div>
    </div>
    
    <!-- 简化导航（作为组件时显示） -->
    <div v-else class="nav-bar-simple">
      <div class="nav-buttons">
        <div class="assemble-btn" @click="toggleSceneState">
          {{ sceneState === 'FORMED' ? '分散' : '组装树' }}
        </div>
        <div class="write-btn" @click="showWrite = true">写祝福</div>
      </div>
    </div>

    <!-- 3D 圣诞树容器 -->
    <div ref="treeContainer" class="tree-3d-wrapper"></div>

    <!-- 留言展开卡片（悬浮显示） -->
    <div v-if="selectedMessage" class="message-expand-card" @click="selectedMessage = null">
      <div class="card-content" @click.stop>
        <div class="card-header">
          <h3>祝福寄语</h3>
          <div class="close-btn" @click="selectedMessage = null">×</div>
        </div>
        <div class="card-body">
          <p class="message-text">{{ selectedMessage.content }}</p>
          <p class="message-author">—— {{ selectedMessage.guestName }}</p>
        </div>
      </div>
    </div>

    <!-- 写祝福弹窗 -->
    <van-popup v-model:show="showWrite" position="bottom" round :style="{ height: '50%' }">
      <div class="write-panel">
        <h3>送上您的祝福</h3>
        <van-field
            v-model="newMsg"
            type="textarea"
            placeholder="写下对宝宝的美好祝愿..."
            rows="4"
            maxlength="200"
            show-word-limit
        />
        <van-field
            v-model="guestName"
            placeholder="您的姓名（可选，留空则为匿名）"
        />
        <button class="send-btn" @click="sendWish">挂上许愿树</button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { sendMessage, getMessageList } from '../api/message';
import { getGalleryList } from '../api/gallery';
import { showToast, showImagePreview } from 'vant';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initGoldParticles } from '../utils/animations';
import { Raycaster } from 'three';
import 'animate.css';

const props = defineProps({
  hideNav: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();

const handleBack = () => {
  router.back();
};

const showWrite = ref(false);
const newMsg = ref('');
const guestName = ref('');
const messages = ref([]);
const photos = ref([]); // 照片列表
const treeContainer = ref(null);
const selectedMessage = ref(null);
const selectedPhoto = ref(null);
const sceneState = ref('CHAOS'); // 'CHAOS' 或 'FORMED'

// Three.js 相关
let scene, camera, renderer, treeGroup, messageOrnaments = [], photoOrnaments = [];
let animationId = null;
let foliageParticles = null;
let foliageProgress = 1;
let controls = null;
let raycaster = null;
let mouse = new THREE.Vector2();
let lastFrameTime = 0;

// 默认匿名寄语数据
const defaultMessages = [
    { id: 1, content: '平安喜乐，茁壮成长！', guestName: '匿名' },
    { id: 2, content: '聪明伶俐，前程似锦', guestName: '匿名' },
    { id: 3, content: '百日快乐呀~', guestName: '匿名' },
    { id: 4, content: '永远开心快乐', guestName: '匿名' },
    { id: 5, content: '健康快乐每一天', guestName: '匿名' },
    { id: 6, content: '愿宝宝茁壮成长', guestName: '匿名' },
];

// 初始化 3D 场景
const initThreeJS = () => {
  if (!treeContainer.value) return;

  // 场景 - 新中式国潮风格（米色背景，但3D场景使用透明以便看到页面背景）
  scene = new THREE.Scene();
  scene.background = null; // 透明背景，显示页面米色背景
  scene.fog = new THREE.Fog(0xf5f0e8, 30, 100);

  // 相机
  // 减小FOV（视野角度）可以让物体显示更大，从45度减小到35度
  camera = new THREE.PerspectiveCamera(
    35,
    treeContainer.value.clientWidth / treeContainer.value.clientHeight,
    0.1,
    1000
  );
  // 初始视角拉到最远，能看到完整的场景
  camera.position.set(0, 15, 80);

  // 渲染器（启用透明背景）
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(treeContainer.value.clientWidth, treeContainer.value.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // 透明背景
  treeContainer.value.appendChild(renderer.domElement);

  // 添加轨道控制器（手动旋转 + 自动旋转）
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2; // 允许非常近的观察（组装后放大到最大）
  controls.maxDistance = 120; // 增加最大距离，允许更远观察
  controls.maxPolarAngle = Math.PI / 1.8;
  controls.autoRotate = true; // 开启自动旋转
  controls.autoRotateSpeed = 0.5; // 缓慢旋转速度

  // 优化灯光系统（新中式风格）
  // 环境光（暖色调）
  const ambientLight = new THREE.AmbientLight(0xfaf8f3, 0.5);
  scene.add(ambientLight);

  // 主光源（从上方照亮树，雅金色）
  const pointLight1 = new THREE.PointLight(0xD4AF37, 3, 100);
  pointLight1.position.set(0, 25, 0);
  scene.add(pointLight1);

  // 侧光源1（雅金色，增强细节）
  const pointLight2 = new THREE.PointLight(0xD4AF37, 2, 100);
  pointLight2.position.set(15, 10, 15);
  scene.add(pointLight2);

  // 侧光源2（朱砂红，营造氛围）
  const pointLight3 = new THREE.PointLight(0xC73E1D, 1.5, 100);
  pointLight3.position.set(-15, 5, -15);
  scene.add(pointLight3);
  
  // 补充光源（从前方照亮留言板）
  const pointLight4 = new THREE.PointLight(0xffffff, 1.5, 100);
  pointLight4.position.set(0, 0, 30);
  scene.add(pointLight4);

  // 创建树组
  treeGroup = new THREE.Group();
  scene.add(treeGroup);

  // 使用粒子系统创建树身
  createFoliageTree();

  // 创建顶部星星
  createTopStar();

  // 创建装饰球（彩灯）
  createOrnaments();

  // 添加背景粒子效果
  createBackgroundParticles();

  // 创建照片挂饰（拍立得风格）
  if (photos.value.length > 0) {
    createPhotoOrnaments();
  }

  // 射线检测器（用于点击检测）
  raycaster = new Raycaster();

  // 鼠标/触摸事件
  renderer.domElement.addEventListener('click', onMouseClick);
  renderer.domElement.addEventListener('touchstart', onTouchStart);

  // 动画循环
  animate();
};

// 鼠标点击事件
const onMouseClick = (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  // 收集所有可点击的对象（照片和留言）
  const clickableObjects = [];
  messageOrnaments.forEach(({ group }) => {
    group.traverse((child) => {
      if (child.userData && child.userData.isClickable) {
        clickableObjects.push(child);
      }
    });
  });
  photoOrnaments.forEach(({ group }) => {
    group.traverse((child) => {
      if (child.userData && child.userData.isClickable) {
        clickableObjects.push(child);
      }
    });
  });
  
  const intersects = raycaster.intersectObjects(clickableObjects, true);
  
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    
    // 检查是否是照片
    if (clickedObject.userData && clickedObject.userData.type === 'photo') {
      selectedPhoto.value = clickedObject.userData.photo;
      // 预览照片
      const photoList = photos.value.filter(p => p.category !== 'video').map(p => p.imageUrl);
      const currentIndex = photoList.indexOf(selectedPhoto.value.imageUrl);
      if (currentIndex >= 0) {
        showImagePreview({
          images: photoList,
          startPosition: currentIndex
        });
      }
      return;
    }
    
    // 检查对象本身是否有消息数据
    if (clickedObject.userData && clickedObject.userData.message) {
      selectedMessage.value = clickedObject.userData.message;
      return;
    }
    
    // 向上查找父组（留言）
    let parent = clickedObject.parent;
    while (parent && parent !== scene) {
      const ornament = messageOrnaments.find(o => o.group === parent);
      if (ornament && ornament.message) {
        selectedMessage.value = ornament.message;
        break;
      }
      parent = parent.parent;
    }
  }
};

// 触摸事件
const onTouchStart = (event) => {
  event.preventDefault();
  const touch = event.touches[0];
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  // 收集所有可点击的对象（照片和留言）
  const clickableObjects = [];
  messageOrnaments.forEach(({ group }) => {
    group.traverse((child) => {
      if (child.userData && child.userData.isClickable) {
        clickableObjects.push(child);
      }
    });
  });
  photoOrnaments.forEach(({ group }) => {
    group.traverse((child) => {
      if (child.userData && child.userData.isClickable) {
        clickableObjects.push(child);
      }
    });
  });
  
  const intersects = raycaster.intersectObjects(clickableObjects, true);
  
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    
    // 检查是否是照片
    if (clickedObject.userData && clickedObject.userData.type === 'photo') {
      selectedPhoto.value = clickedObject.userData.photo;
      // 预览照片
      const photoList = photos.value.filter(p => p.category !== 'video').map(p => p.imageUrl);
      const currentIndex = photoList.indexOf(selectedPhoto.value.imageUrl);
      if (currentIndex >= 0) {
        showImagePreview({
          images: photoList,
          startPosition: currentIndex
        });
      }
      return;
    }
    
    // 向上查找父组（留言）
    let parent = clickedObject.parent;
    while (parent && parent !== scene) {
      const ornament = messageOrnaments.find(o => o.group === parent);
      if (ornament && ornament.message) {
        selectedMessage.value = ornament.message;
        break;
      }
      parent = parent.parent;
    }
  }
};

// 使用粒子系统创建树身（改进版）
const createFoliageTree = () => {
  const TREE_HEIGHT = 22;
  const TREE_RADIUS = 9;
  const PARTICLE_COUNT = 15000; // 增加粒子数量以提升清晰度和密度

  const getTreePosition = () => {
    const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2);
    const normalizedY = (y + (TREE_HEIGHT / 2)) / TREE_HEIGHT;
    const currentRadius = TREE_RADIUS * (1 - normalizedY);
    const theta = Math.random() * Math.PI * 2;
    const r = Math.random() * currentRadius;
    return [r * Math.cos(theta), y, r * Math.sin(theta)];
  };

  const initialPositions = new Float32Array(PARTICLE_COUNT * 3);
  const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
  const randoms = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = 25;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    initialPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    initialPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    initialPositions[i * 3 + 2] = radius * Math.cos(phi);

    const [tx, ty, tz] = getTreePosition();
    targetPositions[i * 3] = tx;
    targetPositions[i * 3 + 1] = ty;
    targetPositions[i * 3 + 2] = tz;

    randoms[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
  geometry.setAttribute('targetPos', new THREE.BufferAttribute(targetPositions, 3));
  geometry.setAttribute('random', new THREE.BufferAttribute(randoms, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x004225) }, // 纯正祖母绿，参考christmas-tree
      uProgress: { value: 1 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uProgress;
      attribute vec3 targetPos;
      attribute float random;
      varying float vMix;
      
      float cubicInOut(float t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
      }
      
      void main() {
        vec3 noise = vec3(
          sin(uTime * 1.5 + position.x),
          cos(uTime + position.y),
          sin(uTime * 1.5 + position.z)
        ) * 0.15;
        
        float t = cubicInOut(uProgress);
        vec3 finalPos = mix(position, targetPos + noise, t);
        
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_PointSize = (60.0 * (1.0 + random * 0.5)) / -mvPosition.z; // 更小的粒子尺寸，更细腻
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
        
        // 使用纯正的绿色，根据进度调整亮度
        vec3 finalColor = mix(uColor * 0.3, uColor * 1.2, vMix);
        
        // 添加柔和的发光效果
        float glow = 1.0 - r * 2.0;
        finalColor += glow * 0.3;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending // 使用加法混合，获得更好的发光效果
  });

  foliageParticles = new THREE.Points(geometry, material);
  treeGroup.add(foliageParticles);
};

// 创建顶部星星
const createTopStar = () => {
  const starShape = new THREE.Shape();
  const outerRadius = 0.8;
  const innerRadius = 0.4;
  const points = 5;

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) {
      starShape.moveTo(radius * Math.cos(angle), radius * Math.sin(angle));
    } else {
      starShape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
    }
  }
  starShape.closePath();

  const geometry = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05
  });

  const material = new THREE.MeshStandardMaterial({
    color: 0xD4AF37, // 雅金色
    emissive: 0xD4AF37,
    emissiveIntensity: 3.0,
    roughness: 0.1,
    metalness: 1.0
  });

  const star = new THREE.Mesh(geometry, material);
  star.position.y = 12;
  star.rotation.z = Math.PI / 2;
  star.scale.set(1.2, 1.2, 1.2);
  treeGroup.add(star);
};

// 创建装饰球（彩灯）
const createOrnaments = () => {
  const colors = [0xC73E1D, 0xD4AF37, 0xB8941F, 0xE8D5A3]; // 朱砂红和雅金色系
  const geometry = new THREE.SphereGeometry(0.3, 16, 16);
  const TREE_HEIGHT = 22;
  const TREE_RADIUS = 9;

  for (let i = 0; i < 100; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 3.0,
      roughness: 0.2,
      metalness: 0.6,
      toneMapped: false
    });
    const ornament = new THREE.Mesh(geometry, material);

    // 计算目标位置（树形位置）
    const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2);
    const normalizedY = (y + (TREE_HEIGHT / 2)) / TREE_HEIGHT;
    const currentRadius = (TREE_RADIUS * (1 - normalizedY)) + 0.3;
    const theta = Math.random() * Math.PI * 2;
    const targetPos = new THREE.Vector3(
      currentRadius * Math.cos(theta),
      y,
      currentRadius * Math.sin(theta)
    );
    
    // 混乱位置
    const chaosPos = new THREE.Vector3(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60
    );
    
    // 初始位置
    const initialPos = sceneState.value === 'FORMED' ? targetPos.clone() : chaosPos.clone();
    ornament.position.copy(initialPos);

    ornament.userData = {
      timeOffset: Math.random() * 100,
      speed: 2 + Math.random() * 3,
      chaosPos: chaosPos,
      targetPos: targetPos,
      currentPos: initialPos.clone()
    };

    treeGroup.add(ornament);
  }
};

// 创建照片挂饰（拍立得风格，参考christmas-tree项目）
const createPhotoOrnaments = () => {
  // 清除旧照片挂饰
  photoOrnaments.forEach(ornament => {
    if (ornament.group.parent) ornament.group.parent.remove(ornament.group);
  });
  photoOrnaments = [];

  photos.value.forEach((photo, index) => {
    const photoGroup = new THREE.Group();
    
    // 拍立得边框颜色（新中式风格）
    const borderColors = [0xFAF8F3, 0xD4AF37, 0xE8D5A3, 0xF5F1EB]; // 米白宣纸色、雅金色、浅金色
    const borderColor = borderColors[Math.floor(Math.random() * borderColors.length)];
    
    // 照片尺寸（随机大小）
    const isBig = Math.random() < 0.2;
    const baseScale = isBig ? 1.8 : 1.0 + Math.random() * 0.5;
    photoGroup.scale.set(baseScale, baseScale, baseScale);
    
    // 正面：照片
    const photoGeometry = new THREE.PlaneGeometry(1, 1);
    const textureLoader = new THREE.TextureLoader();
    const photoTexture = textureLoader.load(photo.imageUrl, 
      () => {
        // 加载成功
      },
      undefined,
      (err) => {
        console.warn('Photo load failed:', err);
      }
    );
    
    const photoMaterial = new THREE.MeshStandardMaterial({
      map: photoTexture,
      roughness: 0.5,
      metalness: 0,
      emissive: 0xffffff,
      emissiveMap: photoTexture,
      emissiveIntensity: 0.3
    });
    
    const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
    photoMesh.position.z = 0.02;
    photoMesh.userData.isClickable = true;
    photoMesh.userData.type = 'photo';
    photoMesh.userData.photo = photo;
    photoGroup.add(photoMesh);
    
    // 正面：边框
    const borderGeometry = new THREE.PlaneGeometry(1.2, 1.5);
    const borderMaterial = new THREE.MeshStandardMaterial({
      color: borderColor,
      roughness: 0.9,
      metalness: 0
    });
    const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
    borderMesh.position.set(0, -0.15, -0.01);
    photoGroup.add(borderMesh);
    
    // 背面：照片（双面拍立得）
    const backPhotoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
    backPhotoMesh.position.z = -0.02;
    backPhotoMesh.rotation.y = Math.PI;
    photoGroup.add(backPhotoMesh);
    
    const backBorderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
    backBorderMesh.position.set(0, -0.15, 0.01);
    backBorderMesh.rotation.y = Math.PI;
    photoGroup.add(backBorderMesh);
    
    // 计算目标位置（树形位置，贴近树表面但稍微突出以便看清）
    const TREE_HEIGHT = 22;
    const TREE_RADIUS = 9;
    const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2);
    const normalizedY = (y + (TREE_HEIGHT / 2)) / TREE_HEIGHT;
    const currentRadius = (TREE_RADIUS * (1 - normalizedY)) + 0.5; // 稍微突出，确保照片可见
    const theta = (index / photos.value.length) * Math.PI * 2 + Math.PI / photos.value.length; // 与留言错开
    const targetPos = new THREE.Vector3(
      currentRadius * Math.cos(theta),
      y,
      currentRadius * Math.sin(theta)
    );
    
    // 混乱位置（随机分散在空间中）
    const chaosPos = new THREE.Vector3(
      (Math.random() - 0.5) * 70,
      (Math.random() - 0.5) * 70,
      (Math.random() - 0.5) * 70
    );
    
    // 混乱旋转
    const chaosRotation = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    // 初始位置：根据当前状态决定
    const initialPos = sceneState.value === 'FORMED' ? targetPos.clone() : chaosPos.clone();
    photoGroup.position.copy(initialPos);
    
    // 添加摆动动画和位置数据
    photoGroup.userData = {
      wobbleOffset: Math.random() * 10,
      wobbleSpeed: 0.5 + Math.random() * 0.5,
      photo: photo,
      chaosPos: chaosPos,
      targetPos: targetPos,
      currentPos: initialPos.clone(),
      chaosRotation: chaosRotation,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 1.0,
        y: (Math.random() - 0.5) * 1.0,
        z: (Math.random() - 0.5) * 1.0
      },
      weight: 0.8 + Math.random() * 1.2
    };
    
    treeGroup.add(photoGroup);
    photoOrnaments.push({ group: photoGroup, photo: photo });
  });
};

// 创建Canvas纹理用于留言板文字
const createMessageTexture = (text, author) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 提高分辨率以获得更清晰的文字（使用设备像素比）
  const dpr = Math.min(window.devicePixelRatio || 2, 3); // 最高3倍分辨率
  const scale = dpr;
  
  // 根据文字长度动态调整画布大小（逻辑尺寸）
  const maxWidth = 300;
  const padding = 20;
  const lineHeight = 28;
  const authorHeight = 24;
  
  // 测量文字宽度（使用逻辑尺寸）
  ctx.font = 'bold 20px "Noto Serif SC", serif';
  const words = text.split('');
  let lines = [];
  let currentLine = '';
  
  // 自动换行
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth - padding * 2 && currentLine !== '') {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // 计算画布高度（逻辑尺寸）
  const textHeight = lines.length * lineHeight;
  const totalHeight = textHeight + authorHeight + padding * 3;
  
  // 设置实际画布尺寸（高分辨率）
  canvas.width = maxWidth * scale;
  canvas.height = totalHeight * scale;
  
  // 缩放上下文以匹配逻辑尺寸
  ctx.scale(scale, scale);
  
  // 重新设置字体（使用逻辑尺寸）
  ctx.font = 'bold 20px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // 绘制背景渐变（朱砂红色系）
  const cornerRadius = 12;
  const x = padding / 2;
  const y = padding / 2;
  const width = maxWidth - padding;
  const height = totalHeight - padding;
  
  // 创建渐变（朱砂红，新中式风格）
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  gradient.addColorStop(0, '#D85A3A'); // 亮朱砂红
  gradient.addColorStop(0.5, '#C73E1D'); // 中朱砂红
  gradient.addColorStop(1, '#A82E1A'); // 深朱砂红
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.lineTo(x + width - cornerRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
  ctx.lineTo(x + width, y + height - cornerRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
  ctx.lineTo(x + cornerRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
  ctx.lineTo(x, y + cornerRadius);
  ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
  ctx.closePath();
  ctx.fill();
  
  // 添加内阴影效果（使用渐变模拟）
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const shadowGradient = ctx.createLinearGradient(x, y, x, y + height * 0.3);
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGradient;
  ctx.fill();
  ctx.restore();
  
  // 添加金色边框高光
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 绘制白色文字（带阴影效果，增强可读性）
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let textY = padding + 12;
  lines.forEach((line) => {
    ctx.fillText(line, maxWidth / 2, textY);
    textY += lineHeight;
  });
  
  // 绘制作者名（使用稍微不同的样式）
  ctx.shadowBlur = 2;
  ctx.font = 'italic 18px "Noto Serif SC", serif';
  ctx.fillStyle = '#ffd700'; // 金色作者名
  ctx.fillText(`—— ${author}`, maxWidth / 2, textY + 8);
  
  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // 创建纹理（使用高分辨率）
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  // 设置纹理过滤模式以获得更清晰的显示
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
};

// 创建留言挂饰（红色贴纸留言板形式）
const createMessageOrnaments = () => {
  console.log('Creating message ornaments, count:', messages.value.length); // 调试日志
  // 清除旧挂饰
  messageOrnaments.forEach(ornament => {
    if (ornament.group.parent) ornament.group.parent.remove(ornament.group);
  });
  messageOrnaments = [];

  if (messages.value.length === 0) {
    console.warn('No messages to create ornaments');
    return;
  }

  messages.value.forEach((msg, index) => {
    console.log(`Creating ornament ${index} for message:`, msg); // 调试日志
    const ornamentGroup = new THREE.Group();
    
    // 创建留言板纹理
    const messageText = msg.content || '';
    const authorName = msg.guestName || '匿名';
    const texture = createMessageTexture(messageText, authorName);
    
    // 根据文字长度计算留言板尺寸（保持比例）
    const baseWidth = 2.5;
    const baseHeight = 3.5;
    const textLength = messageText.length;
    // 根据文字长度调整高度
    const heightMultiplier = Math.max(1, Math.ceil(textLength / 15) * 0.3);
    const noteWidth = baseWidth;
    const noteHeight = baseHeight + heightMultiplier;
      
    // 创建留言板平面（添加厚度感）
    const noteGeometry = new THREE.PlaneGeometry(noteWidth, noteHeight);
    const noteMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: texture,
      emissiveIntensity: 0.1 // 轻微自发光，增强可见性
      });
    const noteMesh = new THREE.Mesh(noteGeometry, noteMaterial);
    
    // 添加轻微的厚度（使用薄盒子）
    const thickness = 0.05;
    const backGeometry = new THREE.PlaneGeometry(noteWidth, noteHeight);
    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0xA82E1A, // 深朱砂红背面
      roughness: 0.8,
      metalness: 0
      });
    const backMesh = new THREE.Mesh(backGeometry, backMaterial);
    backMesh.position.z = -thickness;
    backMesh.rotation.y = Math.PI;
    ornamentGroup.add(backMesh);
    noteMesh.userData.isClickable = true;
    noteMesh.userData.message = msg;
    noteMesh.userData.type = 'message';
    ornamentGroup.add(noteMesh);

    // 留言板叠积在树上，不需要图钉和挂绳

    // 计算目标位置（树形位置，贴近树表面但稍微突出以便看清）
    const TREE_HEIGHT = 22;
    const TREE_RADIUS = 9;
    const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2);
    const normalizedY = (y + (TREE_HEIGHT / 2)) / TREE_HEIGHT;
    // 稍微突出一点，确保留言板内容可见（参考christmas-tree的+0.5，但稍微增加）
    const currentRadius = (TREE_RADIUS * (1 - normalizedY)) + 0.6;
    const theta = (index / messages.value.length) * Math.PI * 2;
    const targetPos = new THREE.Vector3(
      currentRadius * Math.cos(theta),
      y,
      currentRadius * Math.sin(theta)
    );

    // 计算法线方向，让留言板贴合树表面
    const normal = new THREE.Vector3(
      targetPos.x,
      0,
      targetPos.z
    ).normalize();
    
    // 混乱位置（随机分散在空间中）
    const chaosPos = new THREE.Vector3(
      (Math.random() - 0.5) * 70,
      (Math.random() - 0.5) * 70,
      (Math.random() - 0.5) * 70
    );
    
    // 混乱旋转
    const chaosRotation = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    // 初始位置：根据当前状态决定
    const initialPos = sceneState.value === 'FORMED' ? targetPos.clone() : chaosPos.clone();
    ornamentGroup.position.copy(initialPos);
    
    // 添加摆动动画和位置数据
    ornamentGroup.userData = {
      wobbleOffset: Math.random() * 10,
      wobbleSpeed: 0.5 + Math.random() * 0.5,
      message: msg,
      originalLookAt: null,
      chaosPos: chaosPos,
      targetPos: targetPos,
      currentPos: initialPos.clone(),
      chaosRotation: chaosRotation,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 2.0,
        y: (Math.random() - 0.5) * 2.0,
        z: (Math.random() - 0.5) * 2.0
      },
      weight: 0.8 + Math.random() * 1.2,
      normal: normal, // 存储法线方向，用于贴合树表面
      targetRotation: null // 目标旋转，用于贴合树表面
    };

    treeGroup.add(ornamentGroup);
    messageOrnaments.push({ group: ornamentGroup, message: msg });
  });
  
  console.log('Created message ornaments:', messageOrnaments.length); // 调试日志
};

  // 创建背景粒子效果（金粉粒子）
const createBackgroundParticles = () => {
  const particleCount = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xD4AF37, // 雅金色
    size: 0.8,
    transparent: true,
    opacity: 0.6
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
};

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate);

  const currentTime = Date.now() * 0.001;
  const delta = currentTime - lastFrameTime;
  lastFrameTime = currentTime;
  const clampedDelta = Math.min(delta, 0.1); // 限制最大delta，避免跳帧

  // 更新控制器（自动旋转）
  if (controls) {
    // 如果用户没有手动操作，保持自动旋转
    controls.update();
  }

  // 更新粒子系统
  if (foliageParticles && foliageParticles.material) {
    foliageParticles.material.uniforms.uTime.value = currentTime;
    const targetProgress = sceneState.value === 'FORMED' ? 1 : 0;
    const currentProgress = foliageParticles.material.uniforms.uProgress.value;
    foliageParticles.material.uniforms.uProgress.value += (targetProgress - currentProgress) * 0.05;
  }

  const isFormed = sceneState.value === 'FORMED';

  // 留言板位置和旋转动画
  messageOrnaments.forEach(({ group }) => {
    if (group.userData && group.userData.chaosPos && group.userData.targetPos) {
      const target = isFormed ? group.userData.targetPos : group.userData.chaosPos;
      const lerpSpeed = isFormed ? 0.8 * group.userData.weight : 0.5;
      group.userData.currentPos.lerp(target, clampedDelta * lerpSpeed);
      group.position.copy(group.userData.currentPos);

      if (isFormed && camera) {
        // 组装状态：贴近树但面向相机方向，确保内容可见
        // 参考christmas-tree项目，让留言板面向相机方向
        const targetLookPos = new THREE.Vector3(
          group.position.x * 2,
          group.position.y + 0.5,
          group.position.z * 2
        );
        group.lookAt(targetLookPos);
        
        // 添加轻微摆动
        const wobbleX = Math.sin(currentTime * group.userData.wobbleSpeed + group.userData.wobbleOffset) * 0.05;
        const wobbleZ = Math.cos(currentTime * group.userData.wobbleSpeed * 0.8 + group.userData.wobbleOffset) * 0.05;
      group.rotation.x += wobbleX;
      group.rotation.z += wobbleZ;
      } else {
        // 混乱状态：随机旋转
        group.rotation.x += clampedDelta * group.userData.rotationSpeed.x;
        group.rotation.y += clampedDelta * group.userData.rotationSpeed.y;
        group.rotation.z += clampedDelta * group.userData.rotationSpeed.z;
      }
    }
  });
  
  // 照片位置和旋转动画
  photoOrnaments.forEach(({ group }) => {
    if (group.userData && group.userData.chaosPos && group.userData.targetPos) {
      const target = isFormed ? group.userData.targetPos : group.userData.chaosPos;
      const lerpSpeed = isFormed ? 0.8 * group.userData.weight : 0.5;
      group.userData.currentPos.lerp(target, clampedDelta * lerpSpeed);
      group.position.copy(group.userData.currentPos);

      if (isFormed && camera) {
        // 组装状态：贴近树但面向相机方向，确保照片可见
        // 参考christmas-tree项目
        const targetLookPos = new THREE.Vector3(
          group.position.x * 2,
          group.position.y + 0.5,
          group.position.z * 2
        );
        group.lookAt(targetLookPos);
        
        // 添加轻微摆动
        const wobbleX = Math.sin(currentTime * group.userData.wobbleSpeed + group.userData.wobbleOffset) * 0.05;
        const wobbleZ = Math.cos(currentTime * group.userData.wobbleSpeed * 0.8 + group.userData.wobbleOffset) * 0.05;
      group.rotation.x += wobbleX;
      group.rotation.z += wobbleZ;
      } else {
        // 混乱状态：随机旋转
        group.rotation.x += clampedDelta * group.userData.rotationSpeed.x;
        group.rotation.y += clampedDelta * group.userData.rotationSpeed.y;
        group.rotation.z += clampedDelta * group.userData.rotationSpeed.z;
      }
    }
  });

  // 彩灯闪烁和位置动画
  treeGroup.children.forEach(child => {
    if (child.userData && child.userData.speed) {
      // 位置动画
      if (child.userData.chaosPos && child.userData.targetPos) {
        const target = isFormed ? child.userData.targetPos : child.userData.chaosPos;
        child.userData.currentPos.lerp(target, clampedDelta * 1.5);
        child.position.copy(child.userData.currentPos);
      }
      
      // 闪烁效果
      const intensity = (Math.sin(currentTime * child.userData.speed + child.userData.timeOffset) + 1) / 2;
      if (child.material) {
        child.material.emissiveIntensity = isFormed ? 2 + intensity * 4 : 0;
      }
    }
  });

  renderer.render(scene, camera);
};

// 窗口大小调整
const handleResize = () => {
  if (!treeContainer.value || !camera || !renderer) return;
  camera.aspect = treeContainer.value.clientWidth / treeContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(treeContainer.value.clientWidth, treeContainer.value.clientHeight);
};

// 加载留言数据
const loadMessages = async () => {
  try {
    const res = await getMessageList({ page: 1, size: 50 });
    console.log('Messages API response:', res); // 调试日志
    if (res && res.code === 0 && res.data && res.data.records && res.data.records.length > 0) {
      messages.value = res.data.records;
      console.log('Loaded messages:', messages.value.length); // 调试日志
    } else {
      // 如果没有数据，使用默认留言
      console.log('No messages from API, using default');
      messages.value = defaultMessages;
    }
  } catch (e) {
    console.warn('Load messages failed, using default data:', e);
    // 接口失败时使用默认留言
    messages.value = defaultMessages;
  }
  console.log('Final messages:', messages.value); // 调试日志
};

// 加载照片数据
const loadPhotos = async () => {
  try {
    const res = await getGalleryList();
    if (res && res.length > 0) {
      photos.value = res;
    } else {
      // 如果没有数据，使用默认照片
      photos.value = [
        { id: 1, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', category: 'photo' },
        { id: 2, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg', category: 'photo' },
        { id: 3, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg', category: 'photo' },
      ];
    }
  } catch (e) {
    console.warn('Load photos failed, using default data:', e);
    photos.value = [
      { id: 1, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', category: 'photo' },
      { id: 2, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg', category: 'photo' },
    ];
  }
};

// 监听 messages 变化，更新 3D 挂饰
watch(messages, () => {
  if (treeGroup) {
    createMessageOrnaments();
  }
}, { deep: true });

// 监听 photos 变化，更新 3D 照片挂饰
watch(photos, () => {
  if (treeGroup) {
    createPhotoOrnaments();
  }
}, { deep: true });

let cleanupParticles = null

onMounted(async () => {
  // 初始化金粉粒子动画
  cleanupParticles = initGoldParticles('goldParticles', {
    particleCount: 50,
    colors: ['#D4AF37', '#E8D5A3', '#B8941F']
  })
  
  const handleCanvasResize = () => {
    const canvas = document.getElementById('goldParticles')
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }
  window.addEventListener('resize', handleCanvasResize)
  
  // 先加载留言和照片数据
  await Promise.all([loadMessages(), loadPhotos()]);
  console.log('Data loaded - Messages:', messages.value.length, 'Photos:', photos.value.length);
  
  // 然后初始化3D场景（此时messages和photos都有数据了）
  setTimeout(() => {
    initThreeJS();
    // 初始化后创建挂饰，确保treeGroup和数据都已准备好
    setTimeout(() => {
      if (treeGroup) {
        console.log('Creating ornaments - treeGroup exists');
        if (messages.value.length > 0) {
          console.log('Creating message ornaments with', messages.value.length, 'messages');
          createMessageOrnaments();
        } else {
          console.warn('No messages to create ornaments');
        }
        if (photos.value.length > 0) {
          console.log('Creating photo ornaments with', photos.value.length, 'photos');
          createPhotoOrnaments();
        } else {
          console.warn('No photos to create ornaments');
        }
      } else {
        console.error('treeGroup is null!');
      }
    }, 300); // 增加延迟确保3D场景完全初始化
  }, 100);
  window.addEventListener('resize', handleResize);
  lastFrameTime = Date.now() * 0.001;
});

// 切换场景状态
const toggleSceneState = () => {
  sceneState.value = sceneState.value === 'FORMED' ? 'CHAOS' : 'FORMED';
  
  // 组装树后，调整相机位置使其更近（放大显示到最大）
  if (sceneState.value === 'FORMED' && camera && controls) {
    // 平滑移动到最近的位置（拉近到最大）
    // 同时调整FOV让树显示更大
    camera.fov = 30; // 减小视野角度，让树显示更大
    camera.updateProjectionMatrix();
    
    const targetDistance = 3; // 进一步减小距离，让树显示最大
    const currentDistance = camera.position.length();
    const direction = camera.position.clone().normalize();
    let distance = currentDistance;
    
    // 使用动画平滑过渡
    const animateCamera = () => {
      // 线性插值
      distance = distance + (targetDistance - distance) * 0.15; // 加快过渡速度
      camera.position.copy(direction.multiplyScalar(distance));
      controls.update();
      
      if (Math.abs(distance - targetDistance) > 0.3) {
        requestAnimationFrame(animateCamera);
      } else {
        // 确保到达目标距离
        camera.position.copy(direction.multiplyScalar(targetDistance));
        controls.update();
      }
    };
    animateCamera();
  } else if (sceneState.value === 'CHAOS' && camera && controls) {
    // 分散状态，恢复到较远的位置和正常FOV
    camera.fov = 35; // 恢复视野角度
    camera.updateProjectionMatrix();
    
    const targetDistance = 80;
    const currentDistance = camera.position.length();
    const direction = camera.position.clone().normalize();
    let distance = currentDistance;
    
    const animateCamera = () => {
      // 线性插值
      distance = distance + (targetDistance - distance) * 0.1;
      camera.position.copy(direction.multiplyScalar(distance));
      controls.update();
      
      if (Math.abs(distance - targetDistance) > 0.5) {
        requestAnimationFrame(animateCamera);
      }
    };
    animateCamera();
  }
};

onUnmounted(() => {
  if (cleanupParticles) {
    cleanupParticles()
  }
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) {
    if (renderer.domElement) {
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
    }
    renderer.dispose();
    if (treeContainer.value && renderer.domElement) {
      treeContainer.value.removeChild(renderer.domElement);
    }
  }
  if (controls) {
    controls.dispose();
  }
  window.removeEventListener('resize', handleResize);
});

const sendWish = async () => {
  if(!newMsg.value.trim()) {
    return showToast('写点什么吧~');
  }
  
  try {
    const res = await sendMessage({
      guestName: guestName.value.trim() || '匿名',
      content: newMsg.value
    });
    
    if (res && res.code === 0) {
    showToast('祝福已送达，审核后展示');
    showWrite.value = false;
    newMsg.value = '';
      guestName.value = '';
      await loadMessages();
    } else {
      showToast('发送失败，请稍后重试');
    }
  } catch (e) {
    console.error('Send message failed:', e);
    showToast('发送失败，请稍后重试');
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@300;500;700&display=swap');

.message-container {
  height: 100vh;
  background: var(--bg); /* 米白宣纸色 */
  overflow: hidden;
  position: relative;
  font-family: var(--font-family-body);
}

.page-glow {
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}

.gold-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.bg-texture {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(199, 62, 29, 0.02) 10px, rgba(199, 62, 29, 0.02) 20px);
  z-index: 0; pointer-events: none;
}

.nav-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 20px;
  position: absolute; top: 0; width: 100%; z-index: 10;
  box-sizing: border-box;
  background: transparent;
}

.nav-bar-simple {
  display: flex; justify-content: flex-end; align-items: center;
  padding: 15px 20px;
  position: absolute; top: 0; width: 100%; z-index: 10;
  box-sizing: border-box;
  background: transparent;
  backdrop-filter: none;
  border-bottom: none;
}
.back-btn { 
  color: var(--gold-dark); 
  font-size: 1.2rem; 
  cursor: pointer; 
  transition: transform 0.2s;
  font-family: var(--font-family);
}
.back-btn:active { transform: scale(0.9); }
.title { 
  font-size: 1.4rem; 
  color: var(--accent-solid); 
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family);
  letter-spacing: 1px;
}
.nav-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}
.assemble-btn {
  background: transparent;
  border: 2px solid var(--gold);
  color: var(--gold-dark);
  padding: 6px 15px;
  border-radius: 50px;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: var(--font-family);
  letter-spacing: 1px;
  transition: all 0.3s;
  font-weight: var(--font-weight-medium);
}
.assemble-btn:active {
  transform: scale(0.95);
  background: rgba(212, 175, 55, 0.1);
  box-shadow: var(--shadow-gold);
}
.write-btn { 
    background: transparent; 
    border: 2px solid var(--accent-solid); 
    color: var(--accent-solid); 
    padding: 6px 15px; 
    border-radius: 50px; 
    font-size: 0.9rem; 
    cursor: pointer;
    font-family: var(--font-family);
    letter-spacing: 1px;
    transition: all 0.3s;
    font-weight: var(--font-weight-medium);
}
.write-btn:active {
    transform: scale(0.95);
    background: rgba(199, 62, 29, 0.1);
    box-shadow: var(--shadow-sm);
}

.tree-3d-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  touch-action: none; /* 允许触摸旋转 */
  background: transparent; /* 确保背景透明，显示3D场景的深色背景 */
}

/* 留言展开卡片 */
.message-expand-card {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.card-content {
  background: var(--card-bg);
  border: 3px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: 30px;
  max-width: 80%;
  max-height: 70%;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease;
  position: relative;
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--gold);
  padding-bottom: 10px;
  position: relative;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--gold);
  border-radius: 2px;
}

.card-header h3 {
  color: var(--accent-solid);
  font-size: 1.5rem;
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-weight-bold);
}

.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent-solid);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid var(--gold);
}

.close-btn:hover {
  background: #8b0000;
  transform: scale(1.1);
}

.card-body {
  text-align: center;
}

.message-text {
  color: var(--text-primary);
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 20px;
  font-family: var(--font-family);
}

.message-author {
  color: var(--gold-dark);
  font-size: 1rem;
  font-style: italic;
  font-family: var(--font-family);
}

.write-panel { 
    padding: 30px 20px; 
    text-align: center;
    font-family: var(--font-family); 
    background: var(--card-bg);
}
.write-panel h3 {
    color: var(--accent-solid);
    margin-bottom: 20px;
    font-size: 1.3rem;
    font-family: var(--font-family);
    font-weight: var(--font-weight-bold);
}
.send-btn {
    width: 100%; 
    background-image: var(--accent); 
    color: #fff; 
    border: 2px solid var(--gold); 
    padding: 12px;
    border-radius: var(--radius-sm); 
    font-size: 1rem; 
    margin-top: 20px;
    cursor: pointer;
    transition: all 0.3s;
    font-family: var(--font-family);
    font-weight: var(--font-weight-bold);
    box-shadow: var(--shadow-accent);
}
.send-btn:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-sm);
}
</style>

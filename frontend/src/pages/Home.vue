<template>
  <div class="home-page">
    <!-- 全屏祝福飘屏背景 -->
    <MessageBarrage
      ref="messageBarrage"
      :auto-start="true"
      :show-controls="false"
      :show-input="false"
      :max-blessings="30"
      :show-sender="false"
      :speed="1.0"
      :opacity="0.6"
      :is-fullscreen="true"
      class="fullscreen-barrage"
      @blessing-click="handleBarrageClick"
      @like="handleBarrageLike"
    />

    <!-- 柔光圆形背景 -->
    <div class="page-glow"></div>

    <!-- 金粉粒子背景 -->
    <canvas id="goldParticles" class="gold-particles"></canvas>
    
    <!-- 音乐控制按钮 -->
    <div 
      class="music-control" 
      :class="{ 'playing': isMusicPlaying }"
      @click="toggleMusic"
    >
      <div class="music-bar music-bar-1"></div>
      <div class="music-bar music-bar-2"></div>
      <div class="music-bar music-bar-3"></div>
    </div>
    
    <!-- 背景音乐 -->
    <audio 
      ref="bgmAudio" 
      :src="bgmUrl"
      preload="auto"
      autoplay
      playsinline
      webkit-playsinline
      @play="isMusicPlaying = true"
      @pause="isMusicPlaying = false"
    ></audio>
    
    <!-- 顶部导航栏 -->
    <header class="home-header">
      <div class="home-header__logo">
        <div class="logo-badge">{{ babyName.charAt(0) }}</div>
        <div class="logo-text">
          <div class="logo-text__name">{{ babyName }} · 百日宴</div>
          <div class="logo-text__date">{{ partyDate }}</div>
        </div>
      </div>
      <div class="theme-toggle" @click="toggleTheme">
        <span class="theme-toggle__text">{{ isDark ? '浅色' : '深色' }}</span>
      </div>
    </header>

    <!-- 封面内容 -->
    <div class="home-cover">
      <div class="cover-photo">
        <template v-if="homeCoverUrl">
          <img
            class="cover-photo__image"
            :src="homeCoverUrl"
            alt="宝宝照片"
            @error="handleCoverImageError"
            @load="handleCoverImageLoad"
          />
        </template>
        <template v-else>
          <div class="cover-photo__placeholder">
            
          </div>
        </template>
      </div>
      
      <h1 class="cover-title">{{ babyName }} · 百日之喜</h1>
      <h1 class="cover-title">乔迁新居·进火之喜</h1>
      <p class="cover-subtitle">{{ partyDate }} · {{ partyAddress }}</p>
    </div>


    <!-- 邀请函内容 -->
    <div class="invite-content" ref="invitationSection">
      <!-- 合并后的请帖主卡片：祝福 + 双喜说明 + 邀请人信息 -->
      <div class="blessing-section">
        <div class="blessing-header">
          <div class="blessing-icon">🧧</div>
          <h3 class="blessing-title">诚挚邀请</h3>
        </div>
        <p class="blessing-text" v-html="invitationBlessing"></p>

        <div class="blessing-extra">
          <p class="blessing-extra__title">双喜同庆 · 百日 · 乔迁</p>
          <p class="blessing-extra__desc">
            从呱呱坠地到百日圆满，新居焕彩迎宾朋<div/>
            愿与您共享这份喜悦与感动！
          </p>
          <p class="blessing-extra__host">
            敬邀：{{ hostNames }}<div/> 携爱子 {{ babyName }}
          </p>
          <p class="blessing-extra__sign">恭候您的到来</p>
        </div>
      </div>

      <!-- 写真展示（首页仅预览固定数量，点击进入全屏浏览器） -->
      <section class="photo-showcase" ref="photoSection">
        <div class="section-heading">
          <div class="section-heading__icon">📸</div>
          <div class="section-heading__text">
            <h3>精选</h3>
          </div>
        </div>

        <div
          v-for="(set, idx) in photoSets"
          :key="idx"
          class="photo-set"
        >
          <div class="photo-grid">
            <div
              v-for="(photo, pIndex) in set.photos"
              :key="pIndex"
              class="photo-card"
              @click="openPhotoViewer(idx, pIndex)"
            >
              <img
                class="photo-card__image"
                :src="photo.url"
                :alt="photo.caption || set.title"
                @error="handlePhotoError"
              />
              <div class="photo-card__caption" v-if="photo.caption">{{ photo.caption }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 地点与操作 -->
      <BabyCard>
        <div class="location-info" @click="showMapSheet = true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="margin-right: 8px;">
            <path d="M10 10.833a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 18.333c-4.167 0-7.5-3.333-7.5-7.5 0-5.833 7.5-10.833 7.5-10.833s7.5 5 7.5 10.833c0 4.167-3.333 7.5-7.5 7.5z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <div>
            <div class="location-info__text">{{ partyAddress }}</div>
            <div class="location-info__hint">（点击开启导航）</div>
          </div>
        </div>
      </BabyCard>

      <!-- 简化的送祝福输入区域 -->
      <div class="simple-blessing-input">
        <div class="input-with-button">
          <input
            v-model="newBlessing"
            @keyup.enter="sendBlessing"
            placeholder="写下您的祝福..."
            class="simple-blessing-field"
            maxlength="20"
          />
          <div class="char-counter">
            {{ newBlessing.length }}/20
          </div>
          <BabyButton
            type="primary"
            :disabled="!newBlessing.trim()"
            @click="sendBlessing"
            class="simple-send-btn"
            size="small"
          >
            送祝福
          </BabyButton>
        </div>
      </div>
    </div>

    <!-- 地图选择 -->
    <van-action-sheet
      v-model:show="showMapSheet"
      :actions="mapActions"
      cancel-text="取消"
      description="请选择地图进行导航"
      close-on-click-action
      @select="onSelectMap"
    />

    <!-- 管理员登录（隐藏功能） -->
    <van-dialog 
      v-model:show="showAdminLogin" 
      title="管理员验证" 
      show-cancel-button 
      @confirm="checkAdminPassword"
    >
      <div style="padding: 20px;">
        <input 
          type="password" 
          v-model="adminPassword" 
          placeholder="请输入管理密码" 
          style="width: 100%; padding: 10px; border: 1px solid var(--muted); border-radius: var(--radius-sm); text-align: center;"
        />
      </div>
    </van-dialog>
  </div>

  <!-- 首页写真全屏浏览器 -->
  <ImageViewer
    :images="flattenedPhotos"
    :index="photoViewerIndex"
    :open="photoViewerOpen"
    @update:open="photoViewerOpen = $event"
    @update:index="photoViewerIndex = $event"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { gsap } from 'gsap'
import BabyButton from '../components/Button.vue'
import BabyCard from '../components/Card.vue'
import MessageBarrage from '../components/MessageBarrage.vue'
import ImageViewer from '../components/ImageViewer.vue'
import { ThemeManager } from '../utils/theme'
import { initGoldParticles, slideInAnimation, bounceInAnimation } from '../utils/animations'
import { useConfig } from '../utils/configStore'
import { sendMessage } from '../api/message'
import { getGalleryList } from '../api/gallery'

const router = useRouter()
const { loadConfig, getValue } = useConfig()
const messageBarrage = ref(null)
const newBlessing = ref('')
const invitationSection = ref(null)
const photoSection = ref(null)

// 首页写真两区数据
const photoSets = ref([
  { title: '写真一区', description: '', photos: [] },
  { title: '写真二区', description: '', photos: [] }
])
const MAX_ZONE_PREVIEW = 4
const photoViewerOpen = ref(false)
const photoViewerIndex = ref(0)

// 动态配置
const babyName = computed(() => getValue('baby_name', '屹琛小朋友'))
const partyDate = computed(() => getValue('party_date', '2026-01-10 12:18'))
const partyAddress = computed(() => getValue('party_address', '祁阳鑫利大酒店四楼1号会议厅'))
const homeCoverUrl = computed(() => getValue('home_cover_thumb', '') || getValue('home_cover_image', ''))
const hostNames = computed(() => getValue('host_names', '严蓬春 · 田梦'))
const invitationBlessing = computed(() => {
  const defaultText = '祥龙贺岁，福满人间！<br>金猴纳福，瑞气盈门！'
  const raw = getValue('invitation_blessing', '')
  return raw || defaultText
})

// 背景音乐
const bgmUrl = computed(() => {
  // 可以从配置中读取音乐URL，如果没有则使用默认值
  // 获取音乐URL的方法：
  // 1. 网易云音乐：搜索"无敌小可爱"，从歌曲页面URL获取ID，格式：https://music.163.com/song/media/outer/url?id=歌曲ID.mp3
  // 2. 其他平台：QQ音乐、酷狗音乐等也有类似的外链格式
  // 3. 自己上传：将音乐文件上传到服务器或CDN，使用完整URL
  // 4. 通过后台配置：在后台管理页面设置 bgm_url 配置项
  
  // 备选音乐URL列表（可以切换测试，修改索引号即可）：
  const musicOptions = [
    // 选项0：当前默认音乐
    'https://music.163.com/song/media/outer/url?id=1860587682.mp3',
    
    // 选项1：网易云音乐 - "无敌小可爱"（需要替换为实际歌曲ID）
    // 快速获取方法：
    // 1. 访问 https://music.163.com
    // 2. 搜索"无敌小可爱"
    // 3. 打开歌曲页面，从地址栏复制ID（例如：https://music.163.com/#/song?id=123456789，ID是123456789）
    // 4. 使用格式：https://music.163.com/song/media/outer/url?id=123456789.mp3
    // 'https://music.163.com/song/media/outer/url?id=替换为歌曲ID.mp3',
    
    // 选项2：其他温馨音乐（可以搜索"宝宝 轻音乐"、"温馨 背景音乐"等）
    // 'https://music.163.com/song/media/outer/url?id=另一个歌曲ID.mp3',
    
    // 选项3：QQ音乐格式（需要替换为实际歌曲ID）
    // 'https://aqqmusic.tc.qq.com/amobile.music.tc.qq.com/歌曲ID.mp3',
    
    // 选项4：如果上传到自己的服务器，使用完整URL
    // 'https://your-domain.com/audio/wudi-xiaokeai.mp3',
  ]
  
  // 默认使用第一个，或从配置中读取
  // 要切换音乐，可以修改这里的索引号：musicOptions[0] 改为 musicOptions[1] 等
  const defaultUrl = musicOptions[0]
  return getValue('bgm_url', defaultUrl)
})
const bgmAudio = ref(null)
const isMusicPlaying = ref(false)
const hasUserInteracted = ref(false)
const bgmStartAt = 58 // 秒，进入首页后从该时间开始播放（可根据需要调整）
let bgmSeekApplied = false
let bgmSeekListenerAttached = false
let bgmAutoPlayTried = false
let bgmMutedUntilGesture = true

// 背景音乐调试日志
const logBgmEvent = (eventName, extra = {}) => {
  const audio = bgmAudio.value
  const info = {
    event: eventName,
    src: audio?.currentSrc || audio?.src || bgmUrl.value,
    readyState: audio?.readyState,
    networkState: audio?.networkState,
    paused: audio?.paused,
    ...extra
  }
  console.log('[BGM]', info)
}

const ensureBgmOffset = () => {
  const audio = bgmAudio.value
  if (!audio || bgmSeekApplied || !Number.isFinite(bgmStartAt) || bgmStartAt <= 0) return

  if (audio.readyState >= 1 && Number.isFinite(audio.duration)) {
    const target = Math.min(bgmStartAt, Math.max(0, audio.duration - 0.5))
    try {
      audio.currentTime = target
      bgmSeekApplied = true
      logBgmEvent('seek-applied', { currentTime: audio.currentTime, duration: audio.duration })
    } catch (err) {
      console.warn('BGM seek failed:', err)
    }
    return
  }

  if (!bgmSeekListenerAttached) {
    bgmSeekListenerAttached = true
    audio.addEventListener('loadedmetadata', () => {
      bgmSeekListenerAttached = false
      ensureBgmOffset()
    }, { once: true })
  }
}

const playBgm = async (reason = 'manual') => {
  if (!bgmAudio.value) return
  // 首次交互前保持静音，交互后恢复音量
  if (bgmMutedUntilGesture && reason !== 'autoplay') {
    bgmMutedUntilGesture = false
    bgmAudio.value.muted = false
  }
  ensureBgmOffset()
  try {
    await bgmAudio.value.play()
    logBgmEvent('play-request-success', { reason, currentTime: bgmAudio.value.currentTime })
  } catch (err) {
    logBgmEvent('play-request-fail', { reason, error: err?.message })
    throw err
  }
}

// 扁平化后的全部写真，用于全屏浏览器
const flattenedPhotos = computed(() =>
  photoSets.value.flatMap(set =>
    set.photos.map(p => ({
      ...p,
      imageUrl: p.url,    // 适配 ImageViewer 的字段
      thumbUrl: p.url
    }))
  )
)

// 主题切换
const isDark = ref(false)
const toggleTheme = () => {
  const newTheme = ThemeManager.toggleTheme()
  isDark.value = newTheme === 'dark'
}

// 打开首页写真全屏浏览器
const openPhotoViewer = (zoneIndex, photoIndex) => {
  const sets = photoSets.value
  if (!sets || !sets[zoneIndex]) return

  let index = 0
  for (let i = 0; i < zoneIndex; i++) {
    index += sets[i].photos.length
  }
  index += photoIndex

  if (index < 0 || index >= flattenedPhotos.value.length) return

  photoViewerIndex.value = index
  photoViewerOpen.value = true
}

// 长页锚点
const scrollToInvitation = () => {
  nextTick(() => {
    invitationSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const scrollToPhotos = () => {
  nextTick(() => {
    photoSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// 处理弹幕点击
const handleBarrageClick = (danmu) => {
  showToast(`${danmu.guestName || danmu.name}: ${danmu.content || danmu.text}`)
}

// 处理弹幕点赞
const handleBarrageLike = (danmu) => {
  danmu.isLiked = !danmu.isLiked
}

// 处理封面图片加载错误
const handleCoverImageError = (event) => {
  console.error('Cover image failed to load:', event.target.src, event)
  showToast('封面图片加载失败')
}

// 处理封面图片加载成功
const handleCoverImageLoad = (event) => {
  console.log('Cover image loaded successfully:', event.target.src)
}

const handlePhotoError = (event) => {
  event.target.style.opacity = '0.4'
  event.target.alt = '图片加载失败'
}

// 发送祝福
const sendBlessing = async () => {
  const content = newBlessing.value.trim()

  if (!content) {
    showToast('请先输入祝福内容')
    return
  }

  if (content.length > 20) {
    showToast('祝福内容不能超过20个字符')
    return
  }

  try {
    const response = await sendMessage({
      content: content,
      guestName: '祝福者'
    })

    if (response.code === 0) {
      showSuccessToast('祝福发送成功！✨')
      const sentBlessing = newBlessing.value.trim()
      newBlessing.value = ''

      // 立即在飘屏中显示新祝福
      if (messageBarrage.value) {
        messageBarrage.value.addBlessing({
          id: Date.now(),
          guestName: '祝福者',
          content: content,
          likes: 0,
          isLiked: false,
          createTime: new Date().toISOString(),
          status: 1
        })
      }
    } else {
      showToast(response.msg || '发送失败，请稍后重试')
    }
  } catch (error) {
    console.error('发送祝福失败:', error)
    showToast('发送失败，请检查网络连接')
  }
}

// 地图导航
const showMapSheet = ref(false)
const BASE_LNG = 111.836
const BASE_LAT = 26.5755
const LOC_NAME = '祁阳鑫利大酒店'
const LOC_ADDR = '四楼1号会议厅'

const gcj02ToBd09 = (lng, lat) => {
  const x_PI = 3.14159265358979324 * 3000.0 / 180.0
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI)
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI)
  return { 
    lng: z * Math.cos(theta) + 0.0065, 
    lat: z * Math.sin(theta) + 0.006 
  }
}

const mapActions = [
  { name: '高德地图 (推荐)', color: '#0091ff', type: 'gaode' },
  { name: '百度地图', color: '#d32f2f', type: 'baidu' },
  { name: '腾讯地图', color: '#00c853', type: 'tencent' },
]

const onSelectMap = (action) => {
  let url = ''
  if (action.type === 'baidu') {
    const bd = gcj02ToBd09(BASE_LNG, BASE_LAT)
    url = `http://api.map.baidu.com/marker?location=${bd.lat},${bd.lng}&title=${encodeURIComponent(LOC_NAME)}&content=${encodeURIComponent(LOC_ADDR)}&output=html&src=webapp.baidu.openAPIdemo`
  } else if (action.type === 'gaode') {
    url = `https://uri.amap.com/marker?position=${BASE_LNG},${BASE_LAT}&name=${encodeURIComponent(LOC_NAME)}&src=invitation&coordinate=gaode&callnative=1`
  } else if (action.type === 'tencent') {
    url = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${BASE_LAT},${BASE_LNG};title:${encodeURIComponent(LOC_NAME)};addr:${encodeURIComponent(LOC_ADDR)}`
  }
  window.location.href = url
}

// 管理员彩蛋
const showAdminLogin = ref(false)
const adminPassword = ref('')
let clickCount = 0
let clickTimer = null

const checkAdminPassword = () => {
  if (adminPassword.value === '123456') {
    localStorage.setItem('token', 'fake-admin-token')
    showSuccessToast('管理员模式已开启')
    router.push('/admin/dashboard')
  } else {
    showToast('密码错误')
    adminPassword.value = ''
  }
}

// 音乐控制
const toggleMusic = () => {
  if (!bgmAudio.value) return
  
  if (isMusicPlaying.value) {
    bgmAudio.value.pause()
  } else {
    playBgm('toggle').catch(err => {
      console.warn('播放音乐失败:', err)
      showToast('音乐播放失败，请检查网络或稍后重试')
    })
  }
}

// 初始化
let cleanupParticles = null

// 用户交互处理函数
let handleFirstInteraction = null

onMounted(async () => {
  // 为了通过部分浏览器的自动播放策略，先静音，等待用户交互后再还原
  if (bgmAudio.value) {
    bgmAudio.value.muted = true
  }

  // 监听用户首次交互，自动播放音乐
  handleFirstInteraction = () => {
    if (!hasUserInteracted.value && bgmAudio.value) {
      hasUserInteracted.value = true
      // 交互后取消静音再尝试播放
      bgmMutedUntilGesture = false
      bgmAudio.value.muted = false
      playBgm('first-interaction').catch(err => {
        // 若仍因策略限制失败，静默处理，用户可点击按钮再次尝试
        logBgmEvent('first-interaction-play-fail', { error: err?.message })
      })
    }
  }

  // 音频事件调试
  const tryAutoPlay = (reason = 'unknown') => {
    if (!bgmAudio.value || bgmAutoPlayTried) return
    bgmAutoPlayTried = true
    playBgm('autoplay').then(() => {
      logBgmEvent('autoplay-success', { reason })
    }).catch(err => {
      bgmAutoPlayTried = false // 允许后续交互再次尝试
      console.warn('BGM autoplay failed:', err)
      logBgmEvent('autoplay-fail', { reason, error: err?.message })
    })
  }

  const attachAudioDebug = () => {
    if (!bgmAudio.value) return
    const a = bgmAudio.value
    a.addEventListener('loadedmetadata', () => {
      // 每次音频源或元数据变更时重置偏移标记，确保始终从 bgmStartAt 开始
      bgmSeekApplied = false
      logBgmEvent('loadedmetadata', { duration: a.duration })
      ensureBgmOffset()
    })
    a.addEventListener('canplay', () => {
      logBgmEvent('canplay')
      ensureBgmOffset()
      tryAutoPlay('canplay')
    })
    a.addEventListener('play', () => logBgmEvent('play'))
    a.addEventListener('pause', () => logBgmEvent('pause'))
    a.addEventListener('ended', () => {
      // 一首播放结束：不自动循环，标记下次从 bgmStartAt 重新开始
      bgmSeekApplied = false
      logBgmEvent('ended', { currentTime: a.currentTime })
      try {
        // 重置到 0，下一次点击播放时会通过 ensureBgmOffset 跳到 60s
        a.currentTime = 0
      } catch (err) {
        console.warn('reset currentTime on ended failed:', err)
      }
    })
    a.addEventListener('stalled', () => logBgmEvent('stalled'))
    a.addEventListener('error', () => logBgmEvent('error', { error: a.error }))
    logBgmEvent('init')
  }
  attachAudioDebug()
  tryAutoPlay('mounted')
  
  // 监听页面点击、触摸等交互事件
  document.addEventListener('click', handleFirstInteraction, { once: true })
  document.addEventListener('touchstart', handleFirstInteraction, { once: true })
  ThemeManager.init()
  isDark.value = ThemeManager.getTheme() === 'dark'

  // 加载动态配置（宝宝姓名、时间、地点等）
  loadConfig()

  // 加载首页写真分区（从相册接口按 zone=1 / 2 读取）
  try {
    const [zone1, zone2] = await Promise.all([
      getGalleryList({ zone: 1 }),
      getGalleryList({ zone: 2 })
    ])

    const toPhotos = (list) => {
      if (!Array.isArray(list)) return []
      return list
        .filter(item => item.category === 'photo')
        .map(item => ({
          url: item.imageUrl || item.thumbUrl,
          caption: item.description || ''
        }))
    }

    const list1 = Array.isArray(zone1?.data) ? zone1.data : []
    const list2 = Array.isArray(zone2?.data) ? zone2.data : []

    photoSets.value[0].photos = toPhotos(list1)
    photoSets.value[1].photos = toPhotos(list2)
  } catch (e) {
    console.warn('加载首页写真失败，将继续使用默认占位布局', e)
  }

  await nextTick()

  // GSAP 页面进入动画
  const pageTl = gsap.timeline()

  // 1. 顶部导航滑入
  const header = document.querySelector('.home-header')
  if (header) {
    gsap.set(header, { y: -50, opacity: 0 })
    pageTl.to(header, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    })
  }

  // 2. 封面照片从右侧滑入
  const coverPhoto = document.querySelector('.cover-photo')
  if (coverPhoto) {
    gsap.set(coverPhoto, { x: 100, opacity: 0, scale: 0.8 })
    pageTl.to(coverPhoto, {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)"
    }, "-=0.3")
  }

  // 3. 标题和副标题依次出现
  const coverTitle = document.querySelector('.cover-title')
  const coverSubtitle = document.querySelector('.cover-subtitle')
  const coverActions = document.querySelector('.cover-actions')

  gsap.set([coverTitle, coverSubtitle, coverActions], { opacity: 0, y: 30 })

  pageTl.to(coverTitle, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.4")

  pageTl.to(coverSubtitle, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.3")

  // 4. 操作按钮弹入
  pageTl.to(coverActions, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "back.out(1.7)"
  }, "-=0.3")

  // 5. 邀请函内容区域依次滑入
  const inviteContent = document.querySelector('.invite-content')
  if (inviteContent) {
    const locationInfo = inviteContent.querySelector('.location-info')
    const actionButtons = inviteContent.querySelector('.action-buttons')

    gsap.set([locationInfo, actionButtons], { opacity: 0, x: -50 })

    pageTl.to(locationInfo, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.2")

    pageTl.to(actionButtons, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")
  }

  // 6. 添加封面照片的持续动画
  if (coverPhoto) {
    gsap.to(coverPhoto, {
      y: -8,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2
    })
  }

  // 初始化金粉粒子动画
  cleanupParticles = initGoldParticles('goldParticles', {
    particleCount: 60,
    colors: ['#D4AF37', '#E8D5A3', '#B8941F']
  })

  // 窗口大小改变时重新调整 canvas
  const handleResize = () => {
    const canvas = document.getElementById('goldParticles')
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }
  window.addEventListener('resize', handleResize)
  
  // 标题点击触发管理员入口（点击5次）
  const titleEl = document.querySelector('.cover-title')
  if (titleEl) {
    titleEl.addEventListener('click', () => {
      clickCount++
      if (clickTimer) clearTimeout(clickTimer)
      clickTimer = setTimeout(() => { clickCount = 0 }, 1000)
      if (clickCount >= 5) {
        showAdminLogin.value = true
        clickCount = 0
      }
    })
  }
})

onUnmounted(() => {
  if (cleanupParticles) {
    cleanupParticles()
  }
  // 清理事件监听器
  if (handleFirstInteraction) {
    document.removeEventListener('click', handleFirstInteraction)
    document.removeEventListener('touchstart', handleFirstInteraction)
  }
  // 停止音乐
  if (bgmAudio.value) {
    bgmAudio.value.pause()
    bgmAudio.value = null
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  padding-top: calc(var(--safe-area-top) + var(--spacing-md));
  padding-bottom: calc(var(--safe-area-bottom) + var(--spacing-md));
  position: relative;
  z-index: 2;
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
  z-index: 0;
}

/* 音乐控制按钮 */
.music-control {
  position: fixed;
  top: calc(var(--safe-area-top) + var(--spacing-md) + 50px);
  right: var(--spacing-md);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 99;
  cursor: pointer;
  transition: all var(--transition-base);
}

.music-control:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.music-bar {
  width: 3px;
  background: var(--accent-solid);
  border-radius: 2px;
  height: 10px;
  transition: height 0.3s ease;
}

.music-control.playing .music-bar-1 {
  animation: musicDance 0.5s infinite alternate;
}

.music-control.playing .music-bar-2 {
  animation: musicDance 0.7s infinite alternate;
}

.music-control.playing .music-bar-3 {
  animation: musicDance 0.6s infinite alternate;
}

@keyframes musicDance {
  from {
    height: 8px;
  }
  to {
    height: 20px;
  }
}

/* 深色模式下的音乐按钮 */
[data-theme='dark'] .music-control {
  background: rgba(37, 32, 24, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .music-control:hover {
  background: rgba(37, 32, 24, 1);
}

[data-theme='dark'] .music-bar {
  background: var(--gold);
}

/* 顶部导航栏 */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.home-header__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-badge {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-image: var(--accent);
  border: 2px solid var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: var(--font-weight-bold);
  font-size: 18px;
  font-family: var(--font-family);
  box-shadow: var(--shadow-gold);
}

.logo-text__name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-body);
  color: var(--text-primary);
  font-family: var(--font-family);
}

.logo-text__date {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.theme-toggle {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
}

.theme-toggle:hover {
  background: var(--muted);
}

/* 封面区域 */
.home-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.cover-photo {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFEFF5, #FFDDEE);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.cover-photo__image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.cover-photo__placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFEFF5, #FFDDEE);
  color: var(--text-secondary);
  font-size: 18px;
}

.cover-title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
  font-family: var(--font-family);
  text-shadow: 0 2px 8px rgba(199, 62, 29, 0.1);
}

.cover-subtitle {
  font-size: var(--font-size-body);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl);
}

.cover-actions {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-actions__hint {
  margin-top: var(--spacing-sm);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-small);
  color: var(--accent-solid);
  animation: hint-bounce 1.4s ease-in-out infinite;
}

.hint-arrow {
  font-size: 14px;
}

@keyframes hint-bounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

/* 全屏祝福飘屏 */
.fullscreen-barrage {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* 让祝福飘屏在背景层级，但内容可以点击 */
.fullscreen-barrage .blessing-barrage {
  position: absolute;
  width: 100%;
  height: 100%;
}

.fullscreen-barrage .barrage-viewport {
  pointer-events: auto;
}

/* 简化的送祝福输入区域 */
.simple-blessing-input {
  margin-top: var(--spacing-md);
}

.input-with-button {
  position: relative;
  display: flex;
  align-items: stretch;
  border: 2px solid var(--divider-color);
  border-radius: var(--radius-lg);
  background: var(--background);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  overflow: hidden; /* 确保圆角正确显示 */
}

.input-with-button:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.simple-blessing-field {
  flex: 1;
  min-width: 0; /* 允许压缩 */
  padding: var(--spacing-sm) var(--spacing-md);
  border: none; /* 移除单独边框 */
  border-radius: 0; /* 移除圆角 */
  background: transparent; /* 透明背景 */
  color: var(--text-primary);
  font-size: var(--font-size-body);
  font-family: var(--font-family-body);
  outline: none;
  transition: none; /* 移除过渡，由父容器处理 */
}

.simple-blessing-field:focus {
  outline: none;
  box-shadow: none; /* 移除单独阴影 */
}

.simple-blessing-field::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.simple-send-btn {
  flex-shrink: 0; /* 不被压缩 */
  white-space: nowrap;
  margin-left: 8px; /* 与计数器保持间距 */
  font-weight: 500;
}

.char-counter {
  flex-shrink: 0; /* 不被压缩 */
  margin-left: 8px; /* 与按钮保持间距 */
  font-size: 12px;
  color: var(--text-secondary);
  background: transparent; /* 完全透明 */
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center; /* 垂直居中 */
  height: 100%; /* 占满容器高度 */
}

/* 移动端适配 - 紧凑布局 */
@media (max-width: 768px) {
  .char-counter {
    font-size: 11px; /* 稍微小一点的字体 */
    padding: 1px 4px; /* 更小的内边距 */
    margin-left: 6px; /* 缩小间距 */
  }

  .simple-send-btn {
    padding: var(--spacing-sm) var(--spacing-sm); /* 缩小内边距 */
    font-size: var(--font-size-small); /* 缩小字体 */
    margin-left: 6px; /* 缩小间距 */
  }
}

/* 平板适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .simple-send-btn {
    min-width: 90px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

/* 邀请函内容 */
.invite-content {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}


.location-info {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  color: var(--text-primary);
}

.location-info svg {
  color: var(--gold);
  flex-shrink: 0;
}

.location-info__text {
  font-size: var(--font-size-body);
  margin-bottom: var(--spacing-xs);
}

.location-info__hint {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

/* 响应式 */
@media (max-width: 360px) {
  .cover-photo {
    width: 180px;
    height: 180px;
  }
}

/* 请帖主体（移植自电子请帖页面的风格化块） */
.blessing-section {
  background: linear-gradient(135deg, #FFF 0%, #FAF8F3 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(212, 175, 55, 0.2);
  text-align: center;
}

.blessing-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.blessing-icon {
  font-size: 28px;
  animation: sparkle 2s ease-in-out infinite;
}

.blessing-title {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: 0;
}

.blessing-text {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.8;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.05) rotate(90deg); }
  50% { transform: scale(1) rotate(180deg); }
  75% { transform: scale(1.05) rotate(270deg); }
}

.blessing-extra {
  margin-top: var(--spacing-lg);
  border-top: 1px dashed rgba(212, 175, 55, 0.4);
  padding-top: var(--spacing-md);
  text-align: center;
}

.blessing-extra__title {
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin-bottom: var(--spacing-xs);
}

.blessing-extra__desc {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: var(--spacing-sm);
}

.blessing-extra__host {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  margin: 0;
}

.blessing-extra__sign {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-body);
  color: var(--accent-solid);
  font-weight: var(--font-weight-medium);
}

/* 深色模式适配 - 邀请函区域 */
[data-theme='dark'] .blessing-section {
  background: linear-gradient(135deg, #252018 0%, #1F1A14 100%);
  border-color: rgba(212, 175, 55, 0.3);
  box-shadow: 0 4px 20px rgba(199, 62, 29, 0.3), 0 0 8px rgba(212, 175, 55, 0.15);
}

[data-theme='dark'] .blessing-extra {
  border-top-color: rgba(212, 175, 55, 0.3);
}

/* 写真展示 */
.photo-showcase {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.section-heading__icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: var(--shadow-sm);
}

.section-heading__text h3 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}

.section-heading__text p {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
}

.photo-set {
  background: linear-gradient(135deg, #FFF 0%, #FAF8F3 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: relative;
  overflow: hidden;
}

/* 深色模式适配 - 写真区域 */
[data-theme='dark'] .photo-set {
  background: linear-gradient(135deg, #252018 0%, #1F1A14 100%);
  border-color: rgba(212, 175, 55, 0.3);
  box-shadow: 0 4px 20px rgba(199, 62, 29, 0.3), 0 0 8px rgba(212, 175, 55, 0.15);
}

[data-theme='dark'] .photo-set::after {
  background: linear-gradient(to left, rgba(37, 32, 24, 0.95) 0%, transparent 100%);
}

/* 右侧滚动提示渐变遮罩 */
/* 右侧滚动提示渐变遮罩（反馈：容易形成明显阴影，先关闭） */
.photo-set::after {
  display: none;
}

.photo-set__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.set-name {
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  font-size: 16px;
}

.set-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-small);
}

.photo-grid {
  display: grid;
  grid-template-rows: repeat(2, auto);
  grid-auto-flow: column;
  grid-auto-columns: minmax(140px, 1fr);
  gap: var(--spacing-md);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding-bottom: var(--spacing-sm);
  position: relative;
  z-index: 0;
  /* 滚动条样式 - 桌面端 */
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 175, 55, 0.5) rgba(212, 175, 55, 0.1);
}

/* Webkit 浏览器滚动条样式 - 桌面端 */
.photo-grid::-webkit-scrollbar {
  height: 8px;
}

.photo-grid::-webkit-scrollbar-track {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 4px;
}

.photo-grid::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.6);
  border-radius: 4px;
}

.photo-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.8);
}

/* 移动端滚动条增强 */
@media (max-width: 768px) {
  .photo-grid {
    padding-bottom: var(--spacing-md);
    /* 移动端滚动条更明显 */
    scrollbar-width: auto;
    scrollbar-color: rgba(212, 175, 55, 0.7) rgba(212, 175, 55, 0.15);
  }

  .photo-grid::-webkit-scrollbar {
    height: 10px;
  }

  .photo-grid::-webkit-scrollbar-track {
    background: rgba(212, 175, 55, 0.15);
    border-radius: 5px;
  }

  .photo-grid::-webkit-scrollbar-thumb {
    background: rgba(212, 175, 55, 0.7);
    border-radius: 5px;
    border: 1px solid rgba(212, 175, 55, 0.3);
  }

  .photo-grid::-webkit-scrollbar-thumb:active {
    background: rgba(212, 175, 55, 0.9);
  }

  /* 移动端渐变遮罩更明显 */
  .photo-set::after {
    display: none;
  }

  [data-theme='dark'] .photo-set::after {
    display: none;
  }
}

.photo-card {
  overflow: hidden;
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.photo-card__image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.photo-card__caption {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-small);
  color: var(--text-primary);
}

/* 深色模式适配 - 照片卡片 */
[data-theme='dark'] .photo-card {
  background: var(--card-bg);
  box-shadow: 0 2px 12px rgba(199, 62, 29, 0.2);
}

@media (max-width: 480px) {
  .invitation-details {
    grid-template-columns: 1fr;
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>

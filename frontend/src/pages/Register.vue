<template>
  <div class="register-page">
    <!-- 柔光圆形背景 -->
    <div class="page-glow"></div>
    
    <!-- 金粉粒子背景 -->
    <canvas id="goldParticles" class="gold-particles"></canvas>
    
    <!-- 顶部导航 -->
    <header class="register-header">
      <button class="back-button" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <h1 class="register-title">出席确认</h1>
      <div style="width: 60px;"></div>
    </header>

    <div class="register-content">
      <!-- 表单卡片 -->
      <BabyCard>
        <template #header>
          <div class="form-header">
            <h2 class="form-header__title">赴宴登记</h2>
            <p class="form-header__subtitle">KINDLY REGISTER YOUR ATTENDANCE</p>
            <p class="form-header__tip">
              <span class="form-header__tip-label">温馨提示</span>
              <span class="form-header__tip-text">
                若您来不及登记，也无需担心，我们同样为您预留坐席，静候您的到来。
              </span>
            </p>
          </div>
        </template>

        <form @submit.prevent="onSubmit">
          <!-- 姓名 -->
          <BabyInput
            v-model="form.name"
            label="阁下姓名"
            placeholder="请输入您的姓名"
            required
            :error="errors.name"
          />

          <!-- 手机号 -->
          <BabyInput
            v-model="form.phone"
            label="联系电话"
            type="tel"
            placeholder="便于联系 (选填)"
            :error="errors.phone"
            hint="用于确认和联系"
          />

          <!-- 人数选择 -->
          <div class="form-row">
            <div class="form-row__item">
              <label class="form-label">成人</label>
              <Stepper
                v-model="form.adultCount"
                :min="0"
                :max="20"
              />
            </div>
            <div class="form-row__item">
              <label class="form-label">儿童</label>
              <Stepper
                v-model="form.childCount"
                :min="0"
                :max="20"
              />
            </div>
          </div>

          <!-- 住宿选项 -->
          <div class="switch-group">
            <label class="switch-label">是否需要安排住宿？</label>
            <van-switch 
              v-model="form.needHotel" 
              :active-color="accentColor"
              size="20px" 
            />
          </div>

          <!-- 住宿人数（条件显示） -->
          <BabyInput
            v-if="form.needHotel"
            v-model.number="form.hotelCount"
            label="住宿人数"
            type="number"
            placeholder="请输入住宿人数"
            :error="errors.hotelCount"
          />

          <!-- 备注 -->
          <BabyInput
            v-model="form.remarks"
            label="备注"
            type="textarea"
            placeholder="过敏信息、特殊需求等（选填）"
            :rows="3"
            :maxlength="200"
            :show-word-limit="true"
          />

          <!-- 提交按钮 -->
          <div class="submit-area">
            <BabyButton 
              type="primary" 
              :loading="loading"
              :disabled="loading"
              @click="onSubmit"
            >
              {{ loading ? '提交中...' : '确认出席' }}
            </BabyButton>
          </div>
        </form>
      </BabyCard>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { registerGuest } from '../api/guest'
import { showToast, showSuccessToast } from 'vant'
import BabyButton from '../components/Button.vue'
import BabyCard from '../components/Card.vue'
import BabyInput from '../components/Input.vue'
import Stepper from '../components/Stepper.vue'
import { initGoldParticles } from '../utils/animations'

const router = useRouter()

const loading = ref(false)
const form = reactive({
  name: '',
  phone: '',
  adultCount: 1,
  childCount: 0,
  needHotel: false,
  hotelCount: 0,
  remarks: ''
})

const errors = reactive({
  name: '',
  phone: '',
  hotelCount: ''
})

const accentColor = computed(() => {
  return getComputedStyle(document.documentElement).getPropertyValue('--accent-solid') || '#C73E1D'
})

let cleanupParticles = null

onMounted(() => {
  // 初始化金粉粒子动画
  cleanupParticles = initGoldParticles('goldParticles', {
    particleCount: 40,
    colors: ['#D4AF37', '#E8D5A3', '#B8941F']
  })
  
  const handleResize = () => {
    const canvas = document.getElementById('goldParticles')
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }
  window.addEventListener('resize', handleResize)
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  if (cleanupParticles) {
    cleanupParticles()
  }
})

// 表单验证
const validate = () => {
  errors.name = ''
  errors.phone = ''
  errors.hotelCount = ''

  if (!form.name.trim()) {
    errors.name = '请填写姓名'
    return false
  }

  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入正确的手机号'
    return false
  }

  if (form.needHotel && form.hotelCount <= 0) {
    errors.hotelCount = '请填写住宿人数'
    return false
  }

  return true
}

const onSubmit = async () => {
  if (!validate()) {
    return
  }

  loading.value = true
  try {
    const res = await registerGuest({
      name: form.name,
      phone: form.phone,
      adultCount: form.adultCount,
      childCount: form.childCount,
      needHotel: form.needHotel ? 1 : 0,
      hotelCount: Number(form.hotelCount),
      remarks: form.remarks
    })
    
    showSuccessToast('登记成功，期待您的光临！')
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (e) {
    // error handled by request.js
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  padding: var(--spacing-md);
  padding-top: calc(var(--safe-area-top) + var(--spacing-md));
  padding-bottom: calc(var(--safe-area-bottom) + var(--spacing-md));
  position: relative;
  z-index: 1;
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

.register-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: 0;
  color: var(--text-primary);
  font-size: var(--font-size-body);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.back-button:hover {
  background: var(--muted);
}

.register-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-family);
}

.register-content {
  max-width: 100%;
}

.form-header {
  text-align: center;
}

.form-header__title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: 0 0 var(--spacing-xs);
  font-family: var(--font-family);
}

.form-header__subtitle {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-header__tip {
  margin-top: var(--spacing-md);
  padding: 6px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--accent-solid);
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.form-header__tip-label {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent-solid);
  color: #fff;
  font-size: 11px;
}

.form-header__tip-text {
  color: var(--text-secondary);
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-row__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.switch-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}

.switch-label {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.submit-area {
  margin-top: var(--spacing-xl);
  display: flex;
  justify-content: center;
}

.submit-area :deep(.baby-button) {
  width: 100%;
  max-width: 300px;
}
</style>

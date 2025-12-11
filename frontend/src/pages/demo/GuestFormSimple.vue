<template>
  <div class="simple-guest-form">
    <div class="simple-header">
      <div style="font-weight: 700">出席确认</div>
    </div>
    <div class="simple-card" style="margin-top: 12px">
      <div class="simple-form-row">
        <input v-model="form.name" class="simple-input" placeholder="请输入您的姓名" />
        <input v-model="form.phone" class="simple-input" placeholder="联系电话 (选填)" />
        <div style="display: flex; gap: 10px; margin-top: 8px">
          <div style="flex: 1">
            <div class="simple-small">成人</div>
            <div style="display: flex; align-items: center; gap: 8px">
              <button class="simple-btn" @click="onAdultsDecClick">-</button>
              <div>{{ form.adults }}</div>
              <button class="simple-btn" @click="onAdultsIncClick">+</button>
            </div>
          </div>
          <div style="flex: 1">
            <div class="simple-small">儿童</div>
            <div style="display: flex; align-items: center; gap: 8px">
              <button class="simple-btn" @click="onKidsDecClick">-</button>
              <div>{{ form.kids }}</div>
              <button class="simple-btn" @click="onKidsIncClick">+</button>
            </div>
          </div>
        </div>

        <div style="margin-top: 12px">
          <div class="simple-small">是否需要安排住宿?</div>
          <label style="display: inline-flex; align-items: center; gap: 8px; margin-top: 8px">
            <input type="checkbox" v-model="form.needHotel" />
            <span class="simple-small">需要</span>
          </label>
        </div>

        <textarea
          v-model="form.remarks"
          class="simple-input"
          placeholder="过敏信息、特殊需求等 (选填)"
          style="height: 100px; margin-top: 12px"
        ></textarea>

        <div style="margin-top: 16px; text-align: center">
          <button class="simple-btn simple-btn-primary" @click="onSubmitClick" :disabled="state.loading">
            {{ state.loading ? '提交中…' : '确认出席' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  name: '',
  phone: '',
  adults: 1,
  kids: 0,
  needHotel: false,
  remarks: ''
})

const state = reactive({ loading: false, error: null })

function validateForm() {
  if (!form.name || !form.name.trim()) return '请输入姓名'
  // phone optional
  return null
}

async function onSubmitClick() {
  if (state.loading) return
  const err = validateForm()
  if (err) {
    alert(err)
    return
  }
  state.loading = true
  try {
    // simulate submit
    await new Promise(r => setTimeout(r, 800))
    alert('登记成功，感谢确认！')
  } catch (e) {
    alert('提交失败')
  } finally {
    state.loading = false
  }
}

/* steppers (single-purpose functions) */
function onAdultsIncClick() {
  form.adults++
}

function onAdultsDecClick() {
  if (form.adults > 1) form.adults--
}

function onKidsIncClick() {
  form.kids++
}

function onKidsDecClick() {
  if (form.kids > 0) form.kids--
}
</script>

<style scoped>
.simple-guest-form {
  padding: 12px;
  min-height: 100vh;
  background: var(--bg);
}

.simple-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: env(safe-area-inset-top);
}

.simple-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 14px;
  box-shadow: var(--shadow-soft);
}

.simple-form-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.simple-input {
  height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0 12px;
  background: transparent;
}

.simple-small {
  font-size: 13px;
  color: var(--text-secondary);
}

.simple-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  padding: 0 16px;
  height: 44px;
  border: 1px solid var(--gold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.simple-btn-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 8px 18px rgba(201, 62, 46, 0.14);
}
</style>


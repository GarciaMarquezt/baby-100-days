<template>
  <div class="simple-gallery-wall">
    <div class="simple-header" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center">
      <div style="font-weight: 700">相册与祝福</div>
      <div class="simple-small">共 {{ images.length }} 张 · {{ messages.length }} 条祝福</div>
    </div>

    <div class="simple-card" style="padding: 10px">
      <div style="display: flex; gap: 8px; margin-bottom: 8px">
        <button
          class="simple-btn"
          :class="tab === 'gallery' ? 'simple-btn-primary' : 'simple-btn-ghost'"
          @click="onTabGalleryClick"
        >
          相册
        </button>
        <button
          class="simple-btn"
          :class="tab === 'wall' ? 'simple-btn-primary' : 'simple-btn-ghost'"
          @click="onTabWallClick"
        >
          祝福墙
        </button>
        <input
          v-model="filter"
          placeholder="搜索昵称"
          class="simple-input"
          style="flex: 1; border-radius: 10px; height: 40px; padding: 8px"
        />
      </div>

      <div v-if="tab === 'gallery'">
        <div class="simple-gallery-grid">
          <div
            v-for="(img, idx) in imagesFiltered"
            :key="img.id"
            class="simple-gallery-item"
            @click="onOpenViewer(idx)"
          >
            <img :src="img.url" />
          </div>
        </div>
      </div>

      <div v-else>
        <div style="margin-bottom: 10px">
          <textarea
            v-model="newMsg"
            placeholder="写下你的祝福..."
            style="width: 100%; height: 80px; border-radius: 12px; padding: 8px; border: 1px solid var(--border-color)"
          ></textarea>
          <div style="display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end">
            <input type="file" ref="fileRef" @change="onFile" style="display: none" />
            <button class="simple-btn simple-btn-ghost" @click="onPickFileClick">上传图片</button>
            <button class="simple-btn simple-btn-primary" @click="onPostMsgClick" :disabled="state.loading">
              {{ state.loading ? '发布中…' : '发表祝福' }}
            </button>
          </div>
        </div>

        <div>
          <MessageItemSimple v-for="m in messages" :key="m.id" :msg="m" @like="onLikeMsg" />
        </div>
      </div>
    </div>

    <ImageViewerSimple v-if="viewer.open" :images="images" :index="viewer.index" @close="onCloseViewer" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ImageViewerSimple from '../../components/simple/ImageViewer.vue'
import MessageItemSimple from '../../components/simple/MessageItem.vue'

const tab = ref('gallery')
const filter = ref('')
const images = ref([])
const messages = ref([])
const viewer = reactive({ open: false, index: 0 })
const newMsg = ref('')
const fileRef = ref(null)
const state = reactive({ loading: false, error: null })

function onTabGalleryClick() {
  tab.value = 'gallery'
}

function onTabWallClick() {
  tab.value = 'wall'
}

function onOpenViewer(idx) {
  viewer.index = idx
  viewer.open = true
}

function onCloseViewer() {
  viewer.open = false
}

function onPickFileClick() {
  if (fileRef.value) fileRef.value.click()
}

function onFile(e) {
  const f = e.target.files[0]
  if (!f) return
  const url = URL.createObjectURL(f)
  images.value.unshift({ id: Date.now(), url })
}

async function onPostMsgClick() {
  if (state.loading) return
  const err = validateMsg()
  if (err) {
    alert(err)
    return
  }
  state.loading = true
  try {
    // simulate upload
    await new Promise(r => setTimeout(r, 600))
    messages.value.unshift({
      id: Date.now(),
      name: '匿名',
      text: newMsg.value,
      likes: 0,
      time: new Date().toLocaleString()
    })
    newMsg.value = ''
    alert('留言已提交，待审核')
  } catch (e) {
    alert('提交失败')
  } finally {
    state.loading = false
  }
}

function validateMsg() {
  if (!newMsg.value.trim()) return '请输入留言'
  return null
}

function onLikeMsg(id) {
  const m = messages.value.find(x => x.id === id)
  if (m) m.likes++
}

const imagesFiltered = computed(() =>
  images.value.filter(i => !filter.value || (i.title && i.title.includes(filter.value)))
)

onMounted(() => {
  // mock data
  images.value = Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/baby${i}/600/600`
  }))
  messages.value = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    name: `亲友${i + 1}`,
    text: `祝宝宝幸福安康！ (${i + 1})`,
    likes: Math.floor(Math.random() * 20),
    time: new Date().toLocaleString()
  }))
})
</script>

<style scoped>
.simple-gallery-wall {
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

.simple-small {
  font-size: 13px;
  color: var(--text-secondary);
}

.simple-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 14px;
  box-shadow: var(--shadow-soft);
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

.simple-btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.simple-input {
  height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0 12px;
  background: transparent;
}

.simple-gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.simple-gallery-item {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #fff0f6, #ffeef6);
  padding-top: 100%;
}

.simple-gallery-item img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>


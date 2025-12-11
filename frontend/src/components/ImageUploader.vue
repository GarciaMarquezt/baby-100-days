<template>
  <div class="image-uploader">
    <input
      ref="fileInput"
      type="file"
      accept="image/*,video/*"
      multiple
      style="display: none"
      @change="handleFileChange"
    />
    <button class="image-uploader__button" @click="triggerFileInput">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>上传图片</span>
    </button>
    
    <div v-if="previews.length > 0" class="image-uploader__previews">
      <div
        v-for="(preview, index) in previews"
        :key="index"
        class="image-uploader__preview"
      >
        <template v-if="preview.isVideo">
          <video
            :src="preview.url"
            :title="preview.name"
            muted
            playsinline
            loop
          ></video>
          <div class="image-uploader__badge">视频</div>
        </template>
        <template v-else>
          <img :src="preview.url" :alt="preview.name" />
        </template>

        <div class="image-uploader__status" v-if="preview.status !== 'pending'">
          <span v-if="preview.status === 'success'">已上传</span>
          <span v-else-if="preview.status === 'error'">失败</span>
        </div>

        <button class="image-uploader__remove" @click="removePreview(index)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="uploading" class="image-uploader__progress">
      <div class="image-uploader__progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
    </div>

    <button
      v-if="hasFailed && !uploading"
      class="image-uploader__retry"
      @click="retryFailed"
    >
      重新上传失败的文件
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { uploadImage } from '../utils/api'

const props = defineProps({
  multiple: {
    type: Boolean,
    default: true
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  }
})

const emit = defineEmits(['uploaded', 'error'])

const fileInput = ref(null)
const previews = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const hasFailed = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = async (e) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  hasFailed.value = false

  // 验证文件大小
  for (const file of files) {
    if (file.size > props.maxSize) {
      emit('error', `文件 ${file.name} 超过 ${props.maxSize / 1024 / 1024}MB`)
      continue
    }

    // 判断是否为视频（用于支持 Live Photo 的视频部分）
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|m4v)$/i.test(file.name)

    // 创建预览
    const url = URL.createObjectURL(file)
    previews.value.push({
      file,
      url,
      name: file.name,
      isVideo,
      status: 'pending'
    })
  }

  // 上传文件
  if (previews.value.length > 0) {
    await uploadFiles()
  }

  // 清空 input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 简单图片压缩：限制最大边长并降低 JPEG 质量
const compressImage = (file, maxWidth = 1600, maxHeight = 1600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('canvas.toBlob failed'))
            return
          }
          const compressedFile = new File([blob], file.name.replace(/\.(png|webp)$/i, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = reject

    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const uploadFiles = async () => {
  uploading.value = true
  uploadProgress.value = 0

  try {
    const results = []
    let completed = 0
    hasFailed.value = false

    for (const preview of previews.value) {
      // 仅上传待处理或失败的
      if (preview.status === 'success') {
        completed++
        continue
      }

      preview.status = 'uploading'
      try {
        let fileToUpload = preview.file
        // 如果是普通图片（非视频），尝试在前端压缩，减少上传体积
        if (!preview.isVideo && preview.file && preview.file.type.startsWith('image/')) {
          try {
            fileToUpload = await compressImage(preview.file)
          } catch (e) {
            console.warn('compress image failed, upload original file', e)
          }
        }

        const result = await uploadImage(fileToUpload)
        preview.status = 'success'
        results.push({
          success: true,
          url: result.url,
          name: preview.name,
          isVideo: preview.isVideo
        })
      } catch (error) {
        preview.status = 'error'
        hasFailed.value = true
        results.push({
          success: false,
          error: error.message || '上传失败',
          name: preview.name,
          isVideo: preview.isVideo
        })
      } finally {
        completed++
        uploadProgress.value = Math.round((completed / previews.value.length) * 100)
      }
    }

    emit('uploaded', results)

    // 移除已成功的预览，保留失败的以便重试
    previews.value = previews.value.filter(preview => {
      if (preview.status === 'success') {
        URL.revokeObjectURL(preview.url)
        return false
      }
      return true
    })
  } catch (error) {
    emit('error', error.message || '上传失败')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const retryFailed = async () => {
  if (!previews.value.some(p => p.status === 'error')) return
  await uploadFiles()
}

const removePreview = (index) => {
  const preview = previews.value[index]
  URL.revokeObjectURL(preview.url)
  previews.value.splice(index, 1)
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.image-uploader__button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--muted);
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.image-uploader__button:hover {
  background: var(--muted-dark);
}

.image-uploader__previews {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.image-uploader__preview {
  position: relative;
  padding-top: 100%;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--muted);
}

.image-uploader__preview img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-uploader__preview video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-uploader__badge {
  position: absolute;
  left: 4px;
  bottom: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
}

.image-uploader__status {
  position: absolute;
  left: 4px;
  top: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}

.image-uploader__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 0;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-base);
}

.image-uploader__remove:hover {
  background: rgba(0, 0, 0, 0.8);
}

.image-uploader__progress {
  margin-top: var(--spacing-sm);
  height: 4px;
  background: var(--muted);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.image-uploader__progress-bar {
  height: 100%;
  background-image: var(--accent);
  transition: width var(--transition-base);
}

.image-uploader__retry {
  margin-top: var(--spacing-sm);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 0;
  font-size: var(--font-size-small);
  color: #fff;
  background: var(--accent-solid);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>


<template>
  <div class="page-admin">
    <div class="upload-area">
        <van-uploader 
            v-model="fileList" 
            :after-read="afterRead" 
            accept="image/*,video/*"
        >
          <div class="upload-placeholder">
             <van-icon name="plus" size="30" />
             <p>点击上传照片或视频</p>
          </div>
        </van-uploader>
    </div>
    
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="grid-layout">
            <div class="photo-box" v-for="item in list" :key="item.id">
                <template v-if="item.category === 'video'">
                    <video :src="item.imageUrl" class="img" muted></video>
                    <div class="video-badge">VIDEO</div>
                </template>
                <template v-else>
                    <van-image 
                    :src="item.imageUrl" 
                    fit="cover"
                    class="img"
                    />
                </template>
                <div class="del-btn" @click="handleDelete(item)"><van-icon name="cross" /></div>
            </div>
        </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getGalleryList, deleteGallery, uploadUrl } from '../../api/admin';
import request from '../../utils/request'; // 直接引用 request 用于上传
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant';

const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(0);
const fileList = ref([]); // 仅用于上传组件显示，实际不展示在这里

const onLoad = async () => {
  page.value++;
  try {
    const res = await getGalleryList({ page: page.value, size: 15 });
    if (res.code === 0) {
      if (page.value === 1) list.value = [];
      list.value.push(...res.data.records);
      loading.value = false;
      if (list.value.length >= res.data.total) {
        finished.value = true;
      }
    } else {
        loading.value = false;
        finished.value = true;
    }
  } catch (e) {
    loading.value = false;
    finished.value = true;
  }
};

const afterRead = async (fileInfo) => {
    // fileInfo.file 是 File 对象
    const file = fileInfo.file;
    const toast = showLoadingToast({ message: '上传中...', forbidClick: true, duration: 0 });
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        // 使用 request 实例发送上传请求，它会自动带上 Token
        const res = await request.post(uploadUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (res.code === 0) {
            closeToast();
            showToast('上传成功');
            // 刷新列表
            page.value = 0;
            finished.value = false;
            loading.value = true;
            list.value = [];
            onLoad();
        } else {
            closeToast();
            showToast(res.msg || '上传失败');
        }
    } catch (e) {
        closeToast();
        showToast('上传失败');
    }
    // 清空上传组件的预览
    fileList.value = [];
};

const handleDelete = (item) => {
    showDialog({ title: '确认删除?', showCancelButton: true }).then(async (action) => {
        if(action === 'confirm') {
            const res = await deleteGallery({ id: item.id });
            if (res.code === 0) {
                showToast('已删除');
                list.value = list.value.filter(i => i.id !== item.id);
            }
        }
    });
};
</script>

<style scoped>
.page-admin { padding: 15px; }
.upload-area { 
  background: #fff; padding: 20px; text-align: center; border-radius: 8px; 
  margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex; justify-content: center;
}
.upload-placeholder { color: #999; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; gap: 5px; }

.grid-layout { 
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; 
}
.photo-box { position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; background: #000; }
.img { width: 100%; height: 100%; object-fit: cover; }
.video-badge {
    position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff;
    font-size: 10px; text-align: center; padding: 2px 0;
}
.del-btn { 
  position: absolute; top: 0; right: 0; background: rgba(0,0,0,0.5); 
  color: #fff; padding: 4px; border-bottom-left-radius: 4px; z-index: 2;
}
</style>

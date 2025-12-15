<template>
  <div class="page-admin">
    <!-- 区域选择器 -->
    <div class="zone-selector">
      <van-tabs v-model:active="activeZone" @change="onZoneChange">
        <van-tab title="写真一区" name="1"></van-tab>
        <van-tab title="写真二区" name="2"></van-tab>
      </van-tabs>
    </div>

    <!-- 批量操作栏 -->
    <div class="batch-actions" v-if="isBatchMode">
      <div class="batch-info">
        已选择 {{ selectedIds.length }} 项
      </div>
      <div class="batch-buttons">
        <van-button size="small" @click="handleBatchMove(1)">迁移到一区</van-button>
        <van-button size="small" @click="handleBatchMove(2)">迁移到二区</van-button>
        <van-button size="small" type="danger" @click="handleBatchDelete">批量删除</van-button>
        <van-button size="small" @click="exitBatchMode">取消</van-button>
      </div>
    </div>

    <div class="upload-area">
        <van-uploader 
            v-model="fileList" 
            :after-read="afterRead" 
            accept="image/*,video/*"
        >
          <div class="upload-placeholder">
             <van-icon name="plus" size="30" />
             <p>点击上传照片或视频</p>
             <p class="upload-zone-hint">当前区域：{{ activeZone === '1' ? '写真一区' : '写真二区' }}</p>
          </div>
        </van-uploader>
    </div>

    <!-- 批量模式切换按钮 -->
    <div class="mode-toggle">
      <van-button 
        size="small" 
        :type="isBatchMode ? 'primary' : 'default'"
        @click="toggleBatchMode"
      >
        {{ isBatchMode ? '退出批量' : '批量操作' }}
      </van-button>
    </div>
    
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="grid-layout">
            <div class="photo-box" v-for="item in list" :key="item.id" :class="{ 'selected': isSelected(item.id) }">
                <!-- 批量选择复选框 -->
                <div class="checkbox-wrapper" v-if="isBatchMode">
                  <van-checkbox 
                    :model-value="isSelected(item.id)"
                    @update:model-value="toggleSelect(item.id)"
                  />
                </div>
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
                <div class="zone-badge" v-if="item.zone">
                  {{ item.zone === 1 ? '一区' : '二区' }}
                </div>
                <div class="del-btn" v-if="!isBatchMode" @click="handleDelete(item)"><van-icon name="cross" /></div>
                <div class="edit-btn" v-if="!isBatchMode" @click="handleEdit(item)">
                  <van-icon name="edit" />
                </div>
            </div>
        </div>
    </van-list>

    <!-- 编辑弹窗 -->
    <van-dialog 
      v-model:show="showEditDialog" 
      title="编辑照片" 
      show-cancel-button
      @confirm="handleSaveEdit"
    >
      <div class="edit-form">
        <van-field
          :model-value="editForm.zone === 1 ? '写真一区' : '写真二区'"
          label="所属区域"
          placeholder="选择区域"
          readonly
          is-link
          @click="showZonePicker = true"
        />
      </div>
    </van-dialog>

    <!-- 区域选择器弹窗 -->
    <van-action-sheet
      v-model:show="showZonePicker"
      :actions="zoneActions"
      cancel-text="取消"
      description="请选择所属区域"
      close-on-click-action
      @select="onZoneSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getGalleryList, deleteGallery, updateGallery, batchMoveGallery, batchDeleteGallery, uploadUrl } from '../../api/admin';
import request from '../../utils/request'; // 直接引用 request 用于上传
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant';

const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(0);
const fileList = ref([]); // 仅用于上传组件显示，实际不展示在这里
const activeZone = ref('1'); // 当前选中的区域：1 或 2
const showEditDialog = ref(false);
const showZonePicker = ref(false);
const editForm = ref({
  id: null,
  zone: 1
});
const zoneActions = [
  { name: '写真一区', value: 1 },
  { name: '写真二区', value: 2 }
];

// 批量操作相关
const isBatchMode = ref(false);
const selectedIds = ref([]);

// 区域切换
const onZoneChange = (name) => {
  activeZone.value = name;
  // 重置列表并重新加载
  page.value = 0;
  finished.value = false;
  loading.value = true;
  list.value = [];
  onLoad();
};

const onLoad = async () => {
  page.value++;
  try {
    const res = await getGalleryList({ 
      page: page.value, 
      size: 15,
      zone: parseInt(activeZone.value) // 传递当前选中的区域
    });
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
    formData.append('zone', activeZone.value); // 传递当前选中的区域
    
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

// 编辑照片
const handleEdit = (item) => {
  editForm.value = {
    id: item.id,
    zone: item.zone || 1
  };
  showEditDialog.value = true;
};

// 区域选择器确认
const onZoneSelect = (action) => {
  editForm.value.zone = action.value;
  showZonePicker.value = false;
};

// 保存编辑
const handleSaveEdit = async () => {
  try {
    const res = await updateGallery({
      id: editForm.value.id,
      zone: editForm.value.zone
    });
    if (res.code === 0) {
      showToast('保存成功');
      showEditDialog.value = false;
      // 刷新列表
      page.value = 0;
      finished.value = false;
      loading.value = true;
      list.value = [];
      onLoad();
    } else {
      showToast(res.msg || '保存失败');
    }
  } catch (e) {
    showToast('保存失败');
  }
};

// 批量操作相关方法
const toggleBatchMode = () => {
  isBatchMode.value = !isBatchMode.value;
  if (!isBatchMode.value) {
    selectedIds.value = [];
  }
};

const exitBatchMode = () => {
  isBatchMode.value = false;
  selectedIds.value = [];
};

const isSelected = (id) => {
  return selectedIds.value.includes(id);
};

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

// 批量迁移
const handleBatchMove = async (targetZone) => {
  if (selectedIds.value.length === 0) {
    showToast('请先选择要迁移的照片');
    return;
  }
  
  const zoneName = targetZone === 1 ? '写真一区' : '写真二区';
  showDialog({ 
    title: '确认迁移', 
    message: `确定要将选中的 ${selectedIds.value.length} 张照片迁移到${zoneName}吗？`,
    showCancelButton: true 
  }).then(async (action) => {
    if (action === 'confirm') {
      const toast = showLoadingToast({ message: '迁移中...', forbidClick: true, duration: 0 });
      try {
        const res = await batchMoveGallery({
          ids: selectedIds.value,
          zone: targetZone
        });
        closeToast();
        if (res.code === 0) {
          showToast('迁移成功');
          selectedIds.value = [];
          isBatchMode.value = false;
          // 刷新列表
          page.value = 0;
          finished.value = false;
          loading.value = true;
          list.value = [];
          onLoad();
        } else {
          showToast(res.msg || '迁移失败');
        }
      } catch (e) {
        closeToast();
        showToast('迁移失败');
      }
    }
  });
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    showToast('请先选择要删除的照片');
    return;
  }
  
  showDialog({ 
    title: '确认删除', 
    message: `确定要删除选中的 ${selectedIds.value.length} 张照片吗？此操作不可恢复！`,
    showCancelButton: true 
  }).then(async (action) => {
    if (action === 'confirm') {
      const toast = showLoadingToast({ message: '删除中...', forbidClick: true, duration: 0 });
      try {
        const res = await batchDeleteGallery({
          ids: selectedIds.value
        });
        closeToast();
        if (res.code === 0) {
          showToast('删除成功');
          selectedIds.value = [];
          isBatchMode.value = false;
          // 刷新列表
          page.value = 0;
          finished.value = false;
          loading.value = true;
          list.value = [];
          onLoad();
        } else {
          showToast(res.msg || '删除失败');
        }
      } catch (e) {
        closeToast();
        showToast('删除失败');
      }
    }
  });
};
</script>

<style scoped>
.page-admin { padding: 15px; }

.zone-selector {
  margin-bottom: 15px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.upload-area { 
  background: #fff; padding: 20px; text-align: center; border-radius: 8px; 
  margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex; justify-content: center;
}

.upload-placeholder { 
  color: #999; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; gap: 5px; 
}

.upload-zone-hint {
  font-size: 0.7rem;
  color: #C73E1D;
  margin-top: 5px;
}

.grid-layout { 
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; 
}

.photo-box { 
  position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; background: #000; 
}

.photo-box.selected {
  border: 3px solid #C73E1D;
  box-shadow: 0 0 0 2px rgba(199, 62, 29, 0.3);
}

.checkbox-wrapper {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.batch-actions {
  background: #fff;
  padding: 12px 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.batch-info {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mode-toggle {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.img { width: 100%; height: 100%; object-fit: cover; }

.video-badge {
    position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff;
    font-size: 10px; text-align: center; padding: 2px 0;
}

.zone-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(199, 62, 29, 0.8);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-bottom-right-radius: 4px;
  z-index: 1;
}

.del-btn { 
  position: absolute; top: 0; right: 0; background: rgba(0,0,0,0.5); 
  color: #fff; padding: 4px; border-bottom-left-radius: 4px; z-index: 2;
  cursor: pointer;
}

.edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(212, 175, 55, 0.8);
  color: #fff;
  padding: 4px;
  border-top-left-radius: 4px;
  z-index: 2;
  cursor: pointer;
}

.edit-form {
  padding: 15px;
}
</style>

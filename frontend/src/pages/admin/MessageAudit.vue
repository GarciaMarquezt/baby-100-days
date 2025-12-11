<template>
  <div class="page-admin">
    <van-tabs v-model:active="activeTab" @change="onRefresh">
      <van-tab title="待审核" name="0"></van-tab>
      <van-tab title="已通过" name="1"></van-tab>
    </van-tabs>

    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <div v-for="item in list" :key="item.id" class="msg-card">
        <div class="msg-header">
            <span class="name">{{ item.guestName }}</span>
            <span class="time">{{ formatTime(item.createTime) }}</span>
        </div>
        <div class="msg-content">{{ item.content }}</div>
        <div class="msg-actions">
            <van-button size="small" type="danger" plain @click="handleDelete(item)">删除</van-button>
            <van-button 
                v-if="item.status === 0" 
                size="small" type="primary" 
                @click="handleApprove(item)"
                style="margin-left: 10px;"
            >
                通过
            </van-button>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getMessageList, approveMessage, deleteMessage } from '../../api/admin';
import { showToast, showDialog } from 'vant';

const activeTab = ref('0');
const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(0);

const formatTime = (time) => {
    return time ? time.replace('T', ' ') : '';
};

const onLoad = async () => {
  page.value++;
  try {
    const res = await getMessageList({ 
        page: page.value, 
        size: 10, 
        status: activeTab.value 
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

const onRefresh = () => {
  page.value = 0;
  finished.value = false;
  loading.value = true;
  list.value = [];
  onLoad();
};

const handleApprove = async (item) => {
    const res = await approveMessage({ id: item.id, status: 1 });
    if (res.code === 0) {
        showToast('已通过');
        // 移出当前列表
        list.value = list.value.filter(i => i.id !== item.id);
    }
};

const handleDelete = (item) => {
    showDialog({ title: '确认删除?', showCancelButton: true }).then(async (action) => {
        if(action === 'confirm') {
            const res = await deleteMessage({ id: item.id });
            if (res.code === 0) {
                showToast('已删除');
                list.value = list.value.filter(i => i.id !== item.id);
            }
        }
    });
};
</script>

<style scoped>
.page-admin { background: #f7f8fa; min-height: 100vh; }
.msg-card {
    background: #fff; margin: 10px; padding: 15px; border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.msg-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; }
.name { font-weight: bold; color: #333; }
.time { color: #999; font-size: 0.8rem; }
.msg-content { color: #555; margin-bottom: 15px; line-height: 1.5; }
.msg-actions { display: flex; justify-content: flex-end; }
</style>


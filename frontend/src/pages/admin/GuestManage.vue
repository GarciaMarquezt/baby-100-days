<template>
  <div class="page-admin">
    <!-- 统计概览 -->
    <div class="stat-card">
      <div class="stat-item">
        <span class="num">{{ total }}</span>
        <span class="label">总人数</span>
      </div>
      <div class="stat-item">
        <span class="num">{{ list.filter(i=>i.needHotel).length }}</span>
        <span class="label">需住宿</span>
      </div>
    </div>

    <!-- 搜索 -->
    <van-search v-model="searchName" placeholder="搜索姓名" @search="onRefresh" />

    <!-- 列表 -->
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <van-swipe-cell v-for="item in list" :key="item.id" class="list-item">
        <van-cell :title="item.name" :label="item.phone" center>
          <template #value>
            <div class="tags">
              <van-tag type="primary" plain>大 {{item.adultCount}}</van-tag>
              <van-tag type="warning" plain v-if="item.childCount > 0">小 {{item.childCount}}</van-tag>
              <van-tag color="#7232dd" plain v-if="item.needHotel">宿</van-tag>
            </div>
          </template>
        </van-cell>
        <template #right>
          <van-button square text="删除" type="danger" class="delete-button" @click="handleDelete(item)" />
        </template>
      </van-swipe-cell>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getGuests, deleteGuest } from '../../api/admin';
import { showToast, showDialog, Search as VanSearch } from 'vant';

const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(0);
const total = ref(0);
const searchName = ref('');

const onLoad = async () => {
  page.value++;
  try {
    const res = await getGuests({ page: page.value, size: 10, name: searchName.value });
    if (res.code === 0) {
      const data = res.data;
      if (page.value === 1) list.value = [];
      list.value.push(...data.records);
      total.value = data.total;
      
      loading.value = false;
      if (list.value.length >= data.total) {
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
  loading.value = true; // 触发 onLoad
  list.value = [];
  onLoad();
};

const handleDelete = (item) => {
    showDialog({
        title: '提示',
        message: '确定要删除这条记录吗？',
        showCancelButton: true
    }).then(async (action) => {
        if (action === 'confirm') {
            const res = await deleteGuest({ id: item.id });
            if (res.code === 0) {
                showToast('删除成功');
                list.value = list.value.filter(i => i.id !== item.id);
            }
        }
    });
};
</script>

<style scoped>
.page-admin { padding: 10px; }
.stat-card {
  background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 15px;
  display: flex; justify-content: space-around;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.stat-item { text-align: center; display: flex; flex-direction: column; }
.num { font-size: 1.5rem; color: #8c2a2a; font-weight: bold; }
.label { font-size: 0.8rem; color: #666; }

.list-item { margin-bottom: 10px; border-radius: 8px; overflow: hidden; background: #fff; }
.tags { display: flex; gap: 5px; justify-content: flex-end; }
.delete-button { height: 100%; }
</style>

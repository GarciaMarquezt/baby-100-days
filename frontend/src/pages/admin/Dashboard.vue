<template>
  <div class="mobile-admin">
    <!-- 顶部导航 -->
    <van-nav-bar 
      :title="pageTitle" 
      left-text="退出" 
      left-arrow
      @click-left="handleLogout"
    />

    <!-- 主内容区 (带 padding 防止被上下栏遮挡) -->
    <div class="content-body">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 底部标签栏 -->
    <van-tabbar route active-color="#8c2a2a">
      <van-tabbar-item replace to="/admin/dashboard/guests" icon="friends-o">宾客</van-tabbar-item>
      <van-tabbar-item replace to="/admin/dashboard/messages" icon="comment-o">留言</van-tabbar-item>
      <van-tabbar-item replace to="/admin/dashboard/gallery" icon="photo-o">相册</van-tabbar-item>
      <van-tabbar-item replace to="/admin/dashboard/config" icon="setting-o">设置</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showConfirmDialog } from 'vant';

const router = useRouter();
const route = useRoute();

// 根据路由动态显示标题
const pageTitle = computed(() => {
  if (route.path.includes('guests')) return '宾客管理';
  if (route.path.includes('messages')) return '留言审核';
  if (route.path.includes('gallery')) return '相册管理';
  if (route.path.includes('config')) return '系统设置';
  return '管理后台';
});

const handleLogout = () => {
  showConfirmDialog({ title: '退出登录？' })
    .then(() => {
      localStorage.removeItem('token');
      router.push('/'); // 回到首页
    })
    .catch(() => {});
};
</script>

<style scoped>
.mobile-admin {
  min-height: 100vh;
  background: #f7f8fa;
}
.content-body {
  padding-bottom: 60px; /* 留出 Tabbar 高度 */
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

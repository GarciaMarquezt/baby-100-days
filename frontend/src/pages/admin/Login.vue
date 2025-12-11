<template>
  <div class="login-container">
    <div class="glass-card animate__animated animate__fadeInUp">
      <div class="logo-area">
        <div class="admin-icon">🛡️</div>
        <h2>后台管理系统</h2>
        <p>Operation Center</p>
      </div>
      
      <div class="form-area">
        <div class="input-box">
          <i class="van-icon van-icon-manager"></i>
          <input type="text" v-model="form.username" placeholder="管理员账号" />
        </div>
        
        <div class="input-box">
          <i class="van-icon van-icon-lock"></i>
          <input type="password" v-model="form.password" placeholder="安全密码" @keyup.enter="handleLogin" />
        </div>
        
        <button class="login-btn" @click="handleLogin" :disabled="loading">
          <span v-if="!loading">安全进入</span>
          <span v-else>验证中...</span>
        </button>
      </div>
    </div>
    
    <div class="bg-decoration"></div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showSuccessToast } from 'vant';
import 'animate.css';

// 模拟登录接口 (实际应调用 api/admin.js)
const router = useRouter();
const loading = ref(false);
const form = reactive({ username: '', password: '' });

const handleLogin = async () => {
  if (!form.username || !form.password) return showToast('请输入账号密码');
  
  loading.value = true;
  // 模拟网络请求
  setTimeout(() => {
    loading.value = false;
    if (form.username === 'admin' && form.password === '123456') {
      localStorage.setItem('token', 'fake-jwt-token');
      showSuccessToast('欢迎回来，主人');
      router.push('/admin/dashboard');
    } else {
      showToast('账号或密码错误');
    }
  }, 1000);
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: #1a1a1a;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.bg-decoration {
  position: absolute; width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(140, 42, 42, 0.2), transparent 70%);
  top: -200px; right: -200px;
  pointer-events: none;
}

.glass-card {
  width: 90%; max-width: 400px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  text-align: center;
  z-index: 1;
}

.logo-area { margin-bottom: 40px; }
.admin-icon { font-size: 3rem; margin-bottom: 10px; }
.logo-area h2 { color: #fff; margin: 0; font-size: 1.5rem; letter-spacing: 2px; }
.logo-area p { color: #666; margin: 5px 0 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

.input-box {
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  display: flex; align-items: center;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  transition: all 0.3s;
}
.input-box:focus-within {
  border-color: #8c2a2a;
  background: rgba(0,0,0,0.5);
}
.input-box i { color: #888; margin-right: 15px; font-size: 1.2rem; }
.input-box input {
  background: transparent; border: none; color: #fff; width: 100%; outline: none; font-size: 1rem;
}

.login-btn {
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, #8c2a2a, #5d1a1a);
  color: #fff; border: none; border-radius: 10px;
  font-size: 1.1rem; cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 5px 15px rgba(140, 42, 42, 0.3);
}
.login-btn:active { transform: scale(0.98); }
.login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
<template>
  <div class="compare-page">
    <div class="compare-header">
      <h1>版本对比</h1>
      <p class="compare-subtitle">当前项目 vs ChatGPT 简化版本</p>
    </div>

    <div class="compare-content">
      <!-- 当前版本 -->
      <div class="version-card">
        <div class="version-header">
          <h2>当前版本（完整版）</h2>
          <div class="version-badge current">当前使用</div>
        </div>
        <div class="version-features">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>使用 Vant UI 组件库</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>完整的主题系统（tokens.css）</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>完整的后端 API 对接</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>管理员后台系统</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>相册、留言、登记等功能完整</span>
          </div>
        </div>
        <div class="version-actions">
          <router-link to="/">
            <BabyButton type="primary">查看当前版本</BabyButton>
          </router-link>
        </div>
      </div>

      <!-- ChatGPT 简化版本 -->
      <div class="version-card">
        <div class="version-header">
          <h2>ChatGPT 简化版本</h2>
          <div class="version-badge demo">演示版本</div>
        </div>
        <div class="version-features">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>最小可运行版本（无外部 UI 库）</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>纯 CSS 变量主题系统</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>遵循 Cursor 规范（onXxxClick）</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>相册 + 留言墙整合页</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>金粉粒子动画</span>
          </div>
        </div>
        <div class="version-actions">
          <router-link to="/demo">
            <BabyButton type="ghost">查看简化版本</BabyButton>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 对比说明 -->
    <div class="compare-notes">
      <h3>对比说明</h3>
      <ul>
        <li><strong>当前版本</strong>：功能完整，使用 Vant UI，适合生产环境</li>
        <li><strong>简化版本</strong>：最小可运行，纯 CSS 实现，适合学习参考</li>
        <li>两个版本可以并存，互不影响</li>
        <li>简化版本展示了 ChatGPT 建议的代码组织方式</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import BabyButton from '../components/Button.vue'
</script>

<style scoped>
.compare-page {
  min-height: 100vh;
  padding: var(--spacing-lg);
  padding-top: calc(var(--safe-area-top) + var(--spacing-lg));
  background: var(--bg);
}

.compare-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.compare-header h1 {
  font-size: var(--font-size-h1);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.compare-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-body);
}

.compare-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.version-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--divider-color);
}

.version-header h2 {
  font-size: var(--font-size-h2);
  color: var(--text-primary);
}

.version-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.version-badge.current {
  background: var(--accent);
  color: #fff;
}

.version-badge.demo {
  background: var(--gold);
  color: var(--text-primary);
}

.version-features {
  margin-bottom: var(--spacing-lg);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.feature-icon {
  color: var(--accent-solid);
  font-weight: var(--font-weight-bold);
}

.version-actions {
  display: flex;
  justify-content: center;
}

.compare-notes {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.compare-notes h3 {
  font-size: var(--font-size-h2);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.compare-notes ul {
  list-style: none;
  padding: 0;
}

.compare-notes li {
  padding: var(--spacing-sm) 0;
  padding-left: var(--spacing-lg);
  position: relative;
  color: var(--text-secondary);
  line-height: 1.6;
}

.compare-notes li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--gold);
  font-size: 20px;
}

.compare-notes strong {
  color: var(--text-primary);
}

@media (max-width: 360px) {
  .compare-page {
    padding: var(--spacing-md);
  }
  
  .version-card {
    padding: var(--spacing-lg);
  }
}
</style>


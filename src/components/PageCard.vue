<template>
  <div class="page-card">
    <div class="page-header">
      <div class="page-title-area">
        <h2 class="page-title">{{ title }}</h2>
        <p class="page-subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>
    <div class="page-search" v-if="$slots.search">
      <slot name="search"></slot>
    </div>
    <div class="page-toolbar" v-if="$slots.toolbar">
      <slot name="toolbar"></slot>
    </div>
    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String
})
</script>

<style scoped>
.page-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title-area {
  flex: 1;
}

.page-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.page-search {
  background: #fafbfc;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.page-toolbar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.page-content {
  margin-top: 8px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.2s;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background: #fafbfc !important;
  color: #303133;
  font-weight: 600;
  border-bottom: 2px solid #ebeef5;
}

:deep(.el-table tr:hover > td.el-table__cell) {
  background: #f5f7fa !important;
}

:deep(.el-tag) {
  border-radius: 12px;
  padding: 0 10px;
  height: 24px;
  line-height: 22px;
}
</style>

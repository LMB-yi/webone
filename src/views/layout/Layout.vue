<template>
  <el-container class="layout-container">
    <el-aside width="230px" class="sidebar">
      <div class="logo">
        <span class="logo-icon">🏘️</span>
        <div>
          <h2>社区服务</h2>
          <p>Community Service</p>
        </div>
      </div>
      <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" background-color="transparent" text-color="#cfd3e0" active-text-color="#fff" router>
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/repairs">
          <el-icon><Tools /></el-icon>
          <span>社区报修</span>
        </el-menu-item>
        <el-menu-item v-if="canAccess('mutual-aids')" index="/mutual-aids">
          <el-icon><Promotion /></el-icon>
          <span>邻里互助</span>
        </el-menu-item>
        <el-menu-item v-if="canAccess('group-buys')" index="/group-buys">
          <el-icon><ShoppingCart /></el-icon>
          <span>生鲜团购</span>
        </el-menu-item>
        <el-menu-item v-if="canAccess('notices')" index="/notices">
          <el-icon><Bell /></el-icon>
          <span>公告通知</span>
        </el-menu-item>
        <el-sub-menu v-if="canAccess('home-services')" index="home">
          <template #title>
            <el-icon><HomeFilled /></el-icon>
            <span>家政服务</span>
          </template>
          <el-menu-item index="/home-services">服务管理</el-menu-item>
          <el-menu-item index="/bookings">预约管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item v-if="canAccess('idle-items')" index="/idle-items">
          <el-icon><Box /></el-icon>
          <span>闲置物品</span>
        </el-menu-item>
        <el-menu-item v-if="canAccess('credit')" index="/credit">
          <el-icon><Medal /></el-icon>
          <span>信用评分</span>
        </el-menu-item>
        <el-menu-item v-if="canAccess('users')" index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/notifications">
          <el-icon><Message /></el-icon>
          <span>消息通知</span>
          <el-badge v-if="unreadCount > 0" :value="unreadCount" class="menu-badge" />
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentMenuName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0">
            <el-icon class="header-icon" :size="20"><Bell /></el-icon>
          </el-badge>
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" class="user-avatar">{{ userInfo.username?.charAt(0) || 'U' }}</el-avatar>
              <span class="user-name">{{ userInfo.username || '用户' }}</span>
              <el-tag size="small" :type="roleTagType" effect="plain">{{ roleLabel }}</el-tag>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon> 个人信息
                </el-dropdown-item>
                <el-dropdown-item v-if="userInfo.role === 'admin'" command="settings">
                  <el-icon><Setting /></el-icon> 系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DataLine, Tools, Promotion, ShoppingCart, Bell, HomeFilled, Box, Medal, User, Message, ArrowDown, Setting, SwitchButton } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)
const unreadCount = ref(0)

const userInfo = ref({
  id: 0,
  username: '',
  role: 'admin'
})

const canAccess = (menuKey) => {
  return true
}

const roleLabel = computed(() => {
  const labels = { admin: '管理员', property: '物业', repair: '维修', resident: '居民' }
  return labels[userInfo.value.role] || '用户'
})

const roleTagType = computed(() => {
  const types = { admin: 'danger', property: 'warning', repair: 'success', resident: 'info' }
  return types[userInfo.value.role] || 'info'
})

const loadUserInfo = () => {
  const stored = localStorage.getItem('userInfo')
  if (stored) {
    userInfo.value = JSON.parse(stored)
  }
}

const fetchUnreadCount = async () => {
  try {
    const res = await request.get('/notifications')
    const data = Array.isArray(res) ? res : (res.list || res.data || [])
    unreadCount.value = data.filter(item => item.is_read === 0).length
  } catch (err) {
    console.error('获取未读消息数量失败:', err)
  }
}

window.addEventListener('notificationUpdated', fetchUnreadCount)

const menuMap = {
  '/dashboard': '仪表盘',
  '/repairs': '社区报修',
  '/mutual-aids': '邻里互助',
  '/group-buys': '生鲜团购',
  '/notices': '公告通知',
  '/home-services': '家政服务',
  '/bookings': '预约管理',
  '/idle-items': '闲置物品',
  '/credit': '信用评分',
  '/users': '用户管理',
  '/notifications': '消息通知',
  '/profile': '个人信息',
  '/settings': '系统设置'
}

const currentMenuName = computed(() => menuMap[route.path] || '首页')

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    router.push('/settings')
  }
}

onMounted(() => {
  loadUserInfo()
  fetchUnreadCount()
})

watch(() => route.path, () => {
  fetchUnreadCount()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #1e3a5f 0%, #0f1f3a 100%) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-icon {
  font-size: 32px;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-weight: 600;
}

.logo p {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.el-menu-vertical-demo {
  border-right: none;
  padding: 10px;
}

:deep(.el-menu-item) {
  margin: 4px 0;
  border-radius: 8px;
  height: 48px;
  line-height: 48px;
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.el-sub-menu__title) {
  margin: 4px 12px;
  border-radius: 8px;
}

:deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
}

.menu-badge {
  margin-left: auto;
  position: relative;
  z-index: 10;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.header-icon:hover {
  color: #667eea;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

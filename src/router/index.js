import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue')
  },
  {
    path: '/',
    component: () => import('@/views/layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/Dashboard.vue') },
      { path: 'repairs', name: 'Repairs', component: () => import('@/views/repairs/RepairList.vue') },
      { path: 'mutual-aids', name: 'MutualAids', component: () => import('@/views/mutual-aids/MutualAidList.vue') },
      { path: 'group-buys', name: 'GroupBuys', component: () => import('@/views/group-buys/GroupBuyList.vue') },
      { path: 'notices', name: 'Notices', component: () => import('@/views/notices/NoticeList.vue') },
      { path: 'home-services', name: 'HomeServices', component: () => import('@/views/home-services/HomeServiceList.vue') },
      { path: 'bookings', name: 'Bookings', component: () => import('@/views/home-services/BookingList.vue') },
      { path: 'idle-items', name: 'IdleItems', component: () => import('@/views/idle-items/IdleItemList.vue') },
      { path: 'credit', name: 'Credit', component: () => import('@/views/credit/CreditList.vue') },
      { path: 'users', name: 'Users', component: () => import('@/views/users/UserList.vue') },
      { path: 'notifications', name: 'Notifications', component: () => import('@/views/notifications/NotificationList.vue') },
      { path: 'profile', name: 'Profile', component: () => import('@/views/profile/Profile.vue') },
      { path: 'settings', name: 'Settings', component: () => import('@/views/settings/Settings.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  next()
})

export default router

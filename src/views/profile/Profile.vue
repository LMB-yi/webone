<template>
  <PageCard title="个人信息" subtitle="查看和修改您的个人资料">
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="profile-card">
          <div class="avatar-section">
            <el-avatar :size="100" class="user-avatar">{{ userInfo.username?.charAt(0) || 'U' }}</el-avatar>
            <h3>{{ userInfo.username }}</h3>
            <el-tag :type="roleTagType" effect="plain">{{ roleLabel }}</el-tag>
          </div>
          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-label">信用分</span>
              <span class="stat-value">{{ userInfo.creditScore || 100 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">注册时间</span>
              <span class="stat-value">{{ formatDate(userInfo.createdAt) }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="form-card">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" size="large">
            <el-form-item label="用户名">
              <el-input v-model="form.username" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.phone" disabled />
            </el-form-item>
            <el-form-item label="角色">
              <el-input :value="roleLabel" disabled />
            </el-form-item>
            <el-divider>修改密码</el-divider>
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="form.oldPassword" type="password" placeholder="请输入原密码" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="form.confirmPassword" type="password" placeholder="请确认新密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdatePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </PageCard>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageCard from '@/components/PageCard.vue'
import request from '@/utils/request'

const formRef = ref()

const userInfo = ref({
  id: 0,
  username: '',
  phone: '',
  role: 'resident',
  creditScore: 100,
  createdAt: ''
})

const form = reactive({
  username: '',
  phone: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const roleLabel = computed(() => {
  const labels = { admin: '管理员', property: '物业人员', repair: '维修人员', resident: '居民' }
  return labels[userInfo.value.role] || '用户'
})

const roleTagType = computed(() => {
  const types = { admin: 'danger', property: 'warning', repair: 'success', resident: 'info' }
  return types[userInfo.value.role] || 'info'
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadUserInfo = async () => {
  const stored = localStorage.getItem('userInfo')
  if (stored) {
    const data = JSON.parse(stored)
    userInfo.value = data
    form.username = data.username
    form.phone = data.phone
  }
  
  // 从服务器获取最新信息
  try {
    const res = await request.get(`/users/${userInfo.value.id}`)
    if (res) {
      userInfo.value.creditScore = res.credit_score
      userInfo.value.createdAt = res.created_at
    }
  } catch (err) {
    console.error('获取用户信息失败', err)
  }
}

const handleUpdatePassword = async () => {
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    ElMessage.warning('请填写完整的密码信息')
    return
  }
  
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  
  try {
    await request.put(`/users/${userInfo.value.id}/password`, {
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    ElMessage.success('密码修改成功')
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (err) {
    ElMessage.error(err.message || '密码修改失败')
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.avatar-section {
  margin-bottom: 20px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 36px;
  margin-bottom: 15px;
}

.avatar-section h3 {
  margin: 10px 0;
  font-size: 20px;
  color: #303133;
}

.stats-section {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.stat-value {
  color: #303133;
  font-weight: 500;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
</style>

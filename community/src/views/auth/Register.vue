<template>
  <div class="register-container">
    <div class="login-bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>
    <div class="register-card">
      <div class="register-header">
        <div class="register-icon">✨</div>
        <h1 class="register-title">创建新账号</h1>
        <p class="register-subtitle">加入社区，便捷生活从此刻开始</p>
      </div>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" size="large" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" :prefix-icon="Phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item label="图形验证码" prop="code">
          <div class="captcha-row">
            <el-input v-model="registerForm.code" placeholder="请输入验证码" :prefix-icon="Key" style="flex: 1;" />
            <canvas ref="captchaCanvas" width="120" height="40" class="captcha-canvas" @click="refreshCaptcha" title="点击刷新"></canvas>
          </div>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="registerForm.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="居民" value="resident">
              <span style="float: left;">🏠 居民</span>
            </el-option>
            <el-option label="管理员" value="admin">
              <span style="float: left;">👑 管理员</span>
            </el-option>
            <el-option label="物业" value="property">
              <span style="float: left;">🛡️ 物业</span>
            </el-option>
            <el-option label="维修人员" value="repair">
              <span style="float: left;">🔧 维修人员</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="register-btn" @click="handleRegister">注 册</el-button>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        已有账号？<router-link to="/login" class="login-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Phone, Lock, Key } from '@element-plus/icons-vue'
import { generateCaptcha, drawCaptcha } from '@/utils/captcha'
import request from '@/utils/request'

const router = useRouter()
const registerFormRef = ref()
const captchaCanvas = ref()
const captchaCode = ref('')

const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
  code: '',
  role: 'resident'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value !== registerForm.password) {
        callback(new Error('两次密码输入不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入验证码'))
      } else if (value.toUpperCase() !== captchaCode.value) {
        callback(new Error('验证码不正确'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const refreshCaptcha = () => {
  captchaCode.value = generateCaptcha(4)
  drawCaptcha(captchaCanvas.value, captchaCode.value)
}

onMounted(() => {
  refreshCaptcha()
})

const handleRegister = async () => {
  const valid = await registerFormRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    await request.post('/auth/register', {
      username: registerForm.username,
      phone: registerForm.phone,
      password: registerForm.password,
      role: registerForm.role
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    ElMessage.error(err.message || '注册失败')
  }
}
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  overflow: hidden;
}

.login-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: #ffd93d;
  top: -150px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 350px;
  height: 350px;
  background: #6a11cb;
  bottom: -100px;
  left: -100px;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

.register-card {
  position: relative;
  z-index: 1;
  width: 480px;
  max-width: 100%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.captcha-canvas {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  background: #f0f2f5;
  transition: all 0.2s;
}

.captcha-canvas:hover {
  border-color: #f5576c;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  letter-spacing: 4px;
  transition: all 0.3s;
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #606266;
  margin-top: 16px;
}

.login-link {
  color: #f5576c;
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  padding-bottom: 6px;
}
</style>

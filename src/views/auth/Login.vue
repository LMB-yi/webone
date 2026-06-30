<template>
  <div class="login-container">
    <div class="login-bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    <div class="login-wrapper">
      <div class="login-left">
        <div class="brand">
          <div class="brand-icon">🏘️</div>
          <h1 class="brand-title">社区便民服务</h1>
          <p class="brand-subtitle">共建和谐社区 · 享受便捷生活</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">🔧</span>
            <span>在线报修</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🤝</span>
            <span>邻里互助</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🛒</span>
            <span>生鲜团购</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📢</span>
            <span>公告通知</span>
          </div>
        </div>
      </div>
      <div class="login-card">
        <div class="login-title">
          <h2>欢迎登录</h2>
          <p>请输入您的账号信息</p>
        </div>
        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" size="large">
          <el-form-item prop="phone">
            <el-input v-model="loginForm.phone" placeholder="请输入手机号" :prefix-icon="Phone" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item prop="code">
            <div class="captcha-row">
              <el-input v-model="loginForm.code" placeholder="请输入验证码" :prefix-icon="Key" style="flex: 1;" />
              <canvas ref="captchaCanvas" width="120" height="40" class="captcha-canvas" @click="refreshCaptcha" title="点击刷新"></canvas>
            </div>
          </el-form-item>
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <a class="forgot-link">忘记密码？</a>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" @click="handleLogin">登 录</el-button>
          </el-form-item>
          <div class="form-footer">
            还没有账号？<router-link to="/register" class="register-link">立即注册</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, Lock, Key } from '@element-plus/icons-vue'
import { generateCaptcha, drawCaptcha } from '@/utils/captcha'
import request from '@/utils/request'

const router = useRouter()
const loginFormRef = ref()
const captchaCanvas = ref()
const captchaCode = ref('')

const loginForm = reactive({
  phone: '',
  password: '',
  code: '',
  remember: false
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
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
    }, trigger: ['blur', 'change'] }
  ]
}

const refreshCaptcha = () => {
  captchaCode.value = generateCaptcha(4)
  drawCaptcha(captchaCanvas.value, captchaCode.value)
}

onMounted(() => {
  refreshCaptcha()
})

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    const res = await request.post('/auth/login', {
      phone: loginForm.phone,
      password: loginForm.password
    })
    localStorage.setItem('token', res.token)
    localStorage.setItem('userInfo', JSON.stringify(res.user))
    if (loginForm.remember) {
      localStorage.setItem('phone', loginForm.phone)
    }
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (err) {
    ElMessage.error(err.message || '登录失败')
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  opacity: 0.5;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: #f093fb;
  top: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: #4facfe;
  bottom: -50px;
  right: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: #43e97b;
  top: 50%;
  left: 50%;
  animation: float 12s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

.login-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 60px;
  max-width: 1000px;
  width: 100%;
  padding: 20px;
}

.login-left {
  flex: 1;
  color: white;
}

.brand {
  margin-bottom: 40px;
}

.brand-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.brand-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.brand-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 28px;
}

.login-card {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.login-title {
  text-align: center;
  margin-bottom: 32px;
}

.login-title h2 {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px;
}

.login-title p {
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
  border-color: #409eff;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-link {
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  letter-spacing: 4px;
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #606266;
  margin-top: 16px;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    gap: 30px;
  }
  .login-left {
    text-align: center;
  }
  .brand-title {
    font-size: 32px;
  }
  .login-card {
    width: 100%;
    max-width: 420px;
  }
}
</style>

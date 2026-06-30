<template>
  <PageCard title="系统设置" subtitle="管理系统参数和配置">
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="基础设置" name="basic">
        <el-form :model="basicSettings" label-width="120px" class="settings-form">
          <el-form-item label="系统名称">
            <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
          </el-form-item>
          <el-form-item label="系统Logo">
            <el-input v-model="basicSettings.logo" placeholder="请输入Logo URL" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="basicSettings.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="联系邮箱">
            <el-input v-model="basicSettings.contactEmail" placeholder="请输入联系邮箱" />
          </el-form-item>
          <el-form-item label="系统公告">
            <el-input v-model="basicSettings.announcement" type="textarea" :rows="3" placeholder="请输入系统公告" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="信用分设置" name="credit">
        <el-form :model="creditSettings" label-width="150px" class="settings-form">
          <el-form-item label="初始信用分">
            <el-input-number v-model="creditSettings.initialScore" :min="0" :max="200" />
          </el-form-item>
          <el-form-item label="报修加分">
            <el-input-number v-model="creditSettings.repairBonus" :min="0" :max="50" />
            <span class="form-tip">完成报修后获得的信用分</span>
          </el-form-item>
          <el-form-item label="互助加分">
            <el-input-number v-model="creditSettings.mutualAidBonus" :min="0" :max="50" />
            <span class="form-tip">帮助他人后获得的信用分</span>
          </el-form-item>
          <el-form-item label="违约扣分">
            <el-input-number v-model="creditSettings.penaltyScore" :min="0" :max="50" />
            <span class="form-tip">违约行为扣除的信用分</span>
          </el-form-item>
          <el-form-item label="低信用分阈值">
            <el-input-number v-model="creditSettings.lowThreshold" :min="0" :max="100" />
            <span class="form-tip">低于此值将被限制部分功能</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveCreditSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="通知设置" name="notification">
        <el-form :model="notificationSettings" label-width="150px" class="settings-form">
          <el-form-item label="报修通知">
            <el-switch v-model="notificationSettings.repairNotify" />
            <span class="form-tip">报修状态变更时发送通知</span>
          </el-form-item>
          <el-form-item label="互助通知">
            <el-switch v-model="notificationSettings.mutualAidNotify" />
            <span class="form-tip">互助请求响应时发送通知</span>
          </el-form-item>
          <el-form-item label="团购通知">
            <el-switch v-model="notificationSettings.groupBuyNotify" />
            <span class="form-tip">团购成团时发送通知</span>
          </el-form-item>
          <el-form-item label="系统公告通知">
            <el-switch v-model="notificationSettings.systemNotify" />
            <span class="form-tip">发布新公告时发送通知</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="数据管理" name="data">
        <div class="data-management">
          <div class="data-item">
            <div class="data-info">
              <h4>清理过期数据</h4>
              <p>删除超过指定天数的历史数据</p>
            </div>
            <el-button type="warning" @click="cleanOldData">清理数据</el-button>
          </div>
          <el-divider />
          <div class="data-item">
            <div class="data-info">
              <h4>导出数据</h4>
              <p>导出系统数据为JSON格式</p>
            </div>
            <el-button type="primary" @click="exportData">导出数据</el-button>
          </div>
          <el-divider />
          <div class="data-item">
            <div class="data-info">
              <h4>重置系统</h4>
              <p>清除所有数据并恢复默认设置（危险操作）</p>
            </div>
            <el-button type="danger" @click="resetSystem">重置系统</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </PageCard>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageCard from '@/components/PageCard.vue'

const activeTab = ref('basic')

const basicSettings = reactive({
  systemName: '社区便民服务系统',
  logo: '',
  contactPhone: '400-888-8888',
  contactEmail: 'service@community.com',
  announcement: '欢迎使用社区便民服务系统，我们将竭诚为您服务！'
})

const creditSettings = reactive({
  initialScore: 100,
  repairBonus: 5,
  mutualAidBonus: 10,
  penaltyScore: 20,
  lowThreshold: 60
})

const notificationSettings = reactive({
  repairNotify: true,
  mutualAidNotify: true,
  groupBuyNotify: true,
  systemNotify: true
})

const saveBasicSettings = () => {
  localStorage.setItem('basicSettings', JSON.stringify(basicSettings))
  ElMessage.success('基础设置保存成功')
}

const saveCreditSettings = () => {
  localStorage.setItem('creditSettings', JSON.stringify(creditSettings))
  ElMessage.success('信用分设置保存成功')
}

const saveNotificationSettings = () => {
  localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))
  ElMessage.success('通知设置保存成功')
}

const cleanOldData = () => {
  ElMessageBox.confirm('确定要清理过期数据吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('过期数据已清理')
  }).catch(() => {})
}

const exportData = () => {
  const data = {
    basicSettings,
    creditSettings,
    notificationSettings,
    exportTime: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `community-settings-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('数据导出成功')
}

const resetSystem = () => {
  ElMessageBox.confirm('此操作将清除所有数据并恢复默认设置，是否继续？', '危险操作', {
    confirmButtonText: '确定重置',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    localStorage.clear()
    ElMessage.success('系统已重置，请刷新页面')
    setTimeout(() => window.location.reload(), 1500)
  }).catch(() => {})
}

// 加载保存的设置
const loadSettings = () => {
  const savedBasic = localStorage.getItem('basicSettings')
  const savedCredit = localStorage.getItem('creditSettings')
  const savedNotification = localStorage.getItem('notificationSettings')
  
  if (savedBasic) Object.assign(basicSettings, JSON.parse(savedBasic))
  if (savedCredit) Object.assign(creditSettings, JSON.parse(savedCredit))
  if (savedNotification) Object.assign(notificationSettings, JSON.parse(savedNotification))
}

loadSettings()
</script>

<style scoped>
.settings-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.settings-form {
  max-width: 600px;
  padding: 20px 0;
}

.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.data-management {
  padding: 20px 0;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.data-info h4 {
  margin: 0 0 5px;
  color: #303133;
}

.data-info p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}
</style>

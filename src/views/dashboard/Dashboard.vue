<template>
  <div>
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1>欢迎回来，admin 👋</h1>
        <p>今天是 {{ today }}，愿您有一个美好的一天</p>
      </div>
      <div class="welcome-emoji">🌅</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card stat-blue">
        <div class="stat-icon">🔧</div>
        <div class="stat-content">
          <div class="stat-label">待处理报修</div>
          <div class="stat-value">{{ stats.repairCount }}</div>
          <div class="stat-trend">
            <span class="trend-up">↑ 12%</span>
            <span class="trend-text">较上周</span>
          </div>
        </div>
      </div>
      <div class="stat-card stat-green">
        <div class="stat-icon">🤝</div>
        <div class="stat-content">
          <div class="stat-label">进行中互助</div>
          <div class="stat-value">{{ stats.mutualAidCount }}</div>
          <div class="stat-trend">
            <span class="trend-up">↑ 8%</span>
            <span class="trend-text">较上周</span>
          </div>
        </div>
      </div>
      <div class="stat-card stat-orange">
        <div class="stat-icon">🛒</div>
        <div class="stat-content">
          <div class="stat-label">进行中团购</div>
          <div class="stat-value">{{ stats.groupBuyCount }}</div>
          <div class="stat-trend">
            <span class="trend-down">↓ 3%</span>
            <span class="trend-text">较上周</span>
          </div>
        </div>
      </div>
      <div class="stat-card stat-red">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-label">平均信用分</div>
          <div class="stat-value">{{ stats.avgCreditScore }}</div>
          <div class="stat-trend">
            <span class="trend-up">↑ 5%</span>
            <span class="trend-text">较上周</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="card section-card">
        <div class="section-header">
          <h3>最近记录</h3>
          <el-button text type="primary" @click="router.push('/notifications')">查看全部 →</el-button>
        </div>
        <el-table :data="recentRecords" class="modern-table" v-loading="loading">
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag :type="typeTagType(scope.row.type)" effect="light" round>
                {{ typeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag size="small" effect="plain">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="时间" width="120" />
        </el-table>
      </div>

      <div class="card section-card">
        <div class="section-header">
          <h3>信用排行榜 TOP 5</h3>
          <el-button text type="primary" @click="router.push('/credit')">完整排行 →</el-button>
        </div>
        <div class="ranking-list">
          <div v-for="item in creditRank" :key="item.rank" class="ranking-item">
            <div class="rank-medal" :class="`rank-${item.rank}`">
              <span v-if="item.rank === 1">🥇</span>
              <span v-else-if="item.rank === 2">🥈</span>
              <span v-else-if="item.rank === 3">🥉</span>
              <span v-else>{{ item.rank }}</span>
            </div>
            <el-avatar :size="40" class="ranking-avatar">{{ item.username.charAt(0) }}</el-avatar>
            <div class="ranking-info">
              <div class="ranking-name">{{ item.username }}</div>
              <div class="ranking-score">信用分: {{ item.creditScore }}</div>
            </div>
            <div class="ranking-badge">
              <el-tag :type="item.rank <= 3 ? 'danger' : 'info'" round>
                {{ item.creditScore }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()

const loading = ref(false)

const stats = reactive({
  repairCount: 0,
  mutualAidCount: 0,
  groupBuyCount: 0,
  avgCreditScore: 0
})

const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

const recentRecords = ref([])

const fetchStats = async () => {
  loading.value = true
  try {
    const res = await request.get('/dashboard/stats')
    Object.assign(stats, res)
    if (res.recentRecords) {
      recentRecords.value = res.recentRecords
    }
  } catch (error) {
    console.error('获取仪表盘数据失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
  fetchCreditRank()
})

const creditRank = ref([])

const fetchCreditRank = async () => {
  try {
    const res = await request.get('/users')
    const data = Array.isArray(res) ? res : (res.list || [])
    creditRank.value = data
      .filter(item => item.role !== 'admin')
      .map(item => ({
        ...item,
        creditScore: item.credit_score
      }))
      .sort((a, b) => b.creditScore - a.creditScore)
      .slice(0, 5)
      .map((item, index) => ({ ...item, rank: index + 1 }))
  } catch (error) {
    console.error('获取信用排行榜失败', error)
  }
}

const typeLabel = (val) => {
  const map = { repair: '报修', mutual_aid: '互助', group_buy: '团购', booking: '预约', notice: '公告' }
  return map[val] || val
}

const typeTagType = (val) => {
  const map = { repair: 'danger', mutual_aid: 'success', group_buy: 'warning', booking: 'primary', notice: 'info' }
  return map[val] || 'info'
}
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  color: white;
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -50px;
  right: -50px;
}

.welcome-content h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.welcome-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.welcome-emoji {
  font-size: 64px;
  position: relative;
  z-index: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card::before {
  content: '';
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
}

.stat-blue::before { background: #409EFF; }
.stat-green::before { background: #67C23A; }
.stat-orange::before { background: #E6A23C; }
.stat-red::before { background: #F56C6C; }

.stat-icon {
  font-size: 40px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 12px;
}

.stat-green .stat-icon { background: rgba(103, 194, 58, 0.1); }
.stat-orange .stat-icon { background: rgba(230, 162, 60, 0.1); }
.stat-red .stat-icon { background: rgba(245, 108, 108, 0.1); }

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.trend-up { color: #67C23A; font-weight: 600; }
.trend-down { color: #F56C6C; font-weight: 600; }
.trend-text { color: #C0C4CC; }

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.modern-table {
  border-radius: 8px;
  overflow: hidden;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.ranking-item:hover {
  background: #f5f7fa;
}

.rank-medal {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  border-radius: 50%;
  background: #f0f2f5;
  color: #909399;
}

.rank-1 { background: linear-gradient(135deg, #FFD700, #FFA500); color: white; }
.rank-2 { background: linear-gradient(135deg, #C0C0C0, #808080); color: white; }
.rank-3 { background: linear-gradient(135deg, #CD7F32, #8B4513); color: white; }

.ranking-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
  font-weight: 600;
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.ranking-score {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>

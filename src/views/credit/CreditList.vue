<template>
  <PageCard title="信用排行榜" subtitle="社区信用分排名">
    <template #search>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" style="width: 200px;" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column label="排名" width="100" align="center">
        <template #default="scope">
          <div v-if="scope.row.rank <= 3" class="medal-cell">
            <span class="medal-icon">{{ scope.row.rank === 1 ? '🥇' : scope.row.rank === 2 ? '🥈' : '🥉' }}</span>
          </div>
          <span v-else class="rank-num">{{ scope.row.rank }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" min-width="120">
        <template #default="scope">
          <div class="user-cell">
            <el-avatar :size="32" class="user-avatar">{{ scope.row.username.charAt(0) }}</el-avatar>
            <span>{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="creditScore" label="信用分" width="120" align="center">
        <template #default="scope">
          <el-tag :type="scoreType(scope.row.creditScore)" size="large" round>
            {{ scope.row.creditScore }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="100">
        <template #default="scope">{{ roleLabel(scope.row.role) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'info'">{{ scope.row.status ? '正常' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="scope">
          <el-button v-if="isAdminOrProperty" type="primary" link @click="openAdjustDialog(scope.row)">调整信用分</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="调整信用分" v-model="dialogVisible" width="420px" align-center>
      <el-form :model="adjustForm" :rules="adjustRules" ref="adjustFormRef" label-width="100px">
        <el-form-item label="用户">
          <el-input :value="currentUser.username" disabled />
        </el-form-item>
        <el-form-item label="当前信用分">
          <el-input :value="currentUser.creditScore" disabled />
        </el-form-item>
        <el-form-item label="变动分数" prop="amount">
          <el-input-number v-model="adjustForm.amount" :min="-100" :max="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="变动原因" prop="reason">
          <el-select v-model="adjustForm.reason" style="width: 100%;">
            <el-option label="互助完成奖励" value="mutual_aid_complete" />
            <el-option label="违规扣分" value="violation" />
            <el-option label="系统调整" value="system" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdjust">确定</el-button>
      </template>
    </el-dialog>
  </PageCard>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageCard from '@/components/PageCard.vue'
import request from '@/utils/request'

const tableData = ref([])
const dialogVisible = ref(false)
const adjustFormRef = ref()
const currentUser = ref({})

const searchForm = reactive({ username: '' })

const adjustForm = reactive({ amount: 0, reason: 'system' })

const adjustRules = {
  amount: [{ required: true, message: '请输入变动分数', trigger: 'blur' }],
  reason: [{ required: true, message: '请选择原因', trigger: 'change' }]
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdminOrProperty = ['admin', 'property'].includes(userInfo.role)

const loadData = async () => {
  const res = await request.get('/users', { params: searchForm })
  const data = Array.isArray(res) ? res : (res.list || [])
  tableData.value = data
    .map(item => ({
      ...item,
      creditScore: item.credit_score,
      isActive: item.is_active
    }))
    .sort((a, b) => b.creditScore - a.creditScore)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

onMounted(() => { loadData() })

const search = () => { loadData() }

const resetSearch = () => { searchForm.username = ''; loadData() }

const openAdjustDialog = (row) => {
  currentUser.value = { ...row }
  adjustForm.amount = 0
  dialogVisible.value = true
}

const handleAdjust = () => {
  adjustFormRef.value.validate(async (valid) => {
    if (valid) {
      const type = adjustForm.amount > 0 ? 'increase' : 'decrease'
      await request.post('/credit', { 
        user_id: currentUser.value.id, 
        type, 
        amount: Math.abs(adjustForm.amount), 
        reason: adjustForm.reason 
      })
      ElMessage.success('调整成功')
      loadData()
      dialogVisible.value = false
    }
  })
}

const roleLabel = (val) => ({ resident: '居民', admin: '管理员', property: '物业', repair: '维修人员' })[val] || val
const scoreType = (val) => val >= 120 ? 'success' : val >= 80 ? 'warning' : 'danger'
</script>

<style scoped>
.medal-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.rank-num {
  font-size: 18px;
  font-weight: 600;
  color: #606266;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: #fff;
  font-weight: 600;
}
</style>

<template>
  <PageCard title="互助列表" subtitle="邻里之间互相帮助，共建温暖社区">
    <template #search>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择" style="width: 160px;">
            <el-option label="全部" value="" />
            <el-option label="寻求帮助" value="seek_help" />
            <el-option label="提供帮助" value="provide_help" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" style="width: 160px;">
            <el-option label="全部" value="" />
            <el-option label="日常" value="日常" />
            <el-option label="学习" value="学习" />
            <el-option label="生活" value="生活" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template #toolbar>
      <el-button type="primary" :icon="Plus" @click="openAddDialog">发布互助</el-button>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="150" />
      <el-table-column prop="category" label="分类" width="100">
        <template #default="scope">{{ categoryLabel(scope.row.category) }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'seek_help' ? 'warning' : 'success'" effect="light" round>
            {{ scope.row.type === 'seek_help' ? '寻求帮助' : '提供帮助' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creditReward" label="奖励信用分" width="120">
        <template #default="scope">
          <span class="credit-text">+{{ scope.row.creditReward }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button type="success" link @click="handleRespond(scope.row)" v-if="scope.row.status === 'open'">响应</el-button>
          <el-button type="primary" link @click="handleComplete(scope.row)" v-if="scope.row.status === 'in_progress'">完成</el-button>
          <el-button v-if="canEdit(scope.row)" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑互助' : '发布互助'" v-model="dialogVisible" width="600px" align-center>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width: 100%;">
            <el-option label="日常" value="日常" />
            <el-option label="学习" value="学习" />
            <el-option label="生活" value="生活" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button label="seek_help">寻求帮助</el-radio-button>
            <el-radio-button label="provide_help">提供帮助</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="奖励信用分">
          <el-input-number v-model="form.creditReward" :min="0" :max="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="互助详情" v-model="detailVisible" width="600px" align-center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryLabel(detailData.category) }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type === 'seek_help' ? '寻求帮助' : '提供帮助' }}</el-descriptions-item>
        <el-descriptions-item label="奖励信用分">+{{ detailData.creditReward }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(detailData.status) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </PageCard>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageCard from '@/components/PageCard.vue'
import request from '@/utils/request'

const tableData = ref([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const detailData = ref({})

const searchForm = reactive({ type: '', category: '' })

const form = reactive({
  id: null, title: '', category: '日常', type: 'seek_help', creditReward: 10, description: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdminOrProperty = ['admin', 'property'].includes(userInfo.role)

const canEdit = (row) => {
  if (isAdminOrProperty) return true
  return row.user_id === userInfo.id
}

const loadData = async () => {
  const params = { ...searchForm }
  if (!isAdminOrProperty) {
    params.userId = userInfo.id
  }
  const res = await request.get('/mutual-aids', { params })
  const data = Array.isArray(res) ? res : (res.list || [])
  tableData.value = data.map(item => ({
    ...item,
    creditReward: item.credit_reward,
    createdAt: item.created_at,
    publisherName: item.publisher_name,
    helperName: item.helper_name
  }))
}

onMounted(() => { loadData() })

const search = () => {
  loadData()
}

const resetSearch = () => {
  searchForm.type = ''
  searchForm.category = ''
  loadData()
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: null, title: '', category: '日常', type: 'seek_help', creditReward: 10, description: '' })
  dialogVisible.value = true
}

const viewDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const handleRespond = async (row) => {
  if (confirm('确定响应此互助请求吗？')) {
    await request.put(`/mutual-aids/${row.id}`, { ...row, status: 'in_progress' })
    ElMessage.success('响应成功')
    loadData()
  }
}

const handleComplete = async (row) => {
  if (confirm('确定完成此互助任务吗？完成后将自动增加信用分。')) {
    await request.put(`/mutual-aids/${row.id}`, { ...row, status: 'completed' })
    ElMessage.success('完成成功')
    loadData()
  }
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await request.put(`/mutual-aids/${form.id}`, form)
          ElMessage.success('更新成功')
        } else {
          await request.post('/mutual-aids', {
            title: form.title,
            category: form.category,
            type: form.type,
            description: form.description,
            credit_reward: form.creditReward,
            user_id: userInfo.id
          })
          ElMessage.success('发布成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败', error)
      }
    }
  })
}

const handleDelete = async (id) => {
  if (confirm('确定删除这条记录吗？')) {
    try {
      await request.delete(`/mutual-aids/${id}`)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  }
}

const categoryLabel = (val) => ({ '日常': '日常', '学习': '学习', '生活': '生活', '其他': '其他' })[val] || val

const statusLabel = (val) => ({ open: '开放', in_progress: '进行中', completed: '已完成', cancelled: '已取消' })[val] || val

const statusType = (val) => ({ open: 'success', in_progress: 'warning', completed: 'info', cancelled: 'info' })[val] || 'info'
</script>

<style scoped>
.credit-text {
  color: #67c23a;
  font-weight: 600;
}
</style>
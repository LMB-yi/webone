<template>
  <PageCard title="报修列表" subtitle="管理社区内的报修申请">
    <template #search>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" style="width: 180px;">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已分配" value="assigned" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template #toolbar>
      <el-button type="primary" :icon="Plus" @click="openAddDialog">新增报修</el-button>
    </template>
    <el-table :data="tableData" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="120" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="scope">
          <el-tag :type="priorityType(scope.row.priority)" effect="light" round>
            {{ priorityLabel(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.status)" effect="dark">
            {{ statusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button v-if="canEdit(scope.row)" type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button v-if="canEdit(scope.row)" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑报修' : '新增报修'" v-model="dialogVisible" width="600px" align-center>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入报修标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入报修类型" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="form.priority">
            <el-radio-button label="low">低</el-radio-button>
            <el-radio-button label="medium">中</el-radio-button>
            <el-radio-button label="high">高</el-radio-button>
            <el-radio-button label="urgent">紧急</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入报修位置" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请详细描述问题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="报修详情" v-model="detailVisible" width="600px" align-center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ priorityLabel(detailData.priority) }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ detailData.location }}</el-descriptions-item>
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
const loading = ref(false)

const searchForm = reactive({ status: '' })

const form = reactive({
  id: null,
  title: '',
  type: '',
  priority: 'medium',
  location: '',
  description: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请输入类型', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }]
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdminOrProperty = ['admin', 'property'].includes(userInfo.role)

const canEdit = (row) => {
  if (isAdminOrProperty) return true
  if (userInfo.role === 'repair') return true
  return row.user_id === userInfo.id
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const params = { ...searchForm }
    if (!isAdminOrProperty && userInfo.role !== 'repair') {
      params.userId = userInfo.id
    }
    const res = await request.get('/repairs', { params })
    const data = Array.isArray(res) ? res : (res.list || [])
    tableData.value = data.map(item => ({
      ...item,
      createdAt: item.created_at,
      userName: item.user_name,
      assignedName: item.assigned_name
    }))
  } catch (error) {
    console.error('获取报修列表失败', error)
  } finally {
    loading.value = false
  }
}

const search = () => {
  loadData()
}

const resetSearch = () => {
  searchForm.status = ''
  loadData()
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: null, title: '', type: '', priority: 'medium', location: '', description: '' })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const viewDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await request.put(`/repairs/${form.id}`, form)
          ElMessage.success('更新成功')
        } else {
          await request.post('/repairs', { ...form, user_id: userInfo.id })
          ElMessage.success('新增成功')
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
      await request.delete(`/repairs/${id}`)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  }
}

const priorityLabel = (val) => {
  const map = { low: '低', medium: '中', high: '高', urgent: '紧急' }
  return map[val] || val
}

const priorityType = (val) => {
  const map = { low: 'info', medium: 'warning', high: 'danger', urgent: 'danger' }
  return map[val] || 'info'
}

const statusLabel = (val) => {
  const map = { pending: '待处理', assigned: '已分配', processing: '处理中', completed: '已完成', cancelled: '已取消' }
  return map[val] || val
}

const statusType = (val) => {
  const map = { pending: 'warning', assigned: 'primary', processing: 'success', completed: 'info', cancelled: 'info' }
  return map[val] || 'info'
}
</script>

<style scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
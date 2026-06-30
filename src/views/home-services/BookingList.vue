<template>
  <PageCard title="预约管理" subtitle="查看和管理家政服务预约">
    <template #search>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" style="width: 180px;">
            <el-option label="全部" value="" />
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
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
      <el-button type="primary" :icon="Plus" @click="openAddDialog">预约服务</el-button>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="serviceName" label="服务名称" min-width="150" />
      <el-table-column prop="userName" label="用户" width="120">
        <template #default="scope">
          <div class="user-cell">
            <el-avatar :size="28" class="user-avatar">{{ scope.row.userName.charAt(0) }}</el-avatar>
            <span>{{ scope.row.userName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="bookingTime" label="预约时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button type="success" link @click="handleConfirm(scope.row)" v-if="scope.row.status === 'pending' && isAdminOrProperty">确认</el-button>
          <el-button type="primary" link @click="handleComplete(scope.row)" v-if="scope.row.status === 'confirmed' && isAdminOrProperty">完成</el-button>
          <el-button v-if="canEdit(scope.row)" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑预约' : '预约服务'" v-model="dialogVisible" width="600px" align-center>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="服务" prop="serviceId">
          <el-select v-model="form.serviceId" style="width: 100%;">
            <el-option v-for="service in services" :key="service.id" :label="`${service.name} (¥${service.price})`" :value="service.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="预约时间" prop="bookingTime">
          <el-date-picker v-model="form.bookingTime" type="datetime" style="width: 100%;" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="预约详情" v-model="detailVisible" width="600px" align-center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="服务名称">{{ detailData.serviceName }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ detailData.bookingTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(detailData.status) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </PageCard>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import PageCard from '@/components/PageCard.vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const detailData = ref({})
const services = ref([])

const searchForm = reactive({ status: '' })

const form = reactive({ id: null, serviceId: '', bookingTime: '', remark: '' })

const rules = {
  serviceId: [{ required: true, message: '请选择服务', trigger: 'change' }],
  bookingTime: [{ required: true, message: '请选择预约时间', trigger: 'change' }]
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdminOrProperty = ['admin', 'property'].includes(userInfo.role)

const canEdit = (row) => {
  if (isAdminOrProperty) return true
  return row.user_id === userInfo.id
}

const loadServices = async () => {
  const res = await request.get('/home-services')
  services.value = Array.isArray(res) ? res : (res.list || [])
}

const loadData = async () => {
  const params = { ...searchForm }
  if (!isAdminOrProperty) {
    params.userId = userInfo.id
  }
  const res = await request.get('/bookings', { params })
  const data = Array.isArray(res) ? res : (res.list || [])
  tableData.value = data.map(item => ({
    ...item,
    serviceName: item.service_name,
    userName: item.user_name,
    handlerName: item.handler_name,
    bookingTime: item.booking_time,
    createdAt: item.created_at
  }))
}

onMounted(() => { loadServices(); loadData() })

const search = () => { loadData() }
const resetSearch = () => { searchForm.status = ''; loadData() }

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: null, serviceId: '', bookingTime: '', remark: '' })
  dialogVisible.value = true
}

const viewDetail = (row) => { detailData.value = { ...row }; detailVisible.value = true }
const handleConfirm = async (row) => {
  if (confirm('确定确认此预约吗？')) {
    await request.put(`/bookings/${row.id}`, { ...row, status: 'confirmed' })
    ElMessage.success('确认成功')
    loadData()
  }
}
const handleComplete = async (row) => {
  if (confirm('确定完成此预约吗？')) {
    await request.put(`/bookings/${row.id}`, { ...row, status: 'completed' })
    ElMessage.success('操作成功')
    loadData()
  }
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        await request.put(`/bookings/${form.id}`, form)
        ElMessage.success('更新成功')
      } else {
        await request.post('/bookings', form)
        ElMessage.success('预约成功')
      }
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleDelete = async (id) => {
  if (confirm('确定删除这条预约吗？')) {
    await request.delete(`/bookings/${id}`)
    ElMessage.success('删除成功')
    loadData()
  }
}

const statusLabel = (val) => ({ pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' })[val] || val
const statusType = (val) => ({ pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'info' })[val] || 'info'
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: #fff;
  font-weight: 600;
}
</style>

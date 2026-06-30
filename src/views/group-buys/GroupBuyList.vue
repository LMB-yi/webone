<template>
  <PageCard title="团购列表" subtitle="社区生鲜团购，便宜又新鲜">
    <template #search>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" style="width: 180px;">
            <el-option label="全部" value="" />
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
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
      <el-button type="primary" :icon="Plus" @click="openAddDialog">发布团购</el-button>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="150" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="scope">
          <span class="price-text">¥{{ Number(scope.row.price).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参与人数" width="180">
        <template #default="scope">
          <el-progress :percentage="Math.round(scope.row.currentCount / scope.row.maxCount * 100)" :stroke-width="14" :text-inside="true" />
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="170" />
      <el-table-column prop="endTime" label="结束时间" width="170" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button type="success" link @click="handleJoin(scope.row)" v-if="scope.row.status === 'ongoing'">参与</el-button>
          <el-button type="warning" link @click="handleEnd(scope.row)" v-if="scope.row.status === 'ongoing' && canEdit(scope.row)">结束</el-button>
          <el-button v-if="canEdit(scope.row)" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑团购' : '发布团购'" v-model="dialogVisible" width="600px" align-center>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="人数上限" prop="maxCount">
          <el-input-number v-model="form.maxCount" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" style="width: 100%;" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" style="width: 100%;" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="团购详情" v-model="detailVisible" width="600px" align-center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ Number(detailData.price)?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="参与人数">{{ detailData.current_count }}/{{ detailData.max_count }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ detailData.start_time }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ detailData.end_time }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(detailData.status) }}</el-descriptions-item>
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

const searchForm = reactive({ status: '' })

const form = reactive({
  id: null, title: '', price: 0, maxCount: 10, currentCount: 0, startTime: '', endTime: '', description: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  maxCount: [{ required: true, message: '请输入人数上限', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdminOrProperty = ['admin', 'property'].includes(userInfo.role)

const canEdit = (row) => {
  if (isAdminOrProperty) return true
  return row.organizer_id === userInfo.id
}

const loadData = async () => {
  const params = { ...searchForm }
  if (!isAdminOrProperty) {
    params.organizerId = userInfo.id
  }
  const res = await request.get('/group-buys', { params })
  const data = Array.isArray(res) ? res : (res.list || [])
  tableData.value = data.map(item => ({
    ...item,
    startTime: item.start_time,
    endTime: item.end_time,
    maxCount: item.max_count,
    currentCount: item.current_count,
    organizerName: item.organizer_name
  }))
}

onMounted(() => { loadData() })

const search = () => {
  loadData()
}

const resetSearch = () => {
  searchForm.status = ''
  loadData()
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: null, title: '', price: 0, maxCount: 10, currentCount: 0, startTime: '', endTime: '', description: '' })
  dialogVisible.value = true
}

const viewDetail = (row) => { detailData.value = { ...row }; detailVisible.value = true }

const handleJoin = (row) => {
  if (row.currentCount >= row.maxCount) { alert('人数已满'); return }
  if (confirm('确定参与此团购吗？')) row.currentCount++
}

const handleEnd = (row) => { if (confirm('确定结束此团购吗？')) row.status = 'ended' }

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        await request.put(`/group-buys/${form.id}`, form)
        ElMessage.success('更新成功')
      } else {
        await request.post('/group-buys', {
          title: form.title,
          description: form.description,
          price: form.price,
          start_time: form.startTime,
          end_time: form.endTime,
          max_count: form.maxCount,
          user_id: userInfo.id
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleDelete = async (id) => {
  if (confirm('确定删除这条记录吗？')) {
    await request.delete(`/group-buys/${id}`)
    ElMessage.success('删除成功')
    loadData()
  }
}

const statusLabel = (val) => ({ upcoming: '即将开始', ongoing: '进行中', ended: '已结束', cancelled: '已取消' })[val] || val
const statusType = (val) => ({ upcoming: 'warning', ongoing: 'success', ended: 'info', cancelled: 'info' })[val] || 'info'
</script>

<style scoped>
.price-text {
  color: #F56C6C;
  font-weight: 600;
  font-size: 16px;
}
</style>

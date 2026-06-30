<template>
  <PageCard title="物品列表" subtitle="交换、出售闲置物品，实现物尽其用">
    <template #search>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择" style="width: 160px;">
            <el-option label="全部" value="" />
            <el-option label="交换" value="exchange" />
            <el-option label="出售" value="sale" />
            <el-option label="两者都可以" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" style="width: 160px;">
            <el-option label="全部" value="" />
            <el-option label="交通工具" value="交通工具" />
            <el-option label="家具" value="家具" />
            <el-option label="玩具" value="玩具" />
            <el-option label="家电" value="家电" />
            <el-option label="乐器" value="乐器" />
            <el-option label="母婴" value="母婴" />
            <el-option label="运动" value="运动" />
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
      <el-button type="primary" :icon="Plus" @click="openAddDialog">发布物品</el-button>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="物品名称" min-width="150" />
      <el-table-column prop="category" label="分类" width="100">
        <template #default="scope">{{ categoryLabel(scope.row.category) }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag effect="light" round>{{ typeLabel(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100">
        <template #default="scope">
          <span v-if="scope.row.price" class="price-text">¥{{ Number(scope.row.price).toFixed(2) }}</span>
          <el-tag v-else type="success" size="small" effect="plain">免费</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ownerName" label="所有者" width="100" />
      <el-table-column prop="createdAt" label="发布时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button type="success" link @click="handleApply(scope.row)" v-if="scope.row.status === 'available'">申请</el-button>
          <el-button v-if="canEdit(scope.row)" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑物品' : '发布物品'" v-model="dialogVisible" width="600px" align-center>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="物品名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width: 100%;">
            <el-option label="交通工具" value="交通工具" />
            <el-option label="家具" value="家具" />
            <el-option label="玩具" value="玩具" />
            <el-option label="家电" value="家电" />
            <el-option label="乐器" value="乐器" />
            <el-option label="母婴" value="母婴" />
            <el-option label="运动" value="运动" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button label="exchange">交换</el-radio-button>
            <el-radio-button label="sale">出售</el-radio-button>
            <el-radio-button label="both">两者都可以</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%;" placeholder="免费则填0" />
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

    <el-dialog title="物品详情" v-model="detailVisible" width="600px" align-center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="物品名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryLabel(detailData.category) }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ typeLabel(detailData.type) }}</el-descriptions-item>
        <el-descriptions-item label="价格">{{ detailData.price ? '¥' + Number(detailData.price).toFixed(2) : '免费' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(detailData.status) }}</el-descriptions-item>
        <el-descriptions-item label="所有者">{{ detailData.owner_name }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ detailData.created_at }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.description }}</el-descriptions-item>
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

const searchForm = reactive({ type: '', category: '' })

const form = reactive({ id: null, name: '', category: 'other', type: 'both', price: 0, description: '' })

const rules = {
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdminOrProperty = ['admin', 'property'].includes(userInfo.role)

const canEdit = (row) => {
  if (isAdminOrProperty) return true
  return row.owner_id === userInfo.id
}

const loadData = async () => {
  const params = { ...searchForm }
  if (!isAdminOrProperty) {
    params.ownerId = userInfo.id
  }
  const res = await request.get('/idle-items', { params })
  const data = Array.isArray(res) ? res : (res.list || [])
  tableData.value = data.map(item => ({
    ...item,
    ownerName: item.owner_name,
    createdAt: item.created_at
  }))
}

onMounted(() => { loadData() })

const search = () => { loadData() }
const resetSearch = () => { searchForm.type = ''; searchForm.category = ''; loadData() }

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: null, name: '', category: '其他', type: 'both', price: 0, description: '' })
  dialogVisible.value = true
}

const viewDetail = (row) => { detailData.value = { ...row }; detailVisible.value = true }
const handleApply = async (row) => {
  if (confirm('确定申请此物品吗？')) {
    await request.put(`/idle-items/${row.id}`, { ...row, status: 'pending' })
    ElMessage.success('申请成功')
    loadData()
  }
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        await request.put(`/idle-items/${form.id}`, form)
        ElMessage.success('更新成功')
      } else {
        await request.post('/idle-items', { ...form, user_id: userInfo.id })
        ElMessage.success('发布成功')
      }
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleDelete = async (id) => {
  if (confirm('确定删除这条记录吗？')) {
    await request.delete(`/idle-items/${id}`)
    ElMessage.success('删除成功')
    loadData()
  }
}

const categoryLabel = (val) => ({ '交通工具': '交通工具', '家具': '家具', '玩具': '玩具', '家电': '家电', '乐器': '乐器', '母婴': '母婴', '运动': '运动', '其他': '其他' })[val] || val
const typeLabel = (val) => ({ exchange: '交换', sale: '出售', both: '两者都可以' })[val] || val
const statusLabel = (val) => ({ available: '可交易', pending: '处理中', exchanged: '已交换', sold: '已出售' })[val] || val
const statusType = (val) => ({ available: 'success', pending: 'warning', exchanged: 'info', sold: 'info' })[val] || 'info'
</script>

<style scoped>
.price-text {
  color: #F56C6C;
  font-weight: 600;
  font-size: 16px;
}
</style>

<template>
  <PageCard title="服务管理" subtitle="管理社区可预约的家政服务">
    <template #toolbar>
      <el-button v-if="isAdminOrProperty" type="primary" :icon="Plus" @click="openAddDialog">添加服务</el-button>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="服务名称" min-width="150" />
      <el-table-column prop="category" label="分类" width="100">
        <template #default="scope">{{ categoryLabel(scope.row.category) }}</template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100">
        <template #default="scope">
          <span class="price-text">¥{{ Number(scope.row.price).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长" width="120">
        <template #default="scope">{{ scope.row.duration }} 分钟</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-switch v-if="isAdminOrProperty" v-model="scope.row.status" :active-value="true" :inactive-value="false" />
          <el-tag v-else :type="scope.row.status ? 'success' : 'info'">{{ scope.row.status ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button v-if="isAdminOrProperty" type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button v-if="isAdminOrProperty" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑服务' : '添加服务'" v-model="dialogVisible" width="600px" align-center>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width: 100%;">
            <el-option label="保洁" value="cleaning" />
            <el-option label="维修" value="repair" />
            <el-option label="搬运" value="moving" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="时长(分钟)" prop="duration">
          <el-input-number v-model="form.duration" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
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

    <el-dialog title="服务详情" v-model="detailVisible" width="600px" align-center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="服务名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryLabel(detailData.category) }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ Number(detailData.price)?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ detailData.duration }}分钟</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status ? '上架' : '下架' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.created_at }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </PageCard>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import PageCard from '@/components/PageCard.vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const detailData = ref({})

const form = reactive({ id: null, name: '', category: 'cleaning', price: 0, duration: 60, status: true, description: '' })

const rules = {
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入时长', trigger: 'blur' }]
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdminOrProperty = ['admin', 'property'].includes(userInfo.role)

const loadData = async () => {
  const res = await request.get('/home-services')
  const data = Array.isArray(res) ? res : (res.list || [])
  tableData.value = data.map(item => ({
    ...item,
    createdAt: item.created_at
  }))
}

onMounted(() => { loadData() })

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: null, name: '', category: 'cleaning', price: 0, duration: 60, status: true, description: '' })
  dialogVisible.value = true
}

const openEditDialog = (row) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const viewDetail = (row) => { detailData.value = { ...row }; detailVisible.value = true }

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        await request.put(`/home-services/${form.id}`, form)
        ElMessage.success('更新成功')
      } else {
        await request.post('/home-services', form)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleDelete = async (id) => {
  if (confirm('确定删除这条服务吗？')) {
    await request.delete(`/home-services/${id}`)
    ElMessage.success('删除成功')
    loadData()
  }
}

const categoryLabel = (val) => ({ cleaning: '保洁', repair: '维修', moving: '搬运', other: '其他' })[val] || val
</script>

<style scoped>
.price-text {
  color: #F56C6C;
  font-weight: 600;
  font-size: 16px;
}
</style>

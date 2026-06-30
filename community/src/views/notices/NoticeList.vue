<template>
  <PageCard title="公告通知" subtitle="发布社区公告，及时传递重要信息">
    <template #search>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择" style="width: 160px;">
            <el-option label="全部" value="" />
            <el-option label="通知" value="notification" />
            <el-option label="公告" value="announcement" />
            <el-option label="活动" value="activity" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template #toolbar>
      <el-button v-if="isAdminOrProperty" type="primary" :icon="Plus" @click="openAddDialog">发布公告</el-button>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column label="置顶" width="70">
        <template #default="scope">
          <el-tag v-if="scope.row.isTopped" type="danger" effect="dark" size="small">置顶</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag effect="light">{{ typeLabel(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="发布时间" width="180" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button v-if="isAdminOrProperty" type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button v-if="isAdminOrProperty" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑公告' : '发布公告'" v-model="dialogVisible" width="600px" align-center>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button label="notification">通知</el-radio-button>
            <el-radio-button label="announcement">公告</el-radio-button>
            <el-radio-button label="activity">活动</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="form.isTopped" inline-prompt active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="公告详情" v-model="detailVisible" width="600px" align-center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ typeLabel(detailData.type) }}</el-descriptions-item>
        <el-descriptions-item label="置顶">{{ detailData.isTopped ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ detailData.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">{{ detailData.content }}</el-descriptions-item>
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

const searchForm = reactive({ type: '' })

const form = reactive({ id: null, title: '', type: 'notification', isTopped: false, content: '' })

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdminOrProperty = ['admin', 'property'].includes(userInfo.role)

const loadData = async () => {
  const res = await request.get('/notices', { params: searchForm })
  const data = Array.isArray(res) ? res : (res.list || [])
  tableData.value = data.map(item => ({
    ...item,
    isTopped: item.is_topped,
    createdAt: item.created_at,
    publisherName: item.publisher_name
  })).sort((a, b) => b.isTopped - a.isTopped)
}

onMounted(() => { loadData() })

const search = () => { loadData() }
const resetSearch = () => { searchForm.type = ''; loadData() }

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: null, title: '', type: 'notification', isTopped: false, content: '' })
  dialogVisible.value = true
}

const openEditDialog = (row) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }

const viewDetail = (row) => { detailData.value = { ...row }; detailVisible.value = true }

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const submitData = {
        ...form,
        is_topped: form.isTopped
      }
      delete submitData.isTopped
      if (isEdit.value) {
        await request.put(`/notices/${form.id}`, submitData)
        ElMessage.success('更新成功')
      } else {
        await request.post('/notices', submitData)
        ElMessage.success('发布成功')
      }
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleDelete = async (id) => {
  if (confirm('确定删除这条公告吗？')) {
    await request.delete(`/notices/${id}`)
    ElMessage.success('删除成功')
    loadData()
  }
}

const typeLabel = (val) => ({ notification: '通知', announcement: '公告', activity: '活动' })[val] || val
</script>

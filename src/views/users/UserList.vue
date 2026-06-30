<template>
  <PageCard title="用户列表" subtitle="管理系统用户信息">
    <template #search>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" style="width: 180px;" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择" style="width: 160px;">
            <el-option label="全部" value="" />
            <el-option label="居民" value="resident" />
            <el-option label="管理员" value="admin" />
            <el-option label="物业" value="property" />
            <el-option label="维修人员" value="repair" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template #toolbar>
      <el-button type="primary" :icon="Plus" @click="openAddDialog">添加用户</el-button>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="120">
        <template #default="scope">
          <div class="user-cell">
            <el-avatar :size="32" class="user-avatar">{{ scope.row.username.charAt(0) }}</el-avatar>
            <span>{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="scope">
          <el-tag :type="roleType(scope.row.role)" effect="light">{{ roleLabel(scope.row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creditScore" label="信用分" width="100" align="center">
        <template #default="scope">
          <el-tag effect="plain" round>{{ scope.row.creditScore }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'info'">{{ scope.row.status ? '正常' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑用户' : '添加用户'" v-model="dialogVisible" width="500px" align-center>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? '留空表示不修改' : '请输入密码'" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%;">
            <el-option label="居民" value="resident" />
            <el-option label="管理员" value="admin" />
            <el-option label="物业" value="property" />
            <el-option label="维修人员" value="repair" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="用户详情" v-model="detailVisible" width="500px" align-center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ detailData.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ roleLabel(detailData.role) }}</el-descriptions-item>
        <el-descriptions-item label="信用分">{{ detailData.creditScore }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status ? '正常' : '禁用' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
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

const searchForm = reactive({ username: '', role: '' })

const form = reactive({ id: null, username: '', phone: '', password: '', role: 'resident', status: true })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const loadData = async () => {
  const res = await request.get('/users', { params: searchForm })
  const data = Array.isArray(res) ? res : (res.list || [])
  tableData.value = data.map(item => ({
    ...item,
    creditScore: item.credit_score,
    createdAt: item.created_at
  }))
}

onMounted(() => { loadData() })

const search = () => { loadData() }

const resetSearch = () => { searchForm.username = ''; searchForm.role = ''; loadData() }

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: null, username: '', phone: '', password: '', role: 'resident', status: true })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(form, { id: row.id, username: row.username, phone: row.phone, password: '', role: row.role, status: row.status })
  dialogVisible.value = true
}

const viewDetail = (row) => { detailData.value = { ...row }; detailVisible.value = true }

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        await request.put(`/users/${form.id}`, form)
        ElMessage.success('更新成功')
      } else {
        await request.post('/users', form)
        ElMessage.success('添加成功')
      }
      loadData()
      dialogVisible.value = false
    }
  })
}

const handleDelete = async (id) => {
  if (confirm('确定删除此用户吗？')) {
    await request.delete(`/users/${id}`)
    ElMessage.success('删除成功')
    loadData()
  }
}

const roleLabel = (val) => ({ resident: '居民', admin: '管理员', property: '物业', repair: '维修人员' })[val] || val
const roleType = (val) => ({ resident: 'primary', admin: 'danger', property: 'warning', repair: 'success' })[val] || 'info'
</script>

<style scoped>
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

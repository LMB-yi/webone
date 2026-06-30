<template>
  <PageCard title="消息通知" subtitle="查看系统通知消息">
    <template #toolbar>
      <el-button type="primary" :icon="Check" @click="markAllRead">全部已读</el-button>
      <el-button type="danger" :icon="Delete" @click="deleteAllRead">删除已读</el-button>
    </template>
    <template #search>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="状态">
          <el-select v-model="searchForm.isRead" placeholder="请选择" style="width: 180px;">
            <el-option label="全部" value="" />
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="180">
        <template #default="scope">
          <div class="title-cell">
            <el-badge v-if="!scope.row.isRead" is-dot :offset="[0, 8]" />
            <span :class="{ 'unread-title': !scope.row.isRead }">{{ scope.row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="typeTagType(scope.row.type)" effect="light">{{ typeLabel(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isRead" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isRead ? 'info' : 'danger'">{{ scope.row.isRead ? '已读' : '未读' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          <el-button v-if="scope.row.isRead" type="warning" link @click="markUnread(scope.row.id)">标记未读</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="通知详情" v-model="detailVisible" width="500px" align-center>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ typeLabel(detailData.type) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.isRead ? '已读' : '未读' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="内容">{{ detailData.content }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageCard>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Check, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageCard from '@/components/PageCard.vue'
import request from '@/utils/request'

const tableData = ref([])
const detailVisible = ref(false)
const detailData = ref({})

const searchForm = reactive({ isRead: '' })

const loadData = async () => {
  const res = await request.get('/notifications')
  const data = Array.isArray(res) ? res : (res.list || [])
  const filtered = searchForm.isRead === '' ? data : data.filter(item => item.is_read === searchForm.isRead)
  tableData.value = filtered.map(item => ({
    ...item,
    isRead: item.is_read,
    createdAt: item.created_at
  }))
}

onMounted(() => { loadData() })

const search = () => { loadData() }
const resetSearch = () => { searchForm.isRead = ''; loadData() }

const handleRead = async (id) => {
  await request.put(`/notifications/${id}/read`)
  loadData()
  window.dispatchEvent(new Event('notificationUpdated'))
}

const markUnread = async (id) => {
  await request.put(`/notifications/${id}/unread`)
  ElMessage.success('已标记为未读')
  loadData()
  window.dispatchEvent(new Event('notificationUpdated'))
}

const viewDetail = (row) => { handleRead(row.id); detailData.value = row; detailVisible.value = true }
const markAllRead = async () => {
  const unreadIds = tableData.value.filter(item => !item.isRead).map(item => item.id)
  await Promise.all(unreadIds.map(id => request.put(`/notifications/${id}/read`)))
  ElMessage.success('全部已读')
  loadData()
  window.dispatchEvent(new Event('notificationUpdated'))
}
const deleteAllRead = async () => {
  const readIds = tableData.value.filter(item => item.isRead).map(item => item.id)
  await Promise.all(readIds.map(id => request.delete(`/notifications/${id}`)))
  ElMessage.success('已读通知已删除')
  loadData()
  window.dispatchEvent(new Event('notificationUpdated'))
}
const handleDelete = async (id) => {
  if (confirm('确定删除这条通知吗？')) {
    await request.delete(`/notifications/${id}`)
    ElMessage.success('删除成功')
    loadData()
    window.dispatchEvent(new Event('notificationUpdated'))
  }
}

const typeLabel = (val) => ({ repair: '报修', mutual_aid: '互助', group_buy: '团购', notice: '公告', booking: '预约', system: '系统' })[val] || val
const typeTagType = (val) => ({ repair: 'danger', mutual_aid: 'success', group_buy: 'warning', notice: 'info', booking: 'primary', system: 'info' })[val] || 'info'
</script>

<style scoped>
.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-title {
  font-weight: 600;
  color: #303133;
}
</style>

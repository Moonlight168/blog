<template>
  <n-config-provider :theme="null" :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <div class="offer-dashboard">
        <!-- 统计卡片：5 张全部随筛选条件变化；占比以全部岗位为分母；hover 显示百分比 -->
        <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:5" responsive="screen" class="stats-row">
          <n-gi>
            <n-card hoverable embedded>
              <div class="stat-card">
                <div class="stat-card-head">
                  <n-icon :size="16" class="stat-card-icon"><Stack /></n-icon>
                  <span class="stat-card-label">总岗位</span>
                </div>
                <n-tooltip :show="hover.real" trigger="manual" placement="right">
                  <template #trigger>
                    <div
                      class="stat-ring"
                      :style="ringStyle(filteredStats.real, stats.real_count, 'normal')"
                      @mouseenter="hover.real = true"
                      @mouseleave="hover.real = false"
                    >
                      <span class="stat-value">{{ filteredStats.real }}</span>
                    </div>
                  </template>
                  {{ formatRatio(filteredStats.real, stats.real_count) }}
                </n-tooltip>
              </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded>
              <div class="stat-card">
                <div class="stat-card-head">
                  <n-icon :size="16" class="stat-card-icon"><Check /></n-icon>
                  <span class="stat-card-label">已投递</span>
                </div>
                <n-tooltip :show="hover.applied" trigger="manual" placement="right">
                  <template #trigger>
                    <div
                      class="stat-ring"
                      :style="ringStyle(filteredStats.applied, stats.real_count, 'normal')"
                      @mouseenter="hover.applied = true"
                      @mouseleave="hover.applied = false"
                    >
                      <span class="stat-value">{{ filteredStats.applied }}</span>
                    </div>
                  </template>
                  {{ formatRatio(filteredStats.applied, stats.real_count) }}
                </n-tooltip>
              </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded>
              <div class="stat-card">
                <div class="stat-card-head">
                  <n-icon :size="16" class="stat-card-icon"><Clock /></n-icon>
                  <span class="stat-card-label">待投递</span>
                </div>
                <n-tooltip :show="hover.pending" trigger="manual" placement="right">
                  <template #trigger>
                    <div
                      class="stat-ring"
                      :style="ringStyle(filteredStats.pending, stats.real_count, 'normal')"
                      @mouseenter="hover.pending = true"
                      @mouseleave="hover.pending = false"
                    >
                      <span class="stat-value">{{ filteredStats.pending }}</span>
                    </div>
                  </template>
                  {{ formatRatio(filteredStats.pending, stats.real_count) }}
                </n-tooltip>
              </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded class="urgent-card">
              <div class="stat-card">
                <div class="stat-card-head">
                  <n-icon :size="16" class="stat-card-icon"><AlertTriangle /></n-icon>
                  <span class="stat-card-label">已挂</span>
                </div>
                <n-tooltip :show="hover.rejected" trigger="manual" placement="right">
                  <template #trigger>
                    <div
                      class="stat-ring"
                      :style="ringStyle(filteredStats.rejected, stats.real_count, 'urgent')"
                      @mouseenter="hover.rejected = true"
                      @mouseleave="hover.rejected = false"
                    >
                      <span class="stat-value">{{ filteredStats.rejected }}</span>
                    </div>
                  </template>
                  {{ formatRatio(filteredStats.rejected, stats.real_count) }}
                </n-tooltip>
              </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded>
              <div class="stat-card">
                <div class="stat-card-head">
                  <n-icon :size="16" class="stat-card-icon"><CircleX /></n-icon>
                  <span class="stat-card-label">人才储备库</span>
                </div>
                <n-tooltip :show="hover.talent_pool" trigger="manual" placement="right">
                  <template #trigger>
                    <div
                      class="stat-ring"
                      :style="ringStyle(filteredStats.talent_pool, stats.real_count, 'normal')"
                      @mouseenter="hover.talent_pool = true"
                      @mouseleave="hover.talent_pool = false"
                    >
                      <span class="stat-value">{{ filteredStats.talent_pool }}</span>
                    </div>
                  </template>
                  {{ formatRatio(filteredStats.talent_pool, stats.real_count) }}
                </n-tooltip>
              </div>
            </n-card>
          </n-gi>
        </n-grid>

        <!-- 操作按钮 -->
        <n-space wrap class="actions-row">
          <n-button type="primary" @click="openNew"><template #icon><n-icon><Plus /></n-icon></template>新增岗位</n-button>
          <n-button @click="refreshFromDB" :loading="reloading"><template #icon><n-icon><Refresh /></n-icon></template>刷新数据</n-button>
          <n-button @click="refreshFromWeb" :loading="refreshing" disabled><template #icon><n-icon><Globe /></n-icon></template>拉取最新岗位</n-button>
          <n-input v-model:value="keyword" placeholder="搜索 公司 / 岗位 / 备注" clearable style="width: 260px" />
          <n-button quaternary type="primary" @click="resetFilters"><template #icon><n-icon><FilterOff /></n-icon></template>重置筛选</n-button>
          <n-popconfirm
            @positive-click="onBulkDelete"
            :positive-button-props="{ loading: bulkDeleting }"
            :show="bulkPopOpen"
            @update:show="(v) => (bulkPopOpen = v)"
          >
            <template #trigger>
              <n-button
                type="error"
                ghost
                :loading="bulkDeleting"
                :disabled="checkedIds.length === 0"
                @click="bulkPopOpen = checkedIds.length > 0"
              >
                <template #icon><n-icon><Trash /></n-icon></template>
                批量删除 ({{ checkedIds.length }})
              </n-button>
            </template>
            确认删除选中的 {{ checkedIds.length }} 条岗位？此操作不可撤销。
          </n-popconfirm>
        </n-space>

        <!-- 筛选 -->
        <n-card size="small" :bordered="true" class="filter-card" embedded>
          <div class="filter-row">
            <div class="filter-cell">
              <span class="filter-label">类别</span>
              <n-select
                v-model:value="filter.category"
                :options="categoryOptions"
                multiple size="small" placeholder="不限"
                :max-tag-count="2" :render-tag="renderCategoryTag"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">地点</span>
              <n-select
                v-model:value="filter.city"
                :options="cityOptions"
                multiple size="small" placeholder="不限"
                :max-tag-count="2" :render-tag="renderCityTag"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">截止</span>
              <n-select
                v-model:value="filter.deadlineRange"
                :options="deadlineOptions"
                size="small"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">周末</span>
              <n-select
                v-model:value="filter.weekend"
                :options="weekendOptions"
                size="small"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">薪资</span>
              <n-select
                v-model:value="filter.salaryMin"
                :options="salaryOptions"
                size="small"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">投递</span>
              <n-select
                v-model:value="filter.applied"
                :options="appliedFilterOptions"
                multiple size="small" placeholder="不限"
                :max-tag-count="2"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">环节</span>
              <n-select
                v-model:value="filter.round"
                :options="stageFilterOptions"
                multiple size="small" placeholder="不限"
                :max-tag-count="2"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">结果</span>
              <n-select
                v-model:value="filter.result"
                :options="resultFilterOptions"
                multiple size="small" placeholder="不限"
                :max-tag-count="2"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">批次</span>
              <n-select
                v-model:value="filter.batch"
                :options="batchFilterOptions"
                multiple size="small" placeholder="不限"
                :max-tag-count="2"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">验证</span>
              <n-select
                v-model:value="filter.verified"
                :options="verifiedFilterOptions"
                size="small"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">来源</span>
              <n-select
                v-model:value="filter.source"
                :options="sourceFilterOptions"
                size="small"
              />
            </div>
          </div>
        </n-card>

        <!-- 表格 + 分页（全由 n-data-table 内置处理） -->
        <n-card :bordered="true" class="table-card" embedded>
          <n-data-table
            :columns="columns"
            :data="pagedJobs"
            :row-key="(row) => row.id"
            :bordered="false"
            :single-line="false"
            size="small"
            :row-props="rowProps"
            :pagination="false"
            :checked-row-keys="checkedIds"
            @update:checked-row-keys="(keys) => (checkedIds = keys)"
            @update:sorter="onSorterChange"
          />
          <n-pagination
            v-if="filteredJobs.length > 0"
            class="table-pagination"
            :page="tablePage"
            :page-size="tablePageSize"
            :item-count="filteredJobs.length"
            :page-sizes="[10, 20, 50, 100]"
            show-size-picker
            show-quick-jumper
            @update:page="(p) => (tablePage = p)"
            @update:page-size="(s) => { tablePageSize = s; tablePage = 1 }"
          >
            <template #prefix>共 {{ filteredJobs.length }} 条</template>
          </n-pagination>
        </n-card>

        <JobForm v-model:show="formOpen" :job="editingJob" @save="onSave" />
        <n-modal
          v-model:show="applyModalOpen"
          preset="card"
          :title="applyModalJob ? `🚀 去投递 — ${applyModalJob.company} · ${applyModalJob.position}` : '去投递'"
          style="width:560px; max-width:calc(100vw - 32px)"
          @update:show="(v) => { if (!v) closeApplyModal() }"
        >
          <div v-if="applyModalJob" class="apply-modal-content">
            <n-descriptions :column="1" bordered size="small">
              <n-descriptions-item label="公司">{{ applyModalJob.company }}</n-descriptions-item>
              <n-descriptions-item label="岗位">{{ applyModalJob.position }}</n-descriptions-item>
              <n-descriptions-item label="工作地">{{ applyModalJob.city }} · {{ applyModalJob.category }}</n-descriptions-item>
              <n-descriptions-item v-if="applyModalJob.salary_range" label="薪资">{{ applyModalJob.salary_range }}</n-descriptions-item>
              <n-descriptions-item v-if="applyModalJob.deadline" label="截止日期">{{ applyModalJob.deadline }}</n-descriptions-item>
              <n-descriptions-item label="投递链接">
                <a :href="applyModalJob.link" target="_blank" rel="noopener" style="color:#18a058;word-break:break-all">{{ applyModalJob.link }}</a>
              </n-descriptions-item>
            </n-descriptions>
            <n-space justify="end" style="margin-top:16px">
              <n-button @click="closeApplyModal">关闭</n-button>
              <n-button type="primary" @click="() => { window.open(applyModalJob.link, '_blank', 'noopener') }">
                <template #icon><n-icon><ExternalLink /></n-icon></template>
                去投递
              </n-button>
            </n-space>
          </div>
        </n-modal>
        <n-modal
          v-model:show="detailModalOpen"
          preset="card"
          :title="detailModalJob ? `${detailModalJob.company} · ${detailModalJob.position}` : '岗位详情'"
          style="width:680px; max-width:calc(100vw - 32px)"
          @update:show="(v) => { if (!v) closeDetail() }"
        >
          <div v-if="detailModalJob" class="detail-modal-content">
            <div v-if="detailModalJob.notes" style="white-space:pre-wrap;font-size:14px;line-height:1.8;word-break:break-word;max-height:60vh;overflow-y:auto;padding:12px 16px;background:#fafbfc;border-radius:8px;border:1px solid #eee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">{{ detailModalJob.notes }}</div>
            <div v-else style="color:#aaa;text-align:center;padding:40px 0">暂无备注内容</div>
            <n-space justify="end" style="margin-top:12px">
              <n-button @click="closeDetail">关闭</n-button>
            </n-space>
          </div>
        </n-modal>
        <n-modal v-model:show="refreshing" :mask-closable="false" preset="card" style="width:560px" :title="fetchStatus.title">
          <n-space vertical size="medium">
            <div class="fetch-progress">
              <div v-for="(step, i) in fetchStatus.steps" :key="i" class="fetch-step" :class="step.cls">
                <n-icon :class="['fetch-step-icon', step.cls]" :size="18">
                  <component :is="step.iconComp" />
                </n-icon>
                <span class="fetch-step-label">{{ step.label }}</span>
                <span class="fetch-step-msg">{{ step.msg || (step.cls === 'pending' ? '等待…' : '') }}</span>
              </div>
            </div>

            <n-alert v-if="fetchStatus.error" type="error" :title="fetchStatus.errorSummary || fetchStatus.error" style="font-size:13px">
              <details v-if="fetchStatus.stderr" class="fetch-error-details">
                <summary>展开完整 stderr</summary>
                <pre class="fetch-error-detail">{{ fetchStatus.stderr }}</pre>
              </details>
            </n-alert>

            <n-collapse v-if="fetchStatus.output" :default-expanded="false">
              <n-collapse-item title="完整运行日志（stdout）" name="log">
                <pre class="fetch-output">{{ fetchStatus.output }}</pre>
              </n-collapse-item>
            </n-collapse>

            <n-space justify="end">
              <n-button v-if="fetchDone" type="primary" @click="closeFetchModal">关闭</n-button>
              <n-button v-else size="small" disabled>
                <template #icon><n-icon><Loader /></n-icon></template>
                正在拉取中…
              </n-button>
            </n-space>
          </n-space>
        </n-modal>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h, watch } from 'vue'
import {
  NConfigProvider, NMessageProvider, NGrid, NGi, NCard,
  NIcon, NSpace, NButton, NInput, NTooltip,
  NTag, NSelect, NDataTable, NModal, NSpin, NPopconfirm, NPagination, useMessage, zhCN, dateZhCN,
} from 'naive-ui'
import { Plus, Refresh, Globe, Stack, Check, Clock, AlertTriangle, Edit, Trash, ExternalLink, Circle, CircleCheck, CircleX, AlertCircle, Loader, FilterOff } from '@vicons/tabler'
import JobForm from './JobForm.vue'

const categories = ['公务员', '国企', '事业单位', '大厂', '中大厂', '中小厂', '小而美企业']
const cities = ['广州市', '深圳市', '佛山市', '清远市', '上海市', '东莞市']

const categoryOptions = categories.map(c => ({ label: c, value: c }))
const cityOptions = cities.map(c => ({ label: c, value: c }))

const renderTag = (type, label, handleClose) =>
  h(NTag, { type, size: 'small', bordered: false, closable: true, onClose: handleClose }, { default: () => h('span', { style: 'color:inherit' }, label) })
const renderCategoryTag = ({ option, handleClose }) => renderTag(catTag[option.value] || 'default', option.label, handleClose)
const renderCityTag = ({ option, handleClose }) => renderTag('default', option.label, handleClose)
const deadlineOptions = [
  { label: '不限', value: 'all' },
  { label: '招聘中', value: 'active' },
  { label: '已过期', value: 'overdue' },
]
const appliedFilterOptions = [
  { label: '待投递', value: 0 },
  { label: '已投递', value: 1 },
  { label: '已 offer', value: 4 },
  { label: '已结束', value: 5 },
]
const resultFilterOptions = [
  { label: '进行中', value: 0 },
  { label: '过', value: 1 },
  { label: '挂', value: -1 },
  { label: '主动撤回', value: -7 },
  { label: '我拒 offer', value: -8 },
  { label: 'offer 撤回', value: -9 },
  { label: '人才储备库', value: -10 },
  { label: '其他', value: 99 },
]
const stageFilterOptions = [
  { label: '简历初筛', value: 0 },
  { label: '测评', value: 1 },
  { label: '笔试', value: 2 },
  { label: '一面', value: 3 },
  { label: '二面', value: 4 },
  { label: '三面', value: 5 },
  { label: '终面', value: 6 },
  { label: 'HR 面', value: 7 },
]
const batchFilterOptions = [
  { label: '实习', value: '实习' },
  { label: '27届秋招提前批', value: '27届秋招提前批' },
  { label: '27届秋招', value: '27届秋招' },
  { label: '27届春招', value: '27届春招' },
  { label: '未开始', value: '未开始' },
]
const verifiedFilterOptions = [
  { label: '不限', value: 'all' },
  { label: '待验证', value: 0 },
  { label: '已验证', value: 1 },
  { label: '失效', value: 2 },
]
const sourceFilterOptions = [
  { label: '不限', value: 'all' },
  { label: '官网', value: '官网' },
  { label: '前程无忧', value: '前程无忧' },
  { label: '应届生招聘', value: '应届生招聘' },
  { label: '猎聘', value: '猎聘' },
  { label: '智联招聘', value: '智联招聘' },
  { label: 'BOSS直聘', value: 'BOSS直聘' },
]
const salaryOptions = [
  { label: '不限', value: 0 },
  { label: '≤3k', value: -3 },
  { label: '3-4k', value: 3 },
  { label: '4-5k', value: 4 },
  { label: '5-8k', value: 5 },
  { label: '8k-1w', value: 8 },
  { label: '≥1w', value: 10 },
]
const weekendOptions = [
  { label: '不限', value: 'all' },
  { label: '双休', value: '周末双休' },
  { label: '单休', value: '单休' },
  { label: '大小周', value: '大小周' },
  { label: '未知', value: 'unknown' },
]

const catTag = { '公务员': 'info', '国企': 'error', '事业单位': 'warning', '大厂': 'success', '中大厂': 'success', '中小厂': 'warning', '小而美企业': 'default' }

const themeOverrides = { common: { primaryColor: '#18a058', primaryColorHover: '#36ad6a', primaryColorPressed: '#0c7a43', primaryColorSuppl: '#36ad6a', borderRadius: '6px' } }

const jobs = ref([])
const stats = reactive({ total: 0, real_count: 0, placeholder_count: 0, applied_count: 0, pending_count: 0, urgent_count: 0, rejected_count: 0 })
const formOpen = ref(false)
const editingJob = ref(null)
const applyModalOpen = ref(false)
const applyModalJob = ref(null)
const detailModalOpen = ref(false)
const detailModalJob = ref(null)
const keyword = ref('')
const reloading = ref(false)
const checkedIds = ref([])
const bulkDeleting = ref(false)
const bulkPopOpen = ref(false)
// 4 张卡片各自的 hover 状态（手动控制 tooltip 显示百分比）
const hover = reactive({ real: false, applied: false, pending: false, rejected: false, talent_pool: false })
const filter = reactive({ category: [...categories], city: [...cities], applied: [0, 1, 4, 5], result: [0, 1, -1, -7, -8, -9, -10, 99], round: [0, 1, 2, 3, 4, 5, 6, 7], batch: ['实习', '27届秋招提前批', '27届秋招', '27届春招', '未开始'], verified: 'all', source: 'all', salaryMin: 0, weekend: 'all', deadlineRange: 'all' })
let msg = null

onMounted(() => { try { msg = useMessage() } catch(e) {} ; refreshFromDB(false); loadCompanies() })

// ===== API 调用 =====
// 加载数据 + 统计（静默模式不弹 toast）
const refreshFromDB = async (silent = false) => {
  reloading.value = true
  try {
    const [jobsRes, statsRes] = await Promise.all([
      fetch('/api/jobs?weekend=' + encodeURIComponent(filter.weekend)).then(r => r.json()),
      fetch('/api/jobs/stats').then(r => r.json()),
    ])
    if (!jobsRes.success) throw new Error(jobsRes.error || '查询失败')
    if (!statsRes.success) throw new Error(statsRes.error || '统计失败')
    jobs.value = jobsRes.data
    Object.assign(stats, statsRes.stats)
    if (!silent) msg?.success(`已加载 ${jobs.value.length} 条岗位`)
  } catch (e) {
    msg?.warning('从数据库加载失败：' + e.message)
  } finally {
    reloading.value = false
  }
}

// 双休筛选变化时重新加载
watch(() => filter.weekend, () => refreshFromDB(true))

// 单字段更新（如勾选已投递）— 用 PATCH 接口，不传整个数组
const patchJob = async (id, patch) => {
  // 自动维护 applied_at：applied 0→>=1 时记"投递日期"(YYYY-MM-DD),>=1→0 时清空
  if (patch.applied !== undefined) {
    const current = jobs.value.find(j => j.id === id)
    const oldApplied = Number(current?.applied ?? 0)
    const newApplied = Number(patch.applied)
    if (oldApplied < 1 && newApplied >= 1) {
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      patch.applied_at = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
    } else if (oldApplied >= 1 && newApplied < 1) {
      patch.applied_at = ''
    }
  }
  try {
    const r = await fetch('/api/jobs/patch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    })
    const d = await r.json()
    if (!d.success) throw new Error(d.error || '更新失败')
    // 局部更新本地状态
    const idx = jobs.value.findIndex(j => j.id === id)
    if (idx >= 0) jobs.value[idx] = { ...jobs.value[idx], ...patch }
    // 重读统计
    const statsRes = await fetch('/api/jobs/stats').then(r => r.json())
    if (statsRes.success) Object.assign(stats, statsRes.stats)
  } catch (e) {
    msg?.warning('保存失败：' + e.message)
  }
}

// 新增 / 编辑
const openNew = () => { editingJob.value = null; formOpen.value = true }
const openEdit = (job) => { editingJob.value = { ...job }; formOpen.value = true }
const openApplyModal = (job) => { applyModalJob.value = { ...job }; applyModalOpen.value = true }
const closeApplyModal = () => { applyModalOpen.value = false; applyModalJob.value = null }
const openDetail = (job) => { detailModalJob.value = { ...job }; detailModalOpen.value = true }
const closeDetail = () => { detailModalOpen.value = false; detailModalJob.value = null }

const onSave = async (job) => {
  try {
    // 同步:result=-1(挂) → applied=5(已结束)
    if (job.result === -1 || Number(job.result) === -1) {
      job.applied = 5
    }
    // 有 id → PATCH 更新;无 id → POST 新增
    const url = job.id ? '/api/jobs/patch' : '/api/jobs'
    const method = job.id ? 'POST' : 'POST'
    const body = job.id ? { id: job.id, ...job } : { jobs: [job], source: 'manual' }
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await r.json()
    if (!d.success) throw new Error(d.error || '保存失败')
    formOpen.value = false
    editingJob.value = null
    msg?.success(job.id ? '已更新' : '已新增')
    await refreshFromDB(true)
  } catch (e) {
    msg?.warning('保存失败：' + e.message)
  }
}

const remove = async (job) => {
  try {
    const r = await fetch('/api/jobs/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: job.id }),
    })
    const d = await r.json()
    if (!d.success) throw new Error(d.error || '删除失败')
    msg?.success('已删除')
    await refreshFromDB(true)
  } catch (e) {
    msg?.warning('删除失败：' + e.message)
  }
}

// 批量删除：选中行一次请求，删除成功后再清空选中
const onBulkDelete = async () => {
  if (checkedIds.value.length === 0) return
  bulkDeleting.value = true
  try {
    const r = await fetch('/api/jobs/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...checkedIds.value] }),
    })
    const d = await r.json()
    if (!d.success) throw new Error(d.error || '批量删除失败')
    msg?.success(`已删除 ${d.deleted ?? 0} / ${d.total} 条`)
    checkedIds.value = []
    bulkPopOpen.value = false
    await refreshFromDB(true)
  } catch (e) {
    msg?.warning('批量删除失败：' + e.message)
  } finally {
    bulkDeleting.value = false
  }
}

// 数据刷新后清掉已失效的勾选（被同步删除的行）
watch(jobs, (next) => {
  if (checkedIds.value.length === 0) return
  const alive = new Set(next.map(j => j.id))
  checkedIds.value = checkedIds.value.filter(id => alive.has(id))
})

const resetFilters = () => { filter.category = [...categories]; filter.city = [...cities]; filter.applied = [0, 1, 4, 5]; filter.result = [0, 1, -1, -7, -8, -9, -10, 99]; filter.round = [0, 1, 2, 3, 4, 5, 6, 7]; filter.batch = ['实习', '27届秋招提前批', '27届秋招', '27届春招', '未开始']; filter.verified = 'all'; filter.source = 'all'; filter.salaryMin = 0; filter.weekend = 'all'; filter.deadlineRange = 'all'; keyword.value = '' }

// 拉取最新（按钮触发 fetch.mjs，跑完后从 DB 重载）
const refreshing = ref(false)
const fetchDone = ref(false)  // 独立 ref 避免大对象响应式丢更新
const fetchStatus = ref({
  title: '正在拉取最新校招岗位…',
  steps: [
    { key: 'search', label: '① 搜索', iconComp: Circle, msg: '', cls: 'pending' },
    { key: 'filter', label: '② 去重 / 过滤', iconComp: Circle, msg: '', cls: 'pending' },
    { key: 'extract', label: '③ AI 提炼', iconComp: Circle, msg: '', cls: 'pending' },
    { key: 'insert', label: '④ 写入数据库', iconComp: Circle, msg: '', cls: 'pending' },
  ],
  output: '',
  stderr: '',
  error: null,
  errorSummary: '',
})

// 从 stderr 里提炼关键错误（去掉堆栈/版本号，只留第一句）
const summarizeError = (stderr, fallback) => {
  if (!stderr) return fallback || '未知错误'
  const lines = stderr.split('\n').map(l => l.trim()).filter(Boolean)
  const meaningful = lines.filter(l =>
    !/^[=\-]+$/.test(l) && !/^Node\.js v/.test(l) && !l.startsWith('> ')
  )
  return meaningful[0] || fallback || '未知错误'
}

const updateStep = (key, msg, cls) => {
  const step = fetchStatus.value.steps.find(s => s.key === key)
  if (step) {
    step.msg = msg
    step.cls = cls
    step.iconComp = cls === 'done' ? CircleCheck : cls === 'failed' ? CircleX : cls === 'active' ? Loader : Circle
  }
}

const closeFetchModal = () => { refreshing.value = false }

// 判断 fetch_log 行是不是本次拉取留下的（fetched_at >= runStartedAt）
const isLogFromThisRun = (log) => {
  if (!log || !log.fetched_at) return null
  const logTime = new Date(log.fetched_at.replace(' ', 'T') + (log.fetched_at.endsWith('Z') ? '' : 'Z'))
  return logTime >= runStartedAt ? log : null
}

const refreshFromWeb = async () => {
  refreshing.value = true
  fetchDone.value = false
  const runStartedAt = new Date()
  fetchStatus.value = {
    title: '正在拉取最新校招岗位…',
    steps: [
      { key: 'search', label: '① 搜索', iconComp: Loader, msg: '调用 mmx search…', cls: 'active' },
      { key: 'filter', label: '② 去重 / 过滤', iconComp: Circle, msg: '', cls: 'pending' },
      { key: 'extract', label: '③ AI 提炼', iconComp: Circle, msg: '', cls: 'pending' },
      { key: 'insert', label: '④ 写入数据库', iconComp: Circle, msg: '', cls: 'pending' },
    ],
    output: '',
    stderr: '',
    error: null,
  }
  try {
    const r = await fetch('/api/refresh-jobs', { method: 'POST' })
    const d = await r.json()

    // 后端每阶段都写过 fetch_log，从最后一条（=阶段名）逐阶段往前回填
    if (d.log) {
      const map = {
        search: 'search', filter: 'filter', extract: 'extract', insert: 'insert',
        success: 'insert', partial: 'insert', failed: 'insert',
      }
      const phase = map[d.log.status]
      if (phase) {
        const order = ['search', 'filter', 'extract', 'insert']
        const idx = order.indexOf(phase)
        for (let i = 0; i < order.length; i++) {
          if (i < idx) updateStep(order[i], '✓', 'done')
          else if (i === idx) updateStep(order[i], d.log.error_message || '完成', d.log.status === 'failed' ? 'failed' : 'done')
        }
      }
    }

    fetchStatus.value.output = d.output || ''
    fetchStatus.value.stderr = d.stderr || ''

    if (d.success) {
      fetchDone.value = true
      fetchStatus.value.title = `✓ 拉取完成（${d.log?.duration_ms ? Math.round(d.log.duration_ms / 1000) + 's' : '已完成'}）`
      const added = d.log?.added || 0, skipped = d.log?.skipped || 0
      updateStep('insert', `新增 ${added} / 跳过 ${skipped} 条`, 'done')
      msg?.success(`已新增 ${added} 条，跳过 ${skipped} 条`)
      await refreshFromDB(true)
    } else {
      fetchDone.value = true
      fetchStatus.value.title = `✗ 拉取失败`
      fetchStatus.value.error = d.error || '未知错误'
      fetchStatus.value.errorSummary = summarizeError(d.stderr || '', d.error)

      // 把所有还在 active（转圈）的步骤重置为 failed，避免一直转
      for (const step of fetchStatus.value.steps) {
        if (step.cls === 'active') {
          updateStep(step.key, '中断', 'failed')
        }
      }

      // 如果有本次日志，再定位具体哪一阶段失败
      const recentLog = isLogFromThisRun(d.log)
      if (recentLog && recentLog.status && recentLog.status !== 'success') {
        const phaseMap = { search: 'search', filter: 'filter', extract: 'extract', insert: 'insert' }
        const phase = phaseMap[recentLog.status]
        if (phase) updateStep(phase, recentLog.error_message || '失败', 'failed')
      }

      msg?.warning('拉取失败：' + fetchStatus.value.errorSummary)
    }
  } catch (e) {
    fetchDone.value = true
    fetchStatus.value.title = '✗ 网络错误'
    fetchStatus.value.error = e.message
    fetchStatus.value.errorSummary = e.message
    msg?.warning('网络错误：' + e.message)
  }
}

// ===== 筛选/分页逻辑 =====
const days = (d) => { if(!d) return null; const dt = new Date(d); return isNaN(dt) ? null : Math.ceil((dt.getTime()-Date.now())/86400000) }
const matchDeadline = (job, range) => { const d = days(job.deadline); switch(range) { case 'overdue': return d !== null && d < 0; case 'active': return d === null || d >= 0; case 'all': default: return true } }

const matchApplied = (job, allowedStatuses) => allowedStatuses.includes(Number(job.applied ?? 0))
const matchResult = (job, allowed) => {
  // filter.result 0 表示"进行中"(对应 result=null 的行)
  const v = job.result == null ? 0 : Number(job.result)
  return allowed.includes(v)
}
const matchRound = (job, allowed) => {
  const v = job.round == null ? null : Number(job.round)
  if (v == null) return true  // 无 round 的行(非面试环节)始终匹配
  return allowed.includes(v)
}
const matchBatch = (job, allowed) => {
  const v = job.batch == null || job.batch === '' ? '__none__' : job.batch
  return allowed.includes(v)
}
const matchVerified = (job, v) => v === 'all' || Number(job.verified ?? 0) === Number(v)
const matchSource = (job, v) => v === 'all' || job.source === v
// salary_range "15-20k×13" → 起始数字 15（k 为单位）
const salarySortVal = (s) => {
  if (!s || s === '面议') return 0
  const m = String(s).match(/(\d+)/)
  return m ? Number(m[1]) : 0
}

// 区间匹配：filter.salaryMin 含义见 salaryOptions
// value < 0 表示上限（含），value === 0 不过滤
// 0-3 / 3-4 / 4-5 / 5-8 / 8-10 走"闭区间上限"或"开区间下限"
const matchSalaryRange = (job, opt) => {
  if (!opt || opt === 0) return true
  const v = salarySortVal(job.salary_range)
  if (!v) return false  // 面议/无法解析
  if (opt === -3) return v <= 3               // ≤3k
  if (opt === 3)  return v >= 3 && v < 4      // 3-4k
  if (opt === 4)  return v >= 4 && v < 5      // 4-5k
  if (opt === 5)  return v >= 5 && v < 8      // 5-8k
  if (opt === 8)  return v >= 8 && v < 10     // 8k-1w
  if (opt === 10) return v >= 10              // ≥1w
  return true
}
const filteredJobs = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return jobs.value.filter(j => filter.category.includes(j.category) && filter.city.includes(j.city) && matchApplied(j, filter.applied) && matchResult(j, filter.result) && matchRound(j, filter.round) && matchBatch(j, filter.batch) && matchVerified(j, filter.verified) && matchSource(j, filter.source) && matchSalaryRange(j, filter.salaryMin) && matchDeadline(j, filter.deadlineRange) && (!kw || (j.company+' '+j.position+' '+j.notes+' '+(j.salary_range||'')+' '+(j.next_action||'')).toLowerCase().includes(kw)))
})

// 4 张统计卡片都用筛选后的本地数据；占比的分母固定为全部岗位(stats.real_count)
// applied 判定口径与 APPLIED_META 对齐：applied ∈ [1,5] 都算"已投递"
// rejected 判定口径：result < 0 且 result != -10（人才储备库不算挂）
// talent_pool 判定口径：result = -10
// 注意：要排除 is_placeholder=1 的占位行（与后端 real_count 对齐）
const filteredStats = computed(() => {
  let real = 0, applied = 0, pending = 0, rejected = 0, talent_pool = 0
  for (const j of filteredJobs.value) {
    if (j.is_placeholder) continue
    real++
    const ap = Number(j.applied ?? 0)
    if (ap >= 1 && ap <= 5) applied++
    else if (ap === 0) pending++
    const rs = j.result == null ? null : Number(j.result)
    if (rs === -10) talent_pool++
    else if (rs != null && rs < 0) rejected++
  }
  return { real, applied, pending, rejected, talent_pool }
})

// 排序后传给 n-data-table（n-data-table 的内置 3 态太难控，改用 data 已是排好序的）
// 默认：复合排序 — 状态分组（已开始未投递/已投递/未开始/已结束）+ 组内次级键
// 用户点列头 → 进入"单列覆盖"模式，按点中的列 + 升/降
const sortMap = ref({})  // 空对象 = 用默认复合排序
const tablePageSize = ref(20)  // 表格分页大小（响应式，n-data-table 改时回写）
const tablePage = ref(1)       // 当前页（外置分页用）
// 过滤/数据变化时回到第 1 页
watch([filteredJobs, keyword, filter], () => { tablePage.value = 1 }, { deep: true })
const sorters = { applied: (a, b, o) => cmp(a.applied, b.applied) * (o === 'ascend' ? 1 : -1), company: (a, b, o) => cmp(a.company, b.company) * (o === 'ascend' ? 1 : -1), position: (a, b, o) => cmp(a.position, b.position) * (o === 'ascend' ? 1 : -1), city: (a, b, o) => cmp(a.city, b.city) * (o === 'ascend' ? 1 : -1), deadline: (a, b, o) => cmpDeadline(a.deadline, b.deadline) * (o === 'ascend' ? 1 : -1), category: (a, b, o) => cmp(a.category, b.category) * (o === 'ascend' ? 1 : -1), batch: (a, b, o) => cmp(a.batch, b.batch) * (o === 'ascend' ? 1 : -1), weekend: (a, b, o) => cmp(a.weekend, b.weekend) * (o === 'ascend' ? 1 : -1), notes: (a, b, o) => cmp(a.notes, b.notes) * (o === 'ascend' ? 1 : -1), salary_range: (a, b, o) => (salarySortVal(a.salary_range) - salarySortVal(b.salary_range)) * (o === 'ascend' ? 1 : -1), next_action: (a, b, o) => cmp(a.next_action, b.next_action) * (o === 'ascend' ? 1 : -1), applied_at: (a, b, o) => cmpAppliedAt(a.applied_at, b.applied_at) * (o === 'ascend' ? 1 : -1) }
// 默认排序：状态分组 + 组内次级键（点列头切到单列模式后会被覆盖）
const DEFAULT_SORT_FN = (a, b) => {
  const ba = bucketOf(a), bb = bucketOf(b)
  if (ba !== bb) return ba - bb
  return secondaryCmp(a, b, ba)
}
const sortedJobs = computed(() => {
  const entry = Object.entries(sortMap.value)[0]
  if (!entry) return [...filteredJobs.value].sort(DEFAULT_SORT_FN)
  const [columnKey, order] = entry
  const fn = sorters[columnKey]
  if (!fn) return [...filteredJobs.value].sort(DEFAULT_SORT_FN)
  return [...filteredJobs.value].sort((a, b) => fn(a, b, order))
})

// 拦截 n-data-table 的 3 态：点同列只在升/降之间切，不归零
const onSorterChange = (sorter) => {
  if (!sorter || !sorter.columnKey) return
  const { columnKey, order } = sorter
  const next = order === false
    ? (sortMap.value[columnKey] === 'ascend' ? 'descend' : 'ascend')
    : order
  sortMap.value = { [columnKey]: next }
}

// ===== 列定义 =====
const renderDeadline = (row) => {
  if (!row.deadline) return h('span', { style: 'color:#2080f0;font-weight:600' }, '长期')
  const d = days(row.deadline); let c = '#18a058'; if (d < 0) c = '#888'; else if (d <= 7) c = '#d03050'; else if (d <= 30) c = '#f0a020'
  let t = row.deadline; if (d < 0) t += ' (已过)'; else if (d === 0) t += ' (今天)'; else if (d <= 7) t += ` (剩${d}天)`
  return h('span', { style: `color:${c};font-weight:${d>=0&&d<=7?'600':'normal'}` }, t)
}

const renderCategory = (row) => h(NTag, { type: catTag[row.category] || 'default', size: 'small', bordered: false, round: true }, { default: () => row.category })

const renderWeekend = (row) => {
  if (!row.weekend) return h('span', { style: 'color:#aaa' }, '—')
  const display = { '周末双休': '双休' }[row.weekend] || row.weekend
  const colorMap = { '周末双休': '#18a058', '单休': '#d03050', '大小周': '#f0a020' }
  return h('span', { style: `color:${colorMap[row.weekend] || '#666'}; font-weight:600` }, display)
}

// 投递状态 0~5 的颜色
const APPLIED_META = {
  0: { label: '待投递', color: '#909399' },
  1: { label: '已投递', color: '#2080f0' },
  2: { label: '已笔试', color: '#722ed1' },
  3: { label: '已面试', color: '#f0a020' },
  4: { label: '已 offer', color: '#18a058' },
  5: { label: '已结束', color: '#999' },
}
const appliedOptions = Object.entries(APPLIED_META).map(([k, v]) => ({ label: v.label, value: Number(k) }))

// 环节 = round(轮次) + result(结果定性) 拼出的人话
// round: 1=一面 2=二面 3=三面 4=终面 5=HR 面
const ROUND_META = { 0: '简历初筛', 1: '测评', 2: '笔试', 3: '一面', 4: '二面', 5: '三面', 6: '终面', 7: 'HR面' }
// result 精简语义:0=进行中 1=过 -1=挂 -7=主动撤回 -8=我拒offer -9=offer撤回 -10=人才储备库 99=其他
const RESULT_LABEL = { 0: '进行中', 1: '过', '-1': '挂', '-7': '主动撤回', '-8': '我拒 offer', '-9': 'offer 撤回', '-10': '人才储备库', '99': '其他' }
// 阶段×结果配色矩阵:每个组合用完全不同的强对比色,不用同色系渐变
// value 索引:0=简历初筛 1=测评 2=笔试 3=一面 4=二面 5=三面 6=终面 7=HR面
// 过:8 个阶段 8 种色
const PASS_COLOR = { 0: '#13c2c2', 1: '#f0a020', 2: '#9bc7ea', 3: '#18a058', 4: '#722ed1', 5: '#2080f0', 6: '#0f4d7e', 7: '#d03050' }
// 挂:8 个阶段 8 种深浅红
const FAIL_COLOR = { 0: '#a91826', 1: '#8e121e', 2: '#f17c87', 3: '#d03050', 4: '#a91826', 5: '#8e121e', 6: '#6b0e16', 7: '#4a0a0f' }
// 进行中:8 个阶段 8 种浅色
const PROG_COLOR = { 0: '#909399', 1: '#f0a020', 2: '#67aade', 3: '#36ad6a', 4: '#9254de', 5: '#2080f0', 6: '#155ea3', 7: '#0f4d7e' }
const SPECIAL_COLOR = '#999'  // 主动撤回/我拒/offer撤回/其他
// 兜底阶段名(round 缺失时,根据 applied 推断,如 applied=2 推断笔试)
const APPLIED_STAGE = { 0: '待投递', 1: '简历', 2: '笔试', 3: '面试', 4: 'HR', 5: '已结束' }
// 阶段对应"X面过"颜色:过=绿 挂=红 进行中=蓝 撤回=灰
function stageLabel(row) {
  const ap = Number(row.applied ?? 0)
  const rd = row.round == null ? null : Number(row.round)
  const rs = row.result == null ? null : Number(row.result)
  if (ap === 0) return { label: '—', color: '#aaa' }
  // 特殊结果(主动撤回/我拒/offer撤回/人才储备库/其他):不分阶段,直接显示
  if (rs != null && (rs <= -7 || rs >= 99 || rs === -8 || rs === -9 || rs === -10)) {
    return { label: RESULT_LABEL[String(rs)] || '其他', color: SPECIAL_COLOR }
  }
  // 阶段名 = round 优先,fallback 到 applied 推断
  const stageName = rd != null ? ROUND_META[rd] : APPLIED_STAGE[ap]
  const stageKey = rd != null ? rd : ap  // 用 round 索引配色,fallback applied
  // 有 result(过/挂/进行中)
  if (rs != null) {
    if (rs === 0) return { label: `${stageName}进行中`, color: PROG_COLOR[stageKey] || '#2080f0' }
    if (rs === 1) return { label: `${stageName}过`, color: PASS_COLOR[stageKey] || '#18a058' }
    if (rs === -1) return { label: `${stageName}挂`, color: FAIL_COLOR[stageKey] || '#d03050' }
    return { label: `${stageName}${RESULT_LABEL[String(rs)] || ''}`, color: '#666' }
  }
  // 无 result:进行中兜底(round 优先,fallback applied 推断)
  if (rd != null) return { label: `${ROUND_META[rd]}进行中`, color: PROG_COLOR[rd] || '#2080f0' }
  if (ap === 1) return { label: '投递中', color: PROG_COLOR[0] || '#909399' }
  if (ap === 2) return { label: '笔试待考', color: PROG_COLOR[1] || '#f0a020' }
  if (ap === 3) return { label: '面试进行中', color: PROG_COLOR[3] || '#36ad6a' }
  if (ap === 4) return { label: 'HR 面过', color: PASS_COLOR[7] || '#d03050' }
  if (ap === 5) return { label: '已结束', color: '#999' }
  return { label: '—', color: '#aaa' }
}

const renderApplied = (row) => {
  const meta = APPLIED_META[row.applied] || APPLIED_META[0]
  const ap = Number(row.applied ?? 0)
  const hasLink = ap === 0 && row.link                        // 待投递 + 有链接 → 跳投递链接
  const hasProgress = ap >= 1 && !!row.progress_url           // 已投递 + 有进度链接 → 跳进度页
  const clickable = hasLink || hasProgress
  return h(NTag, {
    type: row.applied === 4 ? 'success' : row.applied === 5 ? 'default' : row.applied >= 2 ? 'warning' : row.applied === 1 ? 'info' : 'default',
    size: 'small',
    bordered: false,
    round: true,
    style: clickable ? 'cursor:pointer' : 'cursor:default',
    onClick: (e) => {
      e.stopPropagation()
      if (hasLink) window.open(row.link, '_blank', 'noopener')
      else if (hasProgress) window.open(row.progress_url, '_blank', 'noopener')
    },
  }, { default: () => meta.label })
}

const SOURCE_META = {
  '官网': { label: '官网', color: '#18a058' },
  '前程无忧': { label: '前程无忧', color: '#2080f0' },
  '应届生招聘': { label: '应届生招聘', color: '#722ed1' },
  '猎聘': { label: '猎聘', color: '#f0a020' },
  '智联招聘': { label: '智联招聘', color: '#d03050' },
  'BOSS直聘': { label: 'BOSS直聘', color: '#0099cc' },
}
const renderSource = (row) => {
  const meta = SOURCE_META[row.source] || { label: row.source || '—', color: '#909399' }
  return h('span', { style: `color:${meta.color};font-size:12px;font-weight:600` }, meta.label)
}

const VERIFIED_META = {
  0: { label: '待验证', color: '#909399' },
  1: { label: '已验证', color: '#18a058' },
  2: { label: '失效', color: '#d03050' },
}
const renderVerified = (row) => {
  const meta = VERIFIED_META[row.verified] || VERIFIED_META[0]
  return h('span', { style: `color:${meta.color};font-weight:600` }, meta.label)
}

// 公司名 → MD 路由,从 /api/companies 加载(在 onMounted 触发)
const companyMap = ref({})  // { name: route }
const loadCompanies = async () => {
  try {
    const r = await fetch('/api/companies').then(r => r.json())
    if (r.success) {
      const m = {}
      for (const { name, route } of r.data) m[name] = route
      companyMap.value = m
    }
  } catch (e) { /* 静默失败,不影响其他功能 */ }
}

// 匹配规则:精确 → 前缀 → 文件名包含
const findCompanyRoute = (company) => {
  if (!company) return null
  const map = companyMap.value
  if (map[company]) return map[company]
  for (const [name, route] of Object.entries(map)) {
    if (name === company) return route
    if (name.startsWith(company) || company.startsWith(name)) return route
    if (name.includes(company) || company.includes(name)) return route
  }
  return null
}

const renderCompany = (row) => {
  const route = findCompanyRoute(row.company)
  // 1) 有公司介绍 md → 跳站内 md(无论是否已投递)
  if (route) {
    return h('a', { href: route, style: 'color:#18a058;text-decoration:none', onClick: (e) => e.stopPropagation() }, row.company)
  }
  // 2) 没 md 且未投递 → 弹 Modal 展示投递链接
  if (Number(row.applied ?? 0) === 0 && row.link) {
    return h('a', {
      style: 'color:#2080f0;cursor:pointer;text-decoration:none',
      onClick: (e) => { e.stopPropagation(); openApplyModal(row) },
    }, [row.company, ' ', h(NIcon, { size: 11 }, { default: () => h(ExternalLink) })])
  }
  // 3) 没 md 且已投递 → 普通文字
  return h('span', null, row.company)
}

const renderActions = (row) => {
  const editBtn = h(NButton, { size: 'tiny', quaternary: true, circle: true, onClick: () => openEdit(row) }, { icon: () => h(NIcon, null, { default: () => h(Edit) }) })
  const delBtn = h(NPopconfirm, { onPositiveClick: () => remove(row) }, {
    trigger: () => h(NButton, { size: 'tiny', quaternary: true, circle: true, type: 'error' }, { icon: () => h(NIcon, null, { default: () => h(Trash) }) }),
    default: () => `确认删除「${row.company} - ${row.position}」？`
  })
  return h(NSpace, { size: 'small' }, { default: () => [editBtn, delBtn] })
}

const rowProps = (row) => ({
  style: row.is_placeholder ? 'opacity:0.7; background:#fafafa' : 'cursor:pointer',
  onDblclick: () => openEdit(row),
})

// 排序比较函数
const cmp = (a, b) => { const sa = String(a ?? ''), sb = String(b ?? ''); return sa === sb ? 0 : sa < sb ? -1 : 1 }
const cmpDeadline = (a, b) => {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b)
}
// applied_at 形如 "2026-07-02 10:00" / "" / null，空值排最后
const cmpAppliedAt = (a, b) => {
  const sa = String(a ?? '').trim()
  const sb = String(b ?? '').trim()
  if (!sa && !sb) return 0
  if (!sa) return 1
  if (!sb) return -1
  return sa.localeCompare(sb)
}

// ===== 复合排序：状态分组 + 组内次级键 =====
// 排序按列顺序（投递状态 → 环节 → 投递时间）：
//   Bucket 1 = 待投递（applied=0，优先级最高：已开始未投,需要尽快处理）
//   Bucket 2 = 已投递（applied=1，进行中主体）
//   Bucket 3 = 已 offer（applied=4，进度最深）
//   Bucket 4 = 未开始（batch='未开始'）
//   Bucket 4 = 人才储备库（result=-10，自动判定，优先级最高）
//   Bucket 5 = 已结束/其他（applied=5 或 result=99，独立桶，排在挂前）
//   Bucket 6 = 已挂（result<0 且 !=-10，按进度靠后排前；简历初筛挂 round=0 排最末）
//   Bucket 7 = 已 offer（applied=4，排在最后）
// 核心原则：投递状态决定主桶；进度越深桶号越小；待投递单独置顶；人才储备库 > 已结束/其他 > 挂 > offer
const bucketOf = (j) => {
  const ap = Number(j.applied ?? 0)
  const rs = j.result == null ? null : Number(j.result)
  const batch = j.batch == null || j.batch === '' ? null : j.batch
  // 人才储备库单独成桶,优先级最高
  if (rs === -10) return 4
  // 已结束(applied=5)和"其他"(result=99)合并到 bucket 5,排在挂前
  if (ap === 5 || rs === 99) return 5
  // 已挂(result<0 且 !=-10/99)放挂桶
  if (rs != null && rs < 0) return 6
  // 未开始
  if (batch === '未开始') return 3
  // 已开始未投递 = 最高优先级
  if (ap === 0) return 1
  // 已投递 / 已 offer 按进度排
  if (ap === 1) return 2  // 已投递
  if (ap === 4) return 7  // 已 offer
  // 兜底：未知状态归到已结束
  return 5
}
// 组内次级排序（按列顺序）：
//   Bucket 1 (待投递):   deadline 升序（越急越前），空排最后
//   Bucket 2 (已投递):   round 降序（轮次越深越前）→ applied_at 升序（最早投递越前）
//   Bucket 3 (未开始):   company 升序（字母序）
//   Bucket 4 (人才储备库): applied_at 降序（投递时间近的排前）
//   Bucket 5 (已结束):   ap=5+result=null 在前，result=99 其他排最末；同组按 applied_at 降序
//   Bucket 6 (挂):       round 升序（进度靠前排前：r=0 → r=2 → r=3 → r=7）；round=null 排最末 → applied_at 降序
//   Bucket 7 (已 offer):  applied_at 降序（最近 offer 越前）
const secondaryCmp = (a, b, bucket) => {
  switch (bucket) {
    case 1: return cmpDeadline(a.deadline, b.deadline)
    case 2: {
      const ar = a.round == null ? -1 : Number(a.round)
      const br = b.round == null ? -1 : Number(b.round)
      if (ar !== br) return br - ar  // round 降序
      return cmpAppliedAt(a.applied_at, b.applied_at)
    }
    case 3: return cmp(a.company, b.company)
    case 4: return -cmpAppliedAt(a.applied_at, b.applied_at)  // 人才储备库:投递时间近的排前
    case 5: {
      // 已结束桶内:ap=5+result=null 按 round 降序(环节越深排前),result=99 其他排最末
      const ar = a.result == null || Number(a.result) === 0 ? 0 : 1
      const br = b.result == null || Number(b.result) === 0 ? 0 : 1
      if (ar !== br) return ar - br  // 正常结束(ar=0)在前,其他(ar=1)排末
      // 同为正常结束:round 降序(环节深的前);round=null 排末
      const ar2 = a.round == null ? -1 : Number(a.round)
      const br2 = b.round == null ? -1 : Number(b.round)
      if (ar2 !== br2) return br2 - ar2  // round 降序:7 > 3 > 2 > 0 > -1
      return -cmpAppliedAt(a.applied_at, b.applied_at)  // 同 round 按 applied_at 降序
    }
    case 6: {
      // 挂的排序:进度靠前排前(round 升序:0 < 2 < 3 < 7);round=null 视为最末
      const ar = a.round == null ? 99 : Number(a.round)
      const br = b.round == null ? 99 : Number(b.round)
      if (ar !== br) return ar - br  // round 升序:简历初筛排前,HR面挂排末
      return -cmpAppliedAt(a.applied_at, b.applied_at)  // 同 round 按 applied_at 降序
    }
    case 7: return -cmpAppliedAt(a.applied_at, b.applied_at) // 已 offer:最近 offer 排前
    default: return 0
  }
}

// 计算占比（基于 real_count，避免除零返回 0%）
// 入参是当前卡片值与分母（总岗位），返回形如 "40.0%"（分子=0 时 "0%"）
const formatRatio = (n, total) => {
  const num = Number(n ?? 0)
  const den = Number(total ?? 0)
  if (!den) return '0%'
  const pct = (num / den) * 100
  // 整数比例不显示小数（40%）；否则保留 1 位小数（33.3%）
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`
}

// conic-gradient 实现的进度圈样式
// 用"双层圆 + mask 擦除"代替 SVG：
//   外层 (mask-shell)：铺满整圈背景色（未填充 = 浅灰），用 mask 把内部"擦空"只留环形带
//   内层 (mask-fill)：从 12 点钟方向起画一段 conic 渐变到 pct%，同样用 mask 只留环形带
// kind = 'normal' | 'urgent'：已挂用警示红，其它用品牌绿
const ringStyle = (num, den, kind = 'normal') => {
  const n = Number(num ?? 0)
  const d = Number(den ?? 0)
  const pct = d > 0 ? Math.max(0, Math.min(100, (n / d) * 100)) : 0
  // 配色
  const emptyColor = kind === 'urgent' ? '#f5dde0' : '#eef0f2'
  const fillColor  = kind === 'urgent' ? '#d03050' : '#18a058'
  // 0% 时只画背景圆；>0% 时画背景 + 前景扇形
  const fillBg = pct > 0
    ? `conic-gradient(from -90deg, ${fillColor} 0% ${pct}%, transparent ${pct}% 100%)`
    : 'transparent'
  return {
    '--ring-empty': emptyColor,
    '--ring-fill':  fillColor,
    '--ring-fill-bg': fillBg,
    '--ring-pct': `${pct}%`,
  }
}

const columns = computed(() => [
  { type: 'selection', width: 36, fixed: 'left', disabled: (row) => false },
  { title: '公司', key: 'company', width: 180, fixed: 'left', titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.company, b.company), sortOrder: sortMap.value.company || false, ellipsis: { tooltip: true }, render: renderCompany },
  { title: '岗位', key: 'position', width: 180, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.position, b.position), sortOrder: sortMap.value.position || false, ellipsis: { tooltip: true } },
  { title: '工作地', key: 'city', width: 88, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.city, b.city), sortOrder: sortMap.value.city || false, ellipsis: { tooltip: true } },
  { title: '批次', key: 'batch', width: 120, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.batch, b.batch), sortOrder: sortMap.value.batch || false, ellipsis: { tooltip: true }, render: (row) => row.batch ? h(NTag, { size: 'small', bordered: false, round: true, type: row.batch === '实习' ? 'info' : row.batch === '未开始' ? 'default' : 'warning' }, { default: () => row.batch }) : h('span', { style: 'color:#aaa' }, '—') },
  { title: '投递状态', key: 'applied', width: 110, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.applied, b.applied), sortOrder: sortMap.value.applied || false, ellipsis: { tooltip: true }, render: renderApplied },
  { title: '环节', key: 'stage', width: 120, titleAlign: 'center', align: 'center', ellipsis: { tooltip: true }, render: (row) => { const m = stageLabel(row); return h('span', { style: `color:${m.color};font-weight:600;font-size:12px` }, m.label) } },
  { title: '投递时间', key: 'applied_at', width: 140, titleAlign: 'center', align: 'center', sorter: (a, b) => cmpAppliedAt(a.applied_at, b.applied_at), sortOrder: sortMap.value.applied_at || false, ellipsis: { tooltip: true }, render: (row) => row.applied_at ? h('span', { style: 'font-size:12px;color:var(--text-color-2)' }, row.applied_at) : h('span', { style: 'color:#aaa' }, '—') },
  { title: '类别', key: 'category', width: 100, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.category, b.category), sortOrder: sortMap.value.category || false, ellipsis: { tooltip: true }, render: renderCategory },
  { title: '薪资', key: 'salary_range', width: 120, titleAlign: 'center', align: 'center', sorter: (a, b) => salarySortVal(a.salary_range) - salarySortVal(b.salary_range), sortOrder: sortMap.value.salary_range || false, ellipsis: { tooltip: true }, render: (row) => row.salary_range ? h('span', { style: 'font-weight:600;color:#18a058' }, row.salary_range) : h('span', { style: 'color:#2080f0;font-weight:600' }, '面议') },
  { title: '周末', key: 'weekend', width: 90, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.weekend, b.weekend), sortOrder: sortMap.value.weekend || false, ellipsis: { tooltip: true }, render: renderWeekend },
  { title: '备注', key: 'notes', minWidth: 220, titleAlign: 'center', align: 'left', sorter: (a, b) => cmp(a.notes, b.notes), sortOrder: sortMap.value.notes || false, render: (row) => row.notes ? h('div', { style: 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;cursor:pointer;padding:2px 6px;border-radius:4px;max-width:100%', title: '点击查看完整备注', onClick: (e) => { e.stopPropagation(); openDetail(row) }, onMouseenter: (e) => { e.currentTarget.style.background = '#f5f5f5' }, onMouseleave: (e) => { e.currentTarget.style.background = 'transparent' } }, row.notes) : h('span', { style: 'color:#aaa' }, '—') },
  { title: '下一步', key: 'next_action', width: 160, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.next_action, b.next_action), sortOrder: sortMap.value.next_action || false, ellipsis: { tooltip: true }, render: (row) => row.next_action ? h('span', { style: 'font-size:12px' }, row.next_action) : h('span', { style: 'color:#aaa' }, '—') },
  { title: '截止日期', key: 'deadline', width: 160, titleAlign: 'center', align: 'center', sorter: (a, b) => cmpDeadline(a.deadline, b.deadline), sortOrder: sortMap.value.deadline || false, ellipsis: { tooltip: true }, render: renderDeadline },
  { title: '验证', key: 'verified', width: 78, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.verified, b.verified), sortOrder: sortMap.value.verified || false, ellipsis: { tooltip: true }, render: renderVerified },
  { title: '渠道', key: 'source', width: 96, minWidth: 96, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.source, b.source), sortOrder: sortMap.value.source || false, ellipsis: { tooltip: true }, render: renderSource },
  { title: '操作', key: 'actions', width: 90, titleAlign: 'center', align: 'center', render: renderActions },
])

// 表格内置分页配置
const pagination = computed(() => ({
  page: 1,
  pageSize: tablePageSize.value,
  pageSizes: [10, 20, 50, 100],
  showSizePicker: true,
  showQuickJumper: true,
  onUpdatePageSize: (size) => { tablePageSize.value = size },
  onUpdatePage: () => { /* reset filter 时已经会触发刷新，pageSize 切换由内部管理 */ },
  prefix: () => `共 ${filteredJobs.value.length} 条`,
}))

// ===== 外置分页（卡片底部,不随表体滚动） =====
const pagedJobs = computed(() => {
  const start = (tablePage.value - 1) * tablePageSize.value
  return sortedJobs.value.slice(start, start + tablePageSize.value)
})
</script>

<style scoped>
.offer-dashboard { margin: 12px 0; }
.stats-row { margin-bottom: 14px; }

/* 卡片内部布局：label 在上，圆圈在下居中 */
.stat-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 4px 0; min-height: 140px; }
.stat-card-head { display: flex; align-items: center; gap: 4px; align-self: flex-start; padding-left: 2px; }
.stat-card-icon { color: var(--text-color-3); }
.stat-card-label { font-size: 13px; color: var(--text-color-2); font-weight: 500; }

/* 圆圈：conic-gradient 双层 + mask 擦出环形带
   实现思路：
   - 外层 .stat-ring 本身是 96×96 的圆，纯背景色 = 进度空余部分（浅灰）
   - 用 ::before 画一层 conic 渐变（已填充部分 = 品牌色），再 ::after 在中间挖一个圆孔（mask）
   - 这样视觉上得到一个 8px 宽的彩色环，进度扇形从 12 点钟方向起
*/
.stat-ring {
  position: relative;
  width: 96px; height: 96px;
  border-radius: 50%;
  background: var(--ring-empty, #eef0f2);
  cursor: default;
}
/* 进度扇形（前景层）：用 ::before，绝对定位铺满，conic 渐变画 0%→pct% 的彩色弧 */
.stat-ring::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--ring-fill-bg, transparent);
  /* 用 mask 把中间擦空、只留 6px 环形带（96px 圆 → 半径 48px；环落在 41-47px 半径处）
     强制 mask-mode: alpha 让各浏览器（Chrome/Firefox/Safari）行为一致 */
  -webkit-mask:
    radial-gradient(circle, transparent 40px, #000 41px, #000 47px, transparent 48px) alpha;
          mask:
    radial-gradient(circle, transparent 40px, #000 41px, #000 47px, transparent 48px) alpha;
  -webkit-mask-mode: alpha;
          mask-mode: alpha;
  transition: background 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-value {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 700;
  color: var(--text-color-1);
  letter-spacing: -0.5px;
  pointer-events: none;
  /* tabular-nums 让数字宽度一致，避免数字跳变时圆圈中心偏移 */
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

.urgent-card { background: linear-gradient(135deg, rgba(208,48,80,0.05), transparent); }
.actions-row { margin-bottom: 14px; }
.filter-card { margin-bottom: 14px; background: var(--bg-color-soft, #fafafa); }
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 16px;
  align-items: center;
}
.filter-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.filter-label {
  font-weight: 600;
  color: var(--text-color-2);
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;
  width: 36px;            /* 固定标签宽度，对齐"类别"/"地点"/"状态"等 */
  text-align: right;
}
.filter-cell > .n-select {
  flex: 1;
  min-width: 0;
}
.filter-actions .filter-label { display: none; }
.filter-actions > .n-button { width: 100%; }
.filter-row :deep(.n-select) { min-width: 0; }
.filter-row :deep(.n-base-selection) { max-width: 100%; min-width: 0; }
.filter-row :deep(.n-base-selection .n-base-selection-input) { overflow: hidden; min-width: 0; }
.filter-row :deep(.n-base-selection .n-base-selection-tags) { overflow: hidden; }
.table-card :deep(.n-data-table) { overflow-x: auto; }
.table-card :deep(.n-data-table-th .n-data-table-th__title) { white-space: nowrap; }
.table-pagination { margin-top: 12px; display: flex; justify-content: center; }

/* 拉取进度弹窗 */
.fetch-progress { display: flex; flex-direction: column; gap: 8px; }
.fetch-step { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; background: #fafafa; font-size: 13px; border-left: 3px solid transparent; }
.fetch-step.active { border-left-color: #2080f0; background: #f5f9ff; }
.fetch-step.done { border-left-color: #18a058; }
.fetch-step.failed { border-left-color: #d03050; background: #fff5f7; }
.fetch-step-icon { flex-shrink: 0; }
.fetch-step-icon.pending { color: #c0c0c0; }
.fetch-step-icon.active { color: #2080f0; animation: spin 1.4s linear infinite; }
.fetch-step-icon.done { color: #18a058; }
.fetch-step-icon.failed { color: #d03050; }
.fetch-step-label { font-weight: 600; min-width: 110px; color: var(--text-color-2); }
.fetch-step-msg { color: var(--text-color-3); font-size: 12px; flex: 1; font-family: ui-monospace, Consolas, monospace; }
.fetch-step.done .fetch-step-msg { color: var(--text-color-2); }
.fetch-step.failed .fetch-step-msg { color: #d03050; font-weight: 600; }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
.fetch-output, .fetch-error-detail { font-family: ui-monospace, Consolas, monospace; font-size: 12px; background: #fafafa; padding: 8px; border-radius: 4px; max-height: 240px; overflow: auto; white-space: pre-wrap; word-break: break-all; margin: 8px 0 0; }
.fetch-error-detail { color: #d03050; max-height: 200px; background: #fff5f7; }
.fetch-error-details summary { cursor: pointer; color: #d03050; font-size: 12px; user-select: none; padding: 2px 0; }
.fetch-error-details summary:hover { text-decoration: underline; }

/* 紧凑多选 tag */
.filter-card :deep(.n-tag) {
  max-width: 110px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
}
.filter-card :deep(.n-tag .n-tag__content) {
  max-width: 78px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
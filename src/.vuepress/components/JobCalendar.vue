<template>
  <n-config-provider :theme="null" :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <div class="offer-dashboard">
        <!-- 统计卡片 -->
        <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:4" responsive="screen" class="stats-row">
          <n-gi>
            <n-card hoverable embedded>
              <n-statistic label="总岗位" :value="stats.real_count">
                <template #prefix><n-icon><Stack /></n-icon></template>
              </n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded>
              <n-statistic label="已投递" :value="stats.applied_count">
                <template #prefix><n-icon><Check /></n-icon></template>
              </n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded>
              <n-statistic label="待投递" :value="stats.pending_count">
                <template #prefix><n-icon><Clock /></n-icon></template>
              </n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded class="urgent-card">
              <n-statistic label="7天内截止" :value="stats.urgent_count">
                <template #prefix><n-icon><AlertTriangle /></n-icon></template>
              </n-statistic>
            </n-card>
          </n-gi>
        </n-grid>

        <!-- 操作按钮 -->
        <n-space wrap class="actions-row">
          <n-button type="primary" @click="openNew"><template #icon><n-icon><Plus /></n-icon></template>新增岗位</n-button>
          <n-button @click="refreshFromDB" :loading="reloading"><template #icon><n-icon><Refresh /></n-icon></template>刷新数据</n-button>
          <n-button @click="refreshFromWeb" :loading="refreshing"><template #icon><n-icon><Globe /></n-icon></template>拉取最新岗位</n-button>
          <n-input v-model:value="keyword" placeholder="搜索 公司 / 岗位 / 备注" clearable style="width: 260px" />
          <n-button quaternary type="primary" @click="resetFilters"><template #icon><n-icon><FilterOff /></n-icon></template>重置筛选</n-button>
        </n-space>

        <!-- 筛选 -->
        <n-card size="small" :bordered="true" class="filter-card" embedded>
          <div class="filter-row">
            <div class="filter-cell">
              <span class="filter-label">类别</span>
              <n-select
                v-model:value="filter.category"
                :options="categoryOptions"
                multiple size="small" placeholder="全部"
                :max-tag-count="2" :render-tag="renderCategoryTag"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">地点</span>
              <n-select
                v-model:value="filter.city"
                :options="cityOptions"
                multiple size="small" placeholder="全部"
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
              <span class="filter-label">动作</span>
              <n-select
                v-model:value="filter.hasNextAction"
                :options="hasActionOptions"
                size="small"
              />
            </div>
            <div class="filter-cell">
              <span class="filter-label">投递</span>
              <n-select
                v-model:value="filter.applied"
                :options="appliedFilterOptions"
                multiple size="small" placeholder="全部"
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
            :data="sortedJobs"
            :row-key="(row) => row.id"
            :bordered="false"
            :single-line="false"
            size="small"
            :row-props="rowProps"
            :pagination="pagination"
            @update:sorter="onSorterChange"
          />
        </n-card>

        <JobForm v-model:show="formOpen" :job="editingJob" @save="onSave" />
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
  NConfigProvider, NMessageProvider, NGrid, NGi, NCard, NStatistic,
  NIcon, NSpace, NButton, NInput,
  NTag, NSelect, NDataTable, NModal, NSpin, NPopconfirm, useMessage, zhCN, dateZhCN,
} from 'naive-ui'
import { Plus, Refresh, Globe, Stack, Check, Clock, AlertTriangle, Edit, Trash, ExternalLink, Circle, CircleCheck, CircleX, AlertCircle, Loader, FilterOff } from '@vicons/tabler'
import JobForm from './JobForm.vue'

const categories = ['公务员', '国企', '事业单位', '中小厂', '小而美企业']
const cities = ['广州市', '深圳市', '佛山市', '清远市', '跨地市']

const categoryOptions = categories.map(c => ({ label: c, value: c }))
const cityOptions = cities.map(c => ({ label: c, value: c }))

const renderTag = (type, label, handleClose) =>
  h(NTag, { type, size: 'small', bordered: false, closable: true, onClose: handleClose }, { default: () => h('span', { style: 'color:inherit' }, label) })
const renderCategoryTag = ({ option, handleClose }) => renderTag(catTag[option.value] || 'default', option.label, handleClose)
const renderCityTag = ({ option, handleClose }) => renderTag('default', option.label, handleClose)
const deadlineOptions = [
  { label: '7天内截止', value: 'urgent' },
  { label: '招聘中', value: 'active' },
  { label: '已过期', value: 'overdue' },
  { label: '无截止日期', value: 'no-deadline' },
]
const appliedFilterOptions = [
  { label: '待投递', value: 0 },
  { label: '已投递', value: 1 },
  { label: '已笔试', value: 2 },
  { label: '已面试', value: 3 },
  { label: '已 offer', value: 4 },
  { label: '已拒', value: 5 },
]
const verifiedFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '待验证', value: 0 },
  { label: '已验证', value: 1 },
  { label: '失效', value: 2 },
]
const sourceFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '手动', value: 'manual' },
  { label: 'AI 抓取', value: 'fetch' },
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
const hasActionOptions = [
  { label: '全部', value: false },
  { label: '有待办', value: true },
]
const weekendOptions = [
  { label: '全部', value: 'all' },
  { label: '双休', value: '周末双休' },
  { label: '单休', value: '单休' },
  { label: '大小周', value: '大小周' },
  { label: '未知', value: 'unknown' },
]

const catTag = { '公务员': 'info', '国企': 'error', '事业单位': 'warning', '中小厂': 'success', '小而美企业': 'warning' }

const themeOverrides = { common: { primaryColor: '#18a058', primaryColorHover: '#36ad6a', primaryColorPressed: '#0c7a43', primaryColorSuppl: '#36ad6a', borderRadius: '6px' } }

const jobs = ref([])
const stats = reactive({ total: 0, real_count: 0, placeholder_count: 0, applied_count: 0, pending_count: 0, urgent_count: 0 })
const formOpen = ref(false)
const editingJob = ref(null)
const keyword = ref('')
const reloading = ref(false)
const filter = reactive({ category: [...categories], city: [...cities], applied: [0, 1, 2, 3, 4, 5], verified: 'all', source: 'all', salaryMin: 0, hasNextAction: false, weekend: 'all', deadlineRange: 'active' })
let msg = null

onMounted(() => { try { msg = useMessage() } catch(e) {} ; refreshFromDB(false) })

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

const onSave = async (job) => {
  try {
    const r = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs: [job], source: 'manual' }),
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

const resetFilters = () => { filter.category = [...categories]; filter.city = [...cities]; filter.applied = [0, 1, 2, 3, 4, 5]; filter.verified = 'all'; filter.source = 'all'; filter.salaryMin = 0; filter.hasNextAction = false; filter.weekend = 'all'; filter.deadlineRange = 'active'; keyword.value = '' }

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
const matchDeadline = (job, range) => { const d = days(job.deadline); switch(range) { case 'overdue': return d !== null && d < 0; case 'urgent': return d !== null && d >= 0 && d <= 7; case 'active': return d !== null && d >= 0; case 'no-deadline': return d === null; default: return true } }

const matchApplied = (job, allowedStatuses) => allowedStatuses.includes(Number(job.applied ?? 0))
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
const matchHasNextAction = (job, on) => !on || !!job.next_action
const filteredJobs = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return jobs.value.filter(j => filter.category.includes(j.category) && filter.city.includes(j.city) && matchApplied(j, filter.applied) && matchVerified(j, filter.verified) && matchSource(j, filter.source) && matchSalaryRange(j, filter.salaryMin) && matchHasNextAction(j, filter.hasNextAction) && matchDeadline(j, filter.deadlineRange) && (!kw || (j.company+' '+j.position+' '+j.notes+' '+(j.salary_range||'')+' '+(j.next_action||'')).toLowerCase().includes(kw)))
})

// 排序后传给 n-data-table（n-data-table 的内置 3 态太难控，改用 data 已是排好序的）
// 默认按截止日期升序
const sortMap = ref({ deadline: 'ascend' })
const tablePageSize = ref(10)  // 表格分页大小（响应式，n-data-table 改时回写）
const sorters = { applied: (a, b, o) => cmp(a.applied, b.applied) * (o === 'ascend' ? 1 : -1), company: (a, b, o) => cmp(a.company, b.company) * (o === 'ascend' ? 1 : -1), position: (a, b, o) => cmp(a.position, b.position) * (o === 'ascend' ? 1 : -1), city: (a, b, o) => cmp(a.city, b.city) * (o === 'ascend' ? 1 : -1), deadline: (a, b, o) => cmpDeadline(a.deadline, b.deadline) * (o === 'ascend' ? 1 : -1), category: (a, b, o) => cmp(a.category, b.category) * (o === 'ascend' ? 1 : -1), weekend: (a, b, o) => cmp(a.weekend, b.weekend) * (o === 'ascend' ? 1 : -1), notes: (a, b, o) => cmp(a.notes, b.notes) * (o === 'ascend' ? 1 : -1), salary_range: (a, b, o) => (salarySortVal(a.salary_range) - salarySortVal(b.salary_range)) * (o === 'ascend' ? 1 : -1), next_action: (a, b, o) => cmp(a.next_action, b.next_action) * (o === 'ascend' ? 1 : -1) }
const sortedJobs = computed(() => {
  const entry = Object.entries(sortMap.value)[0]
  if (!entry) return filteredJobs.value
  const [columnKey, order] = entry
  const fn = sorters[columnKey]
  if (!fn) return filteredJobs.value
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
  if (!row.deadline) return h('span', { style: 'color:#aaa' }, '—')
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
  5: { label: '已拒', color: '#d03050' },
}
const appliedOptions = Object.entries(APPLIED_META).map(([k, v]) => ({ label: v.label, value: Number(k) }))

const renderApplied = (row) => {
  const meta = APPLIED_META[row.applied] || APPLIED_META[0]
  return h(NTag, {
    type: row.applied === 4 ? 'success' : row.applied === 5 ? 'error' : row.applied >= 2 ? 'warning' : row.applied === 1 ? 'info' : 'default',
    size: 'small',
    bordered: false,
    round: true,
    style: 'cursor:pointer',
    onClick: () => {
      // 点击循环切换到下一状态（不打开下拉）
      const next = (Number(row.applied ?? 0) + 1) % 6
      patchJob(row.id, { applied: next })
    },
  }, { default: () => meta.label })
}

const SOURCE_META = {
  manual: { label: '手动', color: '#909399' },
  fetch: { label: 'AI', color: '#2080f0' },
}
const renderSource = (row) => {
  const meta = SOURCE_META[row.source] || SOURCE_META.manual
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

const renderCompany = (row) => row.link ? h('a', { href: row.link, target: '_blank', style: 'color:#18a058' }, [row.company, ' ', h(NIcon, { size: 11 }, { default: () => h(ExternalLink) })]) : h('span', null, row.company)

const renderActions = (row) => {
  const editBtn = h(NButton, { size: 'tiny', quaternary: true, circle: true, onClick: () => openEdit(row) }, { icon: () => h(NIcon, null, { default: () => h(Edit) }) })
  const delBtn = h(NPopconfirm, { onPositiveClick: () => remove(row) }, {
    trigger: () => h(NButton, { size: 'tiny', quaternary: true, circle: true, type: 'error' }, { icon: () => h(NIcon, null, { default: () => h(Trash) }) }),
    default: () => `确认删除「${row.company} - ${row.position}」？`
  })
  return h(NSpace, { size: 'small' }, { default: () => [editBtn, delBtn] })
}

const rowProps = (row) => ({
  style: row.applied
    ? 'opacity:0.45'
    : (row.is_placeholder ? 'opacity:0.7; background:#fafafa' : 'cursor:pointer'),
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

const columns = computed(() => [
  { title: '公司', key: 'company', width: 180, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.company, b.company), sortOrder: sortMap.value.company || false, ellipsis: { tooltip: true }, render: renderCompany },
  { title: '岗位', key: 'position', width: 180, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.position, b.position), sortOrder: sortMap.value.position || false, ellipsis: { tooltip: true } },
  { title: '工作地', key: 'city', width: 88, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.city, b.city), sortOrder: sortMap.value.city || false, ellipsis: { tooltip: true } },
  { title: '薪资', key: 'salary_range', width: 120, titleAlign: 'center', align: 'center', sorter: (a, b) => salarySortVal(a.salary_range) - salarySortVal(b.salary_range), sortOrder: sortMap.value.salary_range || false, ellipsis: { tooltip: true }, render: (row) => row.salary_range ? h('span', { style: 'font-weight:600;color:#18a058' }, row.salary_range) : h('span', { style: 'color:#aaa' }, '—') },
  { title: '截止日期', key: 'deadline', width: 160, titleAlign: 'center', align: 'center', sorter: (a, b) => cmpDeadline(a.deadline, b.deadline), sortOrder: sortMap.value.deadline || false, ellipsis: { tooltip: true }, render: renderDeadline },
  { title: '类别', key: 'category', width: 100, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.category, b.category), sortOrder: sortMap.value.category || false, ellipsis: { tooltip: true }, render: renderCategory },
  { title: '周末', key: 'weekend', width: 90, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.weekend, b.weekend), sortOrder: sortMap.value.weekend || false, ellipsis: { tooltip: true }, render: renderWeekend },
  { title: '备注', key: 'notes', minWidth: 160, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.notes, b.notes), sortOrder: sortMap.value.notes || false, ellipsis: { tooltip: true }, render: (row) => row.notes ? h('span', { style: 'font-size:12px' }, row.notes) : h('span', { style: 'color:#aaa' }, '—') },
  { title: '投递状态', key: 'applied', width: 110, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.applied, b.applied), sortOrder: sortMap.value.applied || false, ellipsis: { tooltip: true }, render: renderApplied },
  { title: '下一步', key: 'next_action', width: 160, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.next_action, b.next_action), sortOrder: sortMap.value.next_action || false, ellipsis: { tooltip: true }, render: (row) => row.next_action ? h('span', { style: 'font-size:12px' }, row.next_action) : h('span', { style: 'color:#aaa' }, '—') },
  { title: '验证', key: 'verified', width: 78, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.verified, b.verified), sortOrder: sortMap.value.verified || false, ellipsis: { tooltip: true }, render: renderVerified },
  { title: '来源', key: 'source', width: 64, titleAlign: 'center', align: 'center', sorter: (a, b) => cmp(a.source, b.source), sortOrder: sortMap.value.source || false, ellipsis: { tooltip: true }, render: renderSource },
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
</script>

<style scoped>
.offer-dashboard { margin: 12px 0; }
.stats-row { margin-bottom: 14px; }
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
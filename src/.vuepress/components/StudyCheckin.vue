<template>
  <n-config-provider :theme="null" :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <div class="checkin-dashboard">
        <!-- 报名提醒跑马灯 -->
        <div class="marquee" aria-label="27届报名节点提醒">
          <div class="marquee-track">
            <span v-for="(item, i) in [...reminders, ...reminders]" :key="i" class="marquee-item">
              📌 {{ item }}
            </span>
          </div>
        </div>

        <!-- 统计卡 -->
        <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:3" responsive="screen" class="stats-row">
          <n-gi>
            <n-card hoverable embedded>
              <n-statistic label="连续打卡" :value="streak"><template #suffix>天</template></n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded>
              <n-statistic label="本周完成率" :value="weekRate"><template #suffix>%</template></n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card hoverable embedded>
              <n-statistic label="今日完成" :value="todayDone">
                <template #suffix>/ {{ todayTotal }}</template>
              </n-statistic>
            </n-card>
          </n-gi>
        </n-grid>

        <!-- 今日打卡 -->
        <n-card :bordered="true" class="today-card" embedded>
          <template #header>
            <div class="card-head">
              <span>今日打卡 · {{ today }}</span>
              <n-button size="small" quaternary type="primary" @click="openTemplate">
                <template #icon><n-icon><Edit /></n-icon></template>编辑作息
              </n-button>
            </div>
          </template>
          <div class="slot-list">
            <template v-for="s in day.slots" :key="'slot-' + s.slot_id">
              <div v-if="isRest(s.title)" class="rest-row">
                <span class="ck-spacer"></span>
                <span class="slot-time">{{ s.time_range }}</span>
                <span class="rest-label">☕ {{ s.title.replace('[休息]', '').trim() }}</span>
              </div>
              <div v-else class="slot-row" :class="{ done: s.done }">
                <n-checkbox :checked="s.done" @update:checked="toggleSlot(s)" @click.stop />
                <span class="slot-time">{{ s.time_range }}</span>
                <template v-if="editingSlot === s.slot_id">
                  <n-input v-model:value="editingText" size="small" autofocus
                    @keyup.enter="saveSlotTitle(s)" @blur="saveSlotTitle(s)"
                    :placeholder="s.template_title" style="flex:1" />
                </template>
                <template v-else>
                  <span class="slot-title" @click="toggleSlot(s)">{{ slotTitle(s.title, today) }}</span>
                  <n-button size="tiny" quaternary circle @click.stop="startEditSlot(s)">
                    <template #icon><n-icon><Edit /></n-icon></template>
                  </n-button>
                  <n-button v-if="s.title !== s.template_title" size="tiny" quaternary circle title="恢复默认" @click.stop="resetSlot(s)">
                    <template #icon><n-icon><Refresh /></n-icon></template>
                  </n-button>
                </template>
              </div>
            </template>
            <div v-for="t in day.tasks" :key="'task-' + t.log_id" class="slot-row task-row" :class="{ done: t.done }">
              <n-checkbox :checked="t.done" @update:checked="toggleTask(t)" @click.stop />
              <n-tag size="small" type="warning" :bordered="false" round>临时</n-tag>
              <span class="slot-title" @click="toggleTask(t)">{{ t.title }}</span>
              <n-button size="tiny" quaternary circle type="error" @click="removeTask(t)">
                <template #icon><n-icon><Trash /></n-icon></template>
              </n-button>
            </div>
          </div>
          <div class="add-task">
            <n-input v-model:value="newTask" size="small" placeholder="加临时任务，如「XX公司笔试」" @keyup.enter="addTask" style="max-width:320px" />
            <n-button size="small" type="primary" @click="addTask"><template #icon><n-icon><Plus /></n-icon></template>添加</n-button>
          </div>
        </n-card>

        <!-- 月历热力图 -->
        <n-card :bordered="true" class="heatmap-card" embedded>
          <template #header>
            <div class="card-head">
              <n-button size="small" quaternary @click="shiftMonth(-1)"><template #icon><n-icon><ChevronLeft /></n-icon></template></n-button>
              <span>{{ viewYear }} 年 {{ viewMonth + 1 }} 月</span>
              <n-button size="small" quaternary @click="shiftMonth(1)"><template #icon><n-icon><ChevronRight /></n-icon></template></n-button>
            </div>
          </template>
          <div class="heatmap-grid">
            <div v-for="w in ['一','二','三','四','五','六','日']" :key="w" class="hm-head">{{ w }}</div>
            <div v-for="(cell, i) in monthCells" :key="i"
                 class="hm-cell" :class="{ empty: !cell, today: cell === today }"
                 :style="cell ? { background: cellColor(rateOf(cell)) } : {}"
                 :title="cell ? `${cell}：${Math.round(rateOf(cell)*100)}%` : ''"
                 @click="cell && selectDate(cell)">
              <span v-if="cell">{{ Number(cell.slice(-2)) }}</span>
            </div>
          </div>
          <div class="hm-legend">
            <span>少</span>
            <span class="lg" v-for="r in [0, 0.25, 0.5, 0.75, 1]" :key="r" :style="{ background: cellColor(r) }"></span>
            <span>多</span>
          </div>
        </n-card>

        <!-- 编辑作息弹窗 -->
        <n-modal v-model:show="tplOpen" preset="card" style="width:560px" title="编辑固定作息">
          <n-space vertical>
            <div v-for="(row, i) in tplDraft" :key="i" class="tpl-row">
              <n-input v-model:value="row.time_range" size="small" placeholder="20:00-20:30" style="width:130px" />
              <n-input v-model:value="row.title" size="small" placeholder="任务内容" />
              <n-button size="tiny" quaternary circle type="error" @click="tplDraft.splice(i, 1)">
                <template #icon><n-icon><Trash /></n-icon></template>
              </n-button>
            </div>
            <n-button dashed size="small" @click="tplDraft.push({ time_range: '', title: '' })">
              <template #icon><n-icon><Plus /></n-icon></template>加一段
            </n-button>
            <n-space justify="end">
              <n-button @click="tplOpen = false">取消</n-button>
              <n-button type="primary" @click="saveTemplate">保存</n-button>
            </n-space>
          </n-space>
        </n-modal>

        <!-- 某天编辑弹窗（点热力图格子） -->
        <n-modal v-model:show="dayOpen" preset="card" style="width:520px" :title="`打卡 · ${editDate}`">
          <div class="slot-list">
            <template v-for="s in editDay.slots" :key="'eslot-' + s.slot_id">
              <div v-if="isRest(s.title)" class="rest-row">
                <span class="ck-spacer"></span>
                <span class="slot-time">{{ s.time_range }}</span>
                <span class="rest-label">☕ {{ s.title.replace('[休息]', '').trim() }}</span>
              </div>
              <div v-else class="slot-row" :class="{ done: s.done }" @click="editToggleSlot(s)">
                <n-checkbox :checked="s.done" @update:checked="editToggleSlot(s)" @click.stop />
                <span class="slot-time">{{ s.time_range }}</span>
                <span class="slot-title">{{ slotTitle(s.title, editDate) }}</span>
              </div>
            </template>
            <div v-for="t in editDay.tasks" :key="'etask-' + t.log_id" class="slot-row task-row" :class="{ done: t.done }">
              <n-checkbox :checked="t.done" @update:checked="editToggleTask(t)" @click.stop />
              <n-tag size="small" type="warning" :bordered="false" round>临时</n-tag>
              <span class="slot-title" @click="editToggleTask(t)">{{ t.title }}</span>
              <n-button size="tiny" quaternary circle type="error" @click="editRemoveTask(t)">
                <template #icon><n-icon><Trash /></n-icon></template>
              </n-button>
            </div>
          </div>
          <div class="add-task">
            <n-input v-model:value="editNewTask" size="small" placeholder="为这天加任务（可提前制定）" @keyup.enter="editAddTask" style="max-width:320px" />
            <n-button size="small" type="primary" @click="editAddTask"><template #icon><n-icon><Plus /></n-icon></template>添加</n-button>
          </div>
        </n-modal>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  NConfigProvider, NMessageProvider, NGrid, NGi, NCard, NStatistic,
  NIcon, NSpace, NButton, NInput, NCheckbox, NTag, NModal,
  useMessage, zhCN, dateZhCN,
} from 'naive-ui'
import { Plus, Edit, Trash, ChevronLeft, ChevronRight, Refresh } from '@vicons/tabler'

// 27 届报名节点（预估窗口，官方出公告后手改这里）
const reminders = [
  '国考：报名约 26年10月，笔试约 26年11-12月',
  '省考(粤)：报名约 26年底-27初，笔试约 27年1-3月',
  '事业联考：下半年约 26年10月 / 上半年约 27年4月',
  '央国企网申：秋招高峰 9-11月，随投随看',
]

const themeOverrides = { common: { primaryColor: '#18a058', primaryColorHover: '#36ad6a', primaryColorPressed: '#0c7a43', primaryColorSuppl: '#36ad6a', borderRadius: '6px' } }

// 本地日期 YYYY-MM-DD（避免 toISOString 的 UTC 偏移）
const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const today = fmt(new Date())

// 休息段：标题以 [休息] 开头，不计打卡、不进完成率
const isRest = (title) => typeof title === 'string' && title.startsWith('[休息]')

// 标题含「｜」时按日期奇偶二选一：单数日取前半，双数日取后半
const slotTitle = (title, date) => {
  if (!title || !title.includes('｜')) return title
  const [odd, even] = title.split('｜')
  const day = Number((date || today).slice(-2))
  return (day % 2 === 1 ? odd : even).trim()
}

let msg = null
const day = reactive({ date: today, slots: [], tasks: [] })
const newTask = ref('')
const heatmap = ref([])  // [{date, done, total, rate}]
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())  // 0-11

onMounted(() => {
  try { msg = useMessage() } catch (e) {}
  loadDay()
  loadHeatmap()
})

// ===== 今日打卡 =====
const loadDay = async () => {
  try {
    const d = await fetch('/api/checkin?date=' + today).then(r => r.json())
    if (!d.success) throw new Error(d.error)
    day.slots = d.slots
    day.tasks = d.tasks
  } catch (e) { msg?.warning('加载失败：' + e.message) }
}

const toggleSlot = async (s) => {
  s.done = !s.done  // 乐观更新
  try {
    await fetch('/api/checkin/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: today, slotId: s.slot_id }) })
    loadHeatmap()
  } catch (e) { s.done = !s.done; msg?.warning('保存失败') }
}

// 当日临时改某固定段标题（只影响今天，不动模板）
const editingSlot = ref(null)
const editingText = ref('')
const startEditSlot = (s) => { editingSlot.value = s.slot_id; editingText.value = s.title }
const saveSlotTitle = async (s) => {
  if (editingSlot.value !== s.slot_id) return  // blur 后已切换，避免重复保存
  const title = editingText.value.trim()
  editingSlot.value = null
  try {
    await fetch('/api/checkin/slot-title', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: today, slotId: s.slot_id, title }) })
    await loadDay()
  } catch (e) { msg?.warning('保存失败') }
}
const resetSlot = async (s) => {
  try {
    await fetch('/api/checkin/slot-title', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: today, slotId: s.slot_id, title: '' }) })
    await loadDay()
  } catch (e) { msg?.warning('恢复失败') }
}

const toggleTask = async (t) => {
  t.done = !t.done
  try {
    await fetch('/api/checkin/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logId: t.log_id }) })
    loadHeatmap()
  } catch (e) { t.done = !t.done; msg?.warning('保存失败') }
}

const addTask = async () => {
  const title = newTask.value.trim()
  if (!title) return
  try {
    const d = await fetch('/api/checkin/task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: today, title }) }).then(r => r.json())
    if (!d.success) throw new Error(d.error)
    day.tasks.push({ log_id: d.logId, title: d.title, done: false, slot_id: null })
    newTask.value = ''
    loadHeatmap()
  } catch (e) { msg?.warning('添加失败：' + e.message) }
}

const removeTask = async (t) => {
  try {
    await fetch('/api/checkin/task/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logId: t.log_id }) })
    day.tasks = day.tasks.filter(x => x.log_id !== t.log_id)
    loadHeatmap()
  } catch (e) { msg?.warning('删除失败') }
}

// ===== 统计 =====
const todayDone = computed(() => day.slots.filter(s => !isRest(s.title) && s.done).length + day.tasks.filter(t => t.done).length)
const todayTotal = computed(() => day.slots.filter(s => !isRest(s.title)).length + day.tasks.length)

const rateMap = computed(() => Object.fromEntries(heatmap.value.map(h => [h.date, h.rate])))
const rateOf = (date) => rateMap.value[date] || 0

// 连续打卡：从今天往前，rate > 0 的连续天数
const streak = computed(() => {
  let n = 0
  const d = new Date()
  while (true) {
    const key = fmt(d)
    if ((rateMap.value[key] || 0) > 0) { n++; d.setDate(d.getDate() - 1) }
    else break
  }
  return n
})

// 本周（周一起）完成率均值
const weekRate = computed(() => {
  const d = new Date()
  const dow = (d.getDay() + 6) % 7  // 周一=0
  let sum = 0
  for (let i = 0; i <= dow; i++) {
    const dd = new Date(); dd.setDate(d.getDate() - i)
    sum += rateMap.value[fmt(dd)] || 0
  }
  return Math.round((sum / (dow + 1)) * 100)
})

// ===== 月历热力图 =====
const loadHeatmap = async () => {
  const from = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-01`
  const last = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const to = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`
  try {
    const d = await fetch(`/api/checkin/heatmap?from=${from}&to=${to}`).then(r => r.json())
    if (d.success) heatmap.value = d.data
  } catch (e) {}
}

const shiftMonth = (delta) => {
  let m = viewMonth.value + delta, y = viewYear.value
  if (m < 0) { m = 11; y-- } else if (m > 11) { m = 0; y++ }
  viewMonth.value = m; viewYear.value = y
  loadHeatmap()
}

// 月历格子：前导空格对齐周一 + 当月每天
const monthCells = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const lead = (first.getDay() + 6) % 7  // 周一=0
  const days = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const cells = Array(lead).fill(null)
  for (let d = 1; d <= days; d++) {
    cells.push(`${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return cells
})

const cellColor = (rate) => {
  if (rate <= 0) return '#ebedf0'
  if (rate < 0.25) return '#c6e9d3'
  if (rate < 0.5) return '#8ed3a8'
  if (rate < 0.75) return '#4cb875'
  if (rate < 1) return '#2b9d54'
  return '#18a058'
}

// ===== 点某天：编辑那天（含未来，支持提前制定） =====
const dayOpen = ref(false)
const editDate = ref('')
const editDay = reactive({ slots: [], tasks: [] })
const editNewTask = ref('')

const selectDate = async (date) => {
  editDate.value = date
  try {
    const d = await fetch('/api/checkin?date=' + date).then(r => r.json())
    if (!d.success) throw new Error(d.error)
    editDay.slots = d.slots
    editDay.tasks = d.tasks
    dayOpen.value = true
  } catch (e) { msg?.warning('加载失败：' + e.message) }
}

// 编辑弹窗操作后：刷新热力图；若改的是今天，同步今日区
const afterEdit = () => {
  loadHeatmap()
  if (editDate.value === today) loadDay()
}

const editToggleSlot = async (s) => {
  s.done = !s.done
  try {
    await fetch('/api/checkin/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: editDate.value, slotId: s.slot_id }) })
    afterEdit()
  } catch (e) { s.done = !s.done; msg?.warning('保存失败') }
}
const editToggleTask = async (t) => {
  t.done = !t.done
  try {
    await fetch('/api/checkin/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logId: t.log_id }) })
    afterEdit()
  } catch (e) { t.done = !t.done; msg?.warning('保存失败') }
}
const editAddTask = async () => {
  const title = editNewTask.value.trim()
  if (!title) return
  try {
    const d = await fetch('/api/checkin/task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: editDate.value, title }) }).then(r => r.json())
    if (!d.success) throw new Error(d.error)
    editDay.tasks.push({ log_id: d.logId, title: d.title, done: false, slot_id: null })
    editNewTask.value = ''
    afterEdit()
  } catch (e) { msg?.warning('添加失败：' + e.message) }
}
const editRemoveTask = async (t) => {
  try {
    await fetch('/api/checkin/task/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logId: t.log_id }) })
    editDay.tasks = editDay.tasks.filter(x => x.log_id !== t.log_id)
    afterEdit()
  } catch (e) { msg?.warning('删除失败') }
}

// ===== 编辑作息 =====
const tplOpen = ref(false)
const tplDraft = ref([])
const openTemplate = async () => {
  try {
    const d = await fetch('/api/checkin/template').then(r => r.json())
    if (d.success) tplDraft.value = d.data.map(r => ({ time_range: r.time_range, title: r.title }))
    tplOpen.value = true
  } catch (e) { msg?.warning('加载模板失败') }
}
const saveTemplate = async () => {
  try {
    const rows = tplDraft.value.filter(r => r.time_range.trim() && r.title.trim())
    const d = await fetch('/api/checkin/template', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) }).then(r => r.json())
    if (!d.success) throw new Error(d.error)
    tplOpen.value = false
    msg?.success('已保存作息')
    await loadDay()
    loadHeatmap()
  } catch (e) { msg?.warning('保存失败：' + e.message) }
}
</script>

<style scoped>
.checkin-dashboard { margin: 12px 0; }

/* 跑马灯 */
.marquee { overflow: hidden; white-space: nowrap; background: linear-gradient(90deg, rgba(24,160,88,0.08), rgba(24,160,88,0.02)); border: 1px solid rgba(24,160,88,0.2); border-radius: 6px; padding: 8px 0; margin-bottom: 14px; }
.marquee-track { display: inline-block; animation: marquee 30s linear infinite; }
.marquee:hover .marquee-track { animation-play-state: paused; }
.marquee-item { display: inline-block; padding: 0 32px; font-size: 13px; color: var(--text-color-2); font-weight: 500; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.stats-row { margin-bottom: 14px; }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

/* 今日打卡 */
.today-card { margin-bottom: 14px; }
.slot-list { display: flex; flex-direction: column; gap: 4px; }
.slot-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.slot-row:hover { background: rgba(24,160,88,0.06); }
.slot-row.done .slot-title { color: var(--text-color-3); text-decoration: line-through; }
.slot-time { font-family: ui-monospace, Consolas, monospace; font-size: 12px; color: #18a058; font-weight: 600; min-width: 92px; }
.slot-title { flex: 1; font-size: 14px; }
.task-row { background: rgba(240,160,32,0.05); }
.rest-row { display: flex; align-items: center; gap: 10px; padding: 4px 10px; opacity: 0.6; }
.ck-spacer { width: 18px; flex-shrink: 0; }
.rest-label { font-size: 12px; color: var(--text-color-3); font-style: italic; }
.add-task { display: flex; gap: 8px; margin-top: 12px; }

/* 热力图 */
.heatmap-card { margin-bottom: 14px; }
.heatmap-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; max-width: 460px; margin: 0 auto; }
.hm-head { text-align: center; font-size: 12px; color: var(--text-color-3); padding-bottom: 3px; }
.hm-cell { aspect-ratio: 1; max-width: 54px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #555; cursor: pointer; transition: transform 0.1s; }
.hm-cell:hover:not(.empty) { transform: scale(1.12); box-shadow: 0 0 0 2px rgba(24,160,88,0.4); }
.hm-cell.empty { cursor: default; background: transparent !important; }
.hm-cell.today { outline: 2px solid #f0a020; outline-offset: -2px; font-weight: 700; }
.hm-legend { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 10px; font-size: 12px; color: var(--text-color-3); }
.hm-legend .lg { width: 14px; height: 14px; border-radius: 3px; display: inline-block; }

/* 模板编辑 */
.tpl-row { display: flex; align-items: center; gap: 8px; }
</style>

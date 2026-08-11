<template>
  <n-modal
    :show="show"
    preset="card"
    :title="isEdit ? '✎ 编辑岗位' : '➕ 新增岗位'"
    style="width: 640px; max-width: calc(100vw - 32px)"
    :mask-closable="!loading"
    :closable="!loading"
    @update:show="$emit('update:show', false)"
  >
    <n-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="80"
      size="medium"
    >
      <n-form-item label="类别" path="category">
        <n-select v-model:value="form.category" :options="categoryOptions" />
      </n-form-item>

      <n-form-item label="工作地" path="city">
        <n-select v-model:value="form.city" :options="cityOptions" />
      </n-form-item>

      <n-form-item label="公司名" path="company">
        <n-input v-model:value="form.company" placeholder="如:佳都科技集团股份有限公司" maxlength="60" show-count />
      </n-form-item>

      <n-form-item label="岗位名" path="position">
        <n-input v-model:value="form.position" placeholder="如:Java 后端开发" maxlength="60" show-count />
      </n-form-item>

      <n-form-item label="截止日期">
        <n-date-picker
          v-model:value="form.deadlineTs"
          type="date"
          clearable
          placeholder="选择截止日期"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="学历要求">
        <n-select v-model:value="form.education" :options="educationOptions" />
      </n-form-item>

      <n-form-item label="投递链接">
        <n-input v-model:value="form.link" placeholder="https://" />
      </n-form-item>

      <n-form-item label="薪资">
        <n-input v-model:value="form.salary_range" placeholder="如:15-20k×13、面议" maxlength="40" />
      </n-form-item>

      <n-form-item label="下一步">
        <n-input v-model:value="form.next_action" placeholder="如:7/20 笔试、等 HR 联系" maxlength="100" />
      </n-form-item>

      <n-form-item label="进度链接" v-if="form.applied >= 1">
        <n-input v-model:value="form.progress_url" placeholder="投递后填写（如笔试链接/HR 邮箱/招聘进度页），点击表格里的「已投递」直接打开" maxlength="200" />
      </n-form-item>

      <n-form-item label="备注">
        <n-input
          v-model:value="form.notes"
          type="textarea"
          :rows="3"
          placeholder="匹配度 / 投递方式 / 关注点 / JD 摘要"
          maxlength="500"
          show-count
        />
      </n-form-item>

      <n-form-item label="投递批次">
        <n-select v-model:value="form.batch" :options="batchOptions" clearable />
      </n-form-item>

      <n-form-item label="投递状态" path="applied">
        <n-select v-model:value="form.applied" :options="appliedOptions" />
      </n-form-item>

      <n-form-item label="投递时间" v-if="form.applied >= 1">
        <n-date-picker
          v-model:value="form.appliedAtTs"
          type="date"
          clearable
          placeholder="选择投递日期（默认今天）"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="轮次" v-if="form.applied !== 0">
        <n-space style="width:100%" :wrap-item="false">
          <n-select
            v-model:value="form.round"
            :options="roundOptions"
            placeholder="第几轮"
            style="flex:1;min-width:0"
            clearable
          />
          <n-select
            v-model:value="form.result"
            :options="resultOptions"
            placeholder="本轮结果"
            style="flex:1;min-width:0"
            clearable
          />
        </n-space>
      </n-form-item>

      <n-form-item label="渠道">
        <n-select v-model:value="form.source" :options="sourceOptions" />
      </n-form-item>

      <n-form-item label="验证状态">
        <n-select v-model:value="form.verified" :options="verifiedOptions" />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="onCancel">取消</n-button>
        <n-button type="primary" @click="onSubmit" :loading="loading">保存</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  NModal, NForm, NFormItem, NInput, NSelect,
  NDatePicker, NSpace, NButton,
} from 'naive-ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  job: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:show', 'save'])

const categoryOptions = [
  { label: '公务员', value: '公务员' },
  { label: '国企', value: '国企' },
  { label: '事业单位', value: '事业单位' },
  { label: '中小厂', value: '中小厂' },
  { label: '小而美企业', value: '小而美企业' },
]
const cityOptions = [
  { label: '广州市', value: '广州市' },
  { label: '深圳市', value: '深圳市' },
  { label: '佛山市', value: '佛山市' },
  { label: '清远市', value: '清远市' },
  { label: '跨地市', value: '跨地市' },
]
const educationOptions = [
  { label: '不限', value: '不限' },
  { label: '专科', value: '专科' },
  { label: '本科', value: '本科' },
  { label: '本科及以上', value: '本科及以上' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' },
]
const appliedOptions = [
  { label: '待投递', value: 0 },
  { label: '已投递', value: 1 },
  { label: '已 offer', value: 4 },
  { label: '已结束', value: 5 },
]
const batchOptions = [
  { label: '— 不选', value: null },
  { label: '实习', value: '实习' },
  { label: '27届秋招提前批', value: '27届秋招提前批' },
  { label: '27届秋招', value: '27届秋招' },
  { label: '27届春招', value: '27届春招' },
  { label: '未开始', value: '未开始' },
]

// result 枚举精简:NULL=进行中, 1=过, -1=挂, -7=主动撤回, -8=我拒offer, -9=offer撤回, 99=其他
// -10 人才储备库不可手动编辑（由后端 21 天规则自动设置）
const resultOptions = [
  { label: '进行中', value: null },
  { label: '过', value: 1 },
  { label: '挂', value: -1 },
  { label: '主动撤回', value: -7 },
  { label: '我拒 offer', value: -8 },
  { label: 'offer 撤回', value: -9 },
  { label: '其他', value: 99 },
]
const roundOptions = [
  { label: '— 不限（不选）', value: null },
  { label: '简历初筛', value: 0 },
  { label: '测评', value: 1 },
  { label: '笔试', value: 2 },
  { label: '一面', value: 3 },
  { label: '二面', value: 4 },
  { label: '三面', value: 5 },
  { label: '终面', value: 6 },
  { label: 'HR 面', value: 7 },
]
const sourceOptions = [
  { label: '官网', value: '官网' },
  { label: '前程无忧', value: '前程无忧' },
  { label: '应届生招聘', value: '应届生招聘' },
  { label: '猎聘', value: '猎聘' },
  { label: '智联招聘', value: '智联招聘' },
  { label: 'BOSS直聘', value: 'BOSS直聘' },
]
const verifiedOptions = [
  { label: '待验证', value: 0 },
  { label: '已验证', value: 1 },
  { label: '失效', value: 2 },
]

const isEdit = computed(() => !!props.job)

const formRef = ref(null)

const form = reactive({
  category: '中小厂',
  city: '广州市',
  company: '',
  position: '',
  deadlineTs: null,
  appliedAtTs: null,
  education: '本科',
  link: '',
  notes: '',
  applied: 0,
  round: null,
  result: null,
  batch: null,
  source: '官网',
  verified: 0,
  salary_range: '',
  next_action: '',
  progress_url: '',
})

const rules = {
  company: { required: true, message: '公司名必填', trigger: ['blur', 'input'] },
  position: { required: true, message: '岗位名必填', trigger: ['blur', 'input'] },
  category: { required: true, message: '类别必填', trigger: ['blur', 'change'] },
  city: { required: true, message: '工作地必填', trigger: ['blur', 'change'] },
}

watch(
  () => props.show,
  (v) => {
    if (v) {
      if (props.job) {
        form.category = props.job.category
        form.city = props.job.city
        form.company = props.job.company || ''
        form.position = props.job.position || ''
        form.deadlineTs = props.job.deadline ? new Date(props.job.deadline).getTime() : null
        // applied_at 形如 "2026-07-26" / "2026-07-26 10:00"，取前 10 位
        form.appliedAtTs = props.job.applied_at ? new Date(String(props.job.applied_at).slice(0, 10)).getTime() : null
        form.education = props.job.education || '本科'
        form.link = props.job.link || ''
        form.notes = props.job.notes || ''
        form.applied = Number(props.job.applied ?? 0)
        form.round = props.job.round == null ? null : Number(props.job.round)
        form.result = props.job.result == null ? null : Number(props.job.result)
        // 人才储备库(result=-10)是后端自动判定,前端不暴露,UI 上看不到
        if (form.result === -10) form.result = null
        form.batch = props.job.batch == null || props.job.batch === '' ? null : props.job.batch
        form.source = props.job.source || 'manual'
        form.verified = Number(props.job.verified ?? 0)
        form.salary_range = props.job.salary_range || ''
        form.next_action = props.job.next_action || ''
        form.progress_url = props.job.progress_url || ''
      } else {
        form.category = '中小厂'
        form.city = '广州市'
        form.company = ''
        form.position = ''
        form.deadlineTs = null
        form.appliedAtTs = null
        form.education = '本科'
        form.link = ''
        form.notes = ''
        form.applied = 0
        form.round = null
        form.result = null
        form.batch = null
        form.source = 'manual'
        form.verified = 0
        form.salary_range = ''
        form.next_action = ''
        form.progress_url = ''
      }
    }
  },
  { immediate: true },
)

const onCancel = () => emit('update:show', false)

const onSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch (e) {
    return
  }
  const deadline = form.deadlineTs
    ? new Date(form.deadlineTs).toISOString().slice(0, 10)
    : null
  const applied_at = form.appliedAtTs
    ? new Date(form.appliedAtTs).toISOString().slice(0, 10)
    : null
  emit('save', {
    ...(props.job || {}),
    category: form.category,
    city: form.city,
    company: form.company.trim(),
    position: form.position.trim(),
    deadline,
    applied_at: form.applied >= 1 ? (applied_at || '') : '',
    education: form.education,
    link: form.link.trim() || null,
    notes: form.notes.trim(),
    applied: Number(form.applied),
    round: form.round == null || form.round === '' ? null : Number(form.round),
    result: form.result == null || form.result === '' ? null : Number(form.result),
    batch: form.batch == null || form.batch === '' ? null : form.batch,
    source: form.source,
    verified: Number(form.verified),
    salary_range: form.salary_range.trim(),
    next_action: form.next_action.trim(),
    progress_url: form.progress_url.trim(),
  })
}
</script>

<style scoped>
:deep(.n-form-item .n-form-item-label) {
  font-weight: 600;
}
</style>
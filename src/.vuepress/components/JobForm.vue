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

      <n-form-item label="备注">
        <n-input
          v-model:value="form.notes"
          type="textarea"
          :rows="3"
          placeholder="匹配度 / 投递方式 / 关注点"
          maxlength="200"
          show-count
        />
      </n-form-item>

      <n-form-item label="已投递" path="applied">
        <n-select v-model:value="form.applied" :options="appliedOptions" />
      </n-form-item>

      <n-form-item label="信息来源">
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
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' },
]
const appliedOptions = [
  { label: '待投递', value: 0 },
  { label: '已投递', value: 1 },
  { label: '已笔试', value: 2 },
  { label: '已面试', value: 3 },
  { label: '已 offer', value: 4 },
  { label: '已拒', value: 5 },
]
const sourceOptions = [
  { label: '手动', value: 'manual' },
  { label: 'AI 抓取', value: 'fetch' },
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
  education: '本科',
  link: '',
  notes: '',
  applied: 0,
  source: 'manual',
  verified: 0,
  salary_range: '',
  next_action: '',
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
        form.education = props.job.education || '本科'
        form.link = props.job.link || ''
        form.notes = props.job.notes || ''
        form.applied = Number(props.job.applied ?? 0)
        form.source = props.job.source || 'manual'
        form.verified = Number(props.job.verified ?? 0)
        form.salary_range = props.job.salary_range || ''
        form.next_action = props.job.next_action || ''
      } else {
        form.category = '中小厂'
        form.city = '广州市'
        form.company = ''
        form.position = ''
        form.deadlineTs = null
        form.education = '本科'
        form.link = ''
        form.notes = ''
        form.applied = 0
        form.source = 'manual'
        form.verified = 0
        form.salary_range = ''
        form.next_action = ''
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
  emit('save', {
    ...(props.job || {}),
    category: form.category,
    city: form.city,
    company: form.company.trim(),
    position: form.position.trim(),
    deadline,
    education: form.education,
    link: form.link.trim() || null,
    notes: form.notes.trim(),
    applied: Number(form.applied),
    source: form.source,
    verified: Number(form.verified),
    salary_range: form.salary_range.trim(),
    next_action: form.next_action.trim(),
  })
}
</script>

<style scoped>
:deep(.n-form-item .n-form-item-label) {
  font-weight: 600;
}
</style>
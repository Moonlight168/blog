#!/usr/bin/env node
/**
 * jobs-cli.mjs — 投递岗位 CRUD 命令行工具
 *
 * 用法：
 *   node scripts/jobs-cli.mjs insert  <json-file>           # 插入（按 company+position+city 去重）
 *   node scripts/jobs-cli.mjs insert  <json-file> --force   # 已存在则覆盖
 *   node scripts/jobs-cli.mjs update  <id> [--field value…]  # 局部更新
 *   node scripts/jobs-cli.mjs delete  <id>
 *   node scripts/jobs-cli.mjs delete  --company "X" --position "Y" --city "Z"
 *   node scripts/jobs-cli.mjs get     <id>
 *   node scripts/jobs-cli.mjs list    [--keyword k] [--city c] [--category c] [--limit N]
 *   node scripts/jobs-cli.mjs stats
 *
 * insert 用法：
 *   node scripts/jobs-cli.mjs insert ./jobs/ecoflow-backend.json
 *
 *   json-file 字段（必填标 *）：
 *     * category    '公务员'|'国企'|'事业单位'|'中小厂'|'小而美企业'
 *     * city        '广州市'|'深圳市'|'佛山市'|'清远市'|'跨地市'
 *     * company     公司名（≤120 字符）
 *     * position    岗位名（≤120 字符）
 *       deadline    'YYYY-MM-DD' 或 null
 *       education   '不限'|'专科'|'本科'|'本科及以上'|'硕士'|'博士'（默认 '本科及以上'）
 *       weekend     '周末双休'|'单休'|'大小周'（默认 '周末双休'）
 *       link        投递链接（≤500 字符）
 *       notes       备注（≤500 字符）
 *       applied     0..5（默认 0）  0=待投递 1=已投递 2=已笔试 3=已面试 4=已 offer 5=已结束
 *       round       1=一面 2=二面 3=三面 4=终面 5=HR 面（默认 null）;非面试环节不填
 *       result      null=进行中;正数=过;负数=挂/拒(-1主动撤回 -2我拒offer 1简历过 2笔试过 ... 6HR面过 99其他)
 *       batch       '实习'|'27届秋招提前批'|'27届秋招'|'27届春招'|'未开始'（默认 null）
 *       source      'manual'|'fetch'（默认 'manual'）
 *       verified    0|1|2（默认 0）  0=待验证 1=已验证 2=失效
 *       salary_range  如 '15-20k×13'
 *       next_action   如 '7/20 笔试'
 *       id           自定义 id；不传自动生成 job-manual-<slug>-<ts>
 *
 * update 用法：
 *   node scripts/jobs-cli.mjs update <id> --applied 1 --next_action "7/20 笔试"
 *
 * JSON 示例（scripts/jobs/ecoflow-backend.json）：
 *   {
 *     "category": "小而美企业",
 *     "city": "深圳市",
 *     "company": "正浩 EcoFlow",
 *     "position": "后端工程师",
 *     "link": "https://jobs.ecoflow.com/602892/...",
 *     "education": "本科及以上",
 *     "notes": "能源/矿产/环保/农林牧渔研发..."
 *   }
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { jobs } from '../data/jobs-store.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// ===== 校验 =====
const CATEGORIES = ['公务员', '国企', '事业单位', '中小厂', '小而美企业']
const CITIES = ['广州市', '深圳市', '佛山市', '清远市', '跨地市']
const EDUCATIONS = ['不限', '专科', '本科', '本科及以上', '硕士', '博士']
const WEEKENDS = ['周末双休', '单休', '大小周']
const SOURCES = ['manual', 'fetch']
const APPLIED = [0, 1, 2, 3, 4, 5]
const ROUND = [1, 2, 3, 4, 5]
const BATCH = ['实习', '27届秋招提前批', '27届秋招', '27届春招', '未开始']
const VERIFIED = [0, 1, 2]

function err(msg) { console.error('✗', msg); process.exit(1) }
function ok(msg) { console.log('✓', msg) }
function info(msg) { console.log('·', msg) }

// 把公司名/岗位名转 id slug（去空格、保留 ASCII/中文/数字）
function slugify(s) {
  return String(s).trim().replace(/\s+/g, '-').replace(/[^\w一-龥-]/g, '').slice(0, 40) || 'job'
}

function validate(raw, { partial = false } = {}) {
  // 剥离 _ 开头的元字段（如 _comment / _xxx_options / _xxx_note），避免被 sanitize 静默吞掉
  for (const k of Object.keys(raw)) {
    if (k.startsWith('_')) delete raw[k]
  }
  const required = ['category', 'city', 'company', 'position']
  for (const f of required) {
    if (raw[f] === undefined || raw[f] === null || raw[f] === '') {
      err(`必填字段缺失: ${f}`)
    }
  }
  if (!CATEGORIES.includes(raw.category)) err(`category 非法，应为: ${CATEGORIES.join('/')}`)
  if (!CITIES.includes(raw.city)) err(`city 非法，应为: ${CITIES.join('/')}`)
  if (raw.education !== undefined && raw.education !== '' && !EDUCATIONS.includes(raw.education)) {
    err(`education 非法，应为: ${EDUCATIONS.join('/')}`)
  }
  if (raw.weekend !== undefined && raw.weekend !== null && raw.weekend !== '' && !WEEKENDS.includes(raw.weekend)) {
    err(`weekend 非法，应为: ${WEEKENDS.join('/')}`)
  }
  if (raw.source !== undefined && !SOURCES.includes(raw.source)) err(`source 非法，应为: ${SOURCES.join('/')}`)
  if (raw.applied !== undefined && raw.applied !== '' && !APPLIED.includes(Number(raw.applied))) {
    err(`applied 非法，应为: ${APPLIED.join('/')}`)
  }
  if (raw.round !== undefined && raw.round !== null && raw.round !== '' && !ROUND.includes(Number(raw.round))) {
    err(`round 非法，应为: ${ROUND.join('/')}（不填则 null）`)
  }
  if (raw.result !== undefined && raw.result !== null && raw.result !== '') {
    const _r = Number(raw.result)
    if (!Number.isInteger(_r) || _r < -99 || _r > 99) err(`result 非法，应为 -99..99 整数或 null`)
  }
  if (raw.batch !== undefined && raw.batch !== null && raw.batch !== '' && !BATCH.includes(raw.batch)) {
    err(`batch 非法，应为: ${BATCH.join('/')}`)
  }
  if (raw.verified !== undefined && raw.verified !== '' && !VERIFIED.includes(Number(raw.verified))) {
    err(`verified 非法，应为: ${VERIFIED.join('/')}`)
  }
  if (raw.deadline !== undefined && raw.deadline !== null && raw.deadline !== '') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.deadline)) err(`deadline 格式错误，应为 YYYY-MM-DD`)
  }

  // 规范化（默认值 + 类型转换 + 字段截断，对齐 jobs-store.mjs.sanitize）
  const norm = {
    id:         raw.id || `job-manual-${slugify(raw.company)}-${slugify(raw.position)}-${Date.now()}`,
    category:   String(raw.category),
    city:       String(raw.city),
    company:    String(raw.company).slice(0, 120),
    position:   String(raw.position).slice(0, 120),
    deadline:   raw.deadline || null,
    education:  (raw.education || '本科及以上'),
    weekend:    raw.weekend || '周末双休',
    link:       raw.link || null,
    notes:      String(raw.notes || '').slice(0, 500),
    applied:    Number(raw.applied ?? 0),
    round:      raw.round === undefined || raw.round === null || raw.round === '' ? null : Number(raw.round),
    result:     raw.result === undefined || raw.result === null || raw.result === '' ? null : Number(raw.result),
    batch:      raw.batch === undefined || raw.batch === null || raw.batch === '' ? null : String(raw.batch),
    source:     raw.source || 'manual',
    verified:   Number(raw.verified ?? 1),
    salary_range: String(raw.salary_range || '').slice(0, 80),
    next_action:  String(raw.next_action || '').slice(0, 200),
    progress_url:  String(raw.progress_url || '').slice(0, 500),
    applied_at:    String(raw.applied_at || '').slice(0, 25),
  }
  if (partial) {
    // partial 模式（update 用）：剔除空值字段
    for (const k of Object.keys(norm)) {
      if (norm[k] === '' || norm[k] === undefined) delete norm[k]
    }
  }
  return norm
}

// ===== 子命令 =====
async function cmdInsert(args) {
  if (args.length === 0) err('用法: insert <json-file> [--force]')
  const force = args.includes('--force')
  const filePath = args.find(a => !a.startsWith('--'))
  if (!filePath) err('缺少 JSON 文件路径')

  const absPath = filePath.startsWith('/') || /^[a-zA-Z]:/.test(filePath)
    ? filePath
    : join(projectRoot, filePath)
  const raw = JSON.parse(await readFile(absPath, 'utf-8'))
  const job = validate(raw)

  // 检查去重
  const existing = jobs.findAll({}).filter(j =>
    j.company === job.company && j.position === job.position && j.city === job.city
  )
  if (existing.length > 0 && !force) {
    info(`已存在同 (company, position, city) 的岗位，跳过:`)
    for (const j of existing) console.log('   ', j.id, '|', j.company, '|', j.position, '|', j.city, '| applied=' + j.applied)
    info(`如需覆盖请加 --force`)
    return
  }

  if (force && existing.length > 0) {
    job.id = existing[0].id
    const r = jobs.upsert(job)
    ok(`已覆盖更新: ${job.id}`)
    return r
  }

  const r = jobs.upsert(job)
  ok(`已插入: ${job.id}`)
  return r
}

async function cmdUpdate(args) {
  const id = args[0]
  if (!id) err('用法: update <id> [--field value …]')
  const existing = jobs.findById(id)
  if (!existing) err(`id 不存在: ${id}`)

  // 解析 --key value 对
  const patch = {}
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    const val = args[i + 1]
    if (val === undefined) err(`字段 ${key} 缺少值`)
    patch[key] = val
  }
  if (Object.keys(patch).length === 0) err('未传任何 --field value')

  // 用 partial 模式校验（允许只传部分字段）
  const validated = validate({ ...existing, ...patch }, { partial: true })
  // partial 把 id 也吃了，回填
  validated.id = existing.id

  const r = jobs.upsert(validated)
  ok(`已更新: ${existing.id}`)
  console.log('   更新字段:', Object.keys(patch).join(', '))
  return r
}

async function cmdDelete(args) {
  // 支持两种模式：<id> 或 --company X --position Y --city Z
  if (args[0] && !args[0].startsWith('--')) {
    const id = args[0]
    const ok = jobs.delete(id)
    if (!ok) err(`id 不存在: ${id}`)
    info(`已删除: ${id}`)
    return
  }
  // 按 company+position+city 删
  const kv = {}
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i].replace(/^--/, '')
    kv[k] = args[i + 1]
  }
  if (!kv.company || !kv.position || !kv.city) err('按公司删需要 --company --position --city')

  const all = jobs.findAll({}).filter(j =>
    j.company === kv.company && j.position === kv.position && j.city === kv.city
  )
  if (all.length === 0) err('未找到匹配岗位')
  for (const j of all) {
    jobs.delete(j.id)
    info(`已删除: ${j.id}`)
  }
}

async function cmdGet(args) {
  const id = args[0]
  if (!id) err('用法: get <id>')
  const j = jobs.findById(id)
  if (!j) err(`id 不存在: ${id}`)
  console.log(JSON.stringify(j, null, 2))
}

async function cmdList(args) {
  const opt = {}
  let limit = 20
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--keyword') opt.keyword = args[++i]
    else if (a === '--city') opt.city = [args[++i]]
    else if (a === '--category') opt.category = [args[++i]]
    else if (a === '--limit') limit = Number(args[++i])
  }
  const rows = jobs.findAll({ ...opt, limit })
  console.log(`共 ${rows.length} 条（limit=${limit}）`)
  for (const j of rows) {
    console.log(
      `  ${j.id}  |  ${j.company}  |  ${j.position}  |  ${j.city}  |  ${j.category}  |  applied=${j.applied}  |  verified=${j.verified}`
    )
  }
}

function cmdStats() {
  const s = jobs.stats()
  console.log(JSON.stringify(s, null, 2))
}

// ===== 入口 =====
const [, , sub, ...rest] = process.argv
try {
  switch (sub) {
    case 'insert': await cmdInsert(rest); break
    case 'update': await cmdUpdate(rest); break
    case 'delete': await cmdDelete(rest); break
    case 'get':    await cmdGet(rest); break
    case 'list':   await cmdList(rest); break
    case 'stats':  cmdStats(); break
    case undefined: case 'help': case '-h': case '--help':
      console.log(await readFile(fileURLToPath(import.meta.url), 'utf-8').then(s => s.split('\n').slice(0, 25).join('\n')))
      break
    default: err(`未知子命令: ${sub}\n可用: insert / update / delete / get / list / stats / help`)
  }
} catch (e) {
  err(e.message)
}

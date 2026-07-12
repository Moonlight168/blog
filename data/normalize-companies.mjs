/**
 * normalize-companies.mjs — 一次性修复 jobs 表里 company 字段的命名变体
 *
 * 规则依据：src/private/hires/offer/规范-公司名.md
 *   - 工商全称，字面一致
 *   - 去掉业务后缀（-总部 / -信息科 / -深圳 office 等）
 *   - 去掉括号差异（半角 → 全角或统一去掉）
 *   - 去掉地区变体（保留公司全称，城市走 city 字段）
 *
 * 用法：
 *   cd my-docs && node data/normalize-companies.mjs          # 实际执行
 *   cd my-docs && node data/normalize-companies.mjs --dry-run # 仅打印将变更的内容
 */

import { DatabaseSync } from 'node:sqlite'

const DB = 'F:/MyBlogSite/vuepress-theme-hope/my-docs/data/applications.db'
const DRY_RUN = process.argv.includes('--dry-run')

// 字面映射表（old → new），跟规范文档保持一致
const NORMALIZE = {
  // Aftership 系
  'Aftership · 深圳 office': 'Aftership',
  'Aftership · 远程岗': 'Aftership',

  // Insta360 系
  'Insta360 影石 · 深圳总部': 'Insta360 影石',

  // SmartX 系
  'SmartX · 深圳 office': 'SmartX',
  'SmartX · 远程/华南': 'SmartX',

  // 业务后缀统一去掉
  '信捷电气 · 华南': '信捷电气',
  '宇视科技华南分公司': '宇视科技',
  '佛山地铁集团': '佛山地铁集团有限公司',
  '佛山市中医院 · 信息科': '佛山市中医院',
  '佛山市公用事业控股有限公司信息部': '佛山市公用事业控股有限公司',
  '佛山市第一人民医院 · 信息中心': '佛山市第一人民医院',
  '佛山科学技术学院 · 网络信息中心': '佛山科学技术学院',
  '南方科技大学 · 网络信息中心': '南方科技大学',
  '广东省人民医院 · 信息中心': '广东省人民医院',
  '广东省广播电视网络股份有限公司佛山分公司': '广东省广播电视网络股份有限公司',
  '广州医科大学附属医院 · 信息科': '广州医科大学附属医院',
  '广州大学 · 网络信息中心': '广州大学',
  '中国电信广东分公司 / 天翼云': '中国电信广东分公司',
  '招商银行 · 招银网络科技': '招商银行股份有限公司',
  '深圳大学 · 网络信息中心': '深圳大学',
  '深圳市人民医院 · 信息中心': '深圳市人民医院',
  '深圳市建筑装饰集团': '深圳市建筑装饰集团有限公司',
  '正浩 EcoFlow · 深圳': '正浩 EcoFlow',
  '海浦蒙特 · 佛山': '海浦蒙特',
  '清远市人民医院 · 信息中心': '清远市人民医院',
  '清远市气象局 · 信息保障中心': '清远市气象局',
  '清远职业技术学院 · 网络中心': '清远职业技术学院',
  '美的集团旗下美擎科技': '美擎科技',
  '广电运通 (广州 AI 子公司)': '广电运通',
}

const db = new DatabaseSync(DB)

// 全表扫描，找出需要改的
const rows = db.prepare(`
  SELECT id, company, position, city, is_placeholder, source
  FROM jobs
  ORDER BY company, city, position
`).all()

const changes = []
for (const r of rows) {
  if (NORMALIZE[r.company]) {
    changes.push({
      id: r.id,
      oldCompany: r.company,
      newCompany: NORMALIZE[r.company],
      position: r.position,
      city: r.city,
    })
  }
}

console.log(`扫描到 ${changes.length} 条需要规范化的记录:\n`)
for (const c of changes) {
  console.log(`  [${c.id}] ${c.city} | ${c.position}`)
  console.log(`    - ${c.oldCompany}`)
  console.log(`    + ${c.newCompany}`)
}

if (changes.length === 0) {
  console.log('\n（无需修改）')
  process.exit(0)
}

if (DRY_RUN) {
  console.log('\n--dry-run 模式，未实际写入。')
  process.exit(0)
}

// 实际更新
const stmt = db.prepare('UPDATE jobs SET company = ?, updated_at = datetime(\'now\') WHERE id = ?')
let updated = 0
db.exec('BEGIN TRANSACTION')
try {
  for (const c of changes) {
    stmt.run(c.newCompany, c.id)
    updated++
  }
  db.exec('COMMIT')
} catch (e) {
  db.exec('ROLLBACK')
  throw e
}

console.log(`\n已更新 ${updated} 条记录。`)

// 校验：规范化后没有重复字面（按公司）
const after = db.prepare(`
  SELECT company, COUNT(*) AS n
  FROM jobs
  GROUP BY company
  ORDER BY n DESC, company
`).all()
console.log(`\n规范化后公司数: ${after.length}`)
const stillDup = after.filter(r => r.n > 1)
if (stillDup.length === 0) {
  console.log('✓ 无重复字面（合规）')
} else {
  console.log(`✗ 仍有 ${stillDup.length} 个公司出现多次（这些是岗位/城市不同，不是真重复）:`)
  for (const r of stillDup) {
    console.log(`  [${r.n}] ${r.company}`)
  }
}
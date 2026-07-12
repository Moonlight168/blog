#!/usr/bin/env node
/**
 * init-db.mjs — 读取 schema.sql 并创建空 SQLite 数据库
 *
 * 使用：
 *   npm run db:init          # 交互式（默认确认）
 *   node data/init-db.mjs --force  # 强制覆盖（跳过确认）
 *   node data/init-db.mjs --keep-backup  # 保留旧库备份（默认删除）
 */
import { readFile, writeFile, copyFile, unlink, stat } from 'node:fs/promises'
import { existsSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE = join(__dirname, 'applications.db')
const SCHEMA_FILE = join(__dirname, 'schema.sql')

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const KEEP_BACKUP = args.includes('--keep-backup')

console.log('[init-db] 启动')
console.log(`[init-db] DB 路径: ${DB_FILE}`)
console.log(`[init-db] Schema:  ${SCHEMA_FILE}`)

// 1. 检测旧库
const hadOldDb = existsSync(DB_FILE)
if (hadOldDb && !FORCE) {
  console.log('')
  console.log('[init-db] ⚠️  已存在旧库，将被覆盖')
  const rl = readline.createInterface({ input, output })
  const answer = await rl.question('[init-db] 确认覆盖？[y/N]: ')
  rl.close()
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('[init-db] 已取消')
    process.exit(0)
  }
}

// 2. 备份旧库（如存在）
if (hadOldDb) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const backup = `${DB_FILE}.bak.${ts}`
  await copyFile(DB_FILE, backup)
  console.log(`[init-db] 旧库已备份: ${backup}`)

  for (const ext of ['-wal', '-shm']) {
    const f = DB_FILE + ext
    if (existsSync(f)) {
      await unlink(f)
      console.log(`[init-db] 清理: ${f}`)
    }
  }
  await unlink(DB_FILE)
  console.log(`[init-db] 已删除旧库`)
}

// 3. 清理旧的备份文件（保留最近 3 份）
if (existsSync(__dirname)) {
  const bakFiles = readdirSync(__dirname)
    .filter(f => f.startsWith('applications.db.bak.'))
    .sort()
    .reverse()
  const toDelete = bakFiles.slice(3)
  for (const f of toDelete) {
    const full = join(__dirname, f)
    try {
      if (!KEEP_BACKUP) {
        unlinkSync(full)
        console.log(`[init-db] 删除旧备份: ${f}`)
      }
    } catch (e) {
      console.warn(`[init-db] 无法删除 ${f}: ${e.message}`)
    }
  }
  if (bakFiles.length > 3 && !KEEP_BACKUP) {
    console.log(`[init-db] 保留最近 3 份备份，删除 ${toDelete.length} 份`)
  }
}

// 4. 读 schema
const schemaSql = await readFile(SCHEMA_FILE, 'utf-8')

// 5. 建库并执行 schema
const db = new DatabaseSync(DB_FILE)
db.exec(schemaSql)

// 6. 验证表
const tables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
).all()

console.log(`[init-db] ✓ 已创建 ${tables.length} 张表:`)
for (const t of tables) console.log(`           - ${t.name}`)

// 7. 显示 meta
const meta = db.prepare('SELECT key, value FROM meta').all()
console.log(`[init-db] meta:`)
for (const m of meta) console.log(`           ${m.key} = ${m.value}`)

db.close()

console.log('')
console.log(`[init-db] ✓ 完成: ${DB_FILE}`)
console.log('[init-db] ⚠️  当前 DB 为空，需从外部导入数据（旧 JSON 或 fetch.mjs）')
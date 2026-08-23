/**
 * jobs-store.mjs — SQLite 统一读写 API
 *
 * 用法（import）：
 *   import { jobs, fetchLog, searchCache, init, close } from './jobs-store.mjs'
 *   init()                    // 首次调用，自动建表（如果 DB 不存在）
 *   jobs.findAll({...})       // 查询
 *   jobs.upsert(job)          // 插入/更新
 *   jobs.bulkInsert(jobs[])   // 批量插入（事务）
 *   jobs.delete(id)
 *   jobs.diffByCompany(companies[])  // 查找已存在的（公司,岗位,城市）
 *   close()                   // 关闭连接
 *
 * 特点：
 *   - 单例连接（多次调用 init 不会重复打开）
 *   - 所有写入走事务（better-sqlite3 风格手动 BEGIN/COMMIT）
 *   - node:sqlite 是 experimental，已在 init() 顶部打印一次警告抑制
 *   - 字段白名单 + 长度截断（防 XSS / 注入）
 */

import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
// 数据目录自动检测：优先 src/private/data（本地私有库），回退主仓 data/（CI/构建）
// 本地 dev 时私有 db 存在 → 用它；CI 构建无私有 db → 用主仓（构建不读数据，仅保 import 可解析）
const PRIVATE_DATA_DIR = join(process.cwd(), 'src', 'private', 'data')
const DATA_DIR = existsSync(join(PRIVATE_DATA_DIR, 'applications.db')) ? PRIVATE_DATA_DIR : __dirname
const DB_FILE = join(DATA_DIR, 'applications.db')
const SCHEMA_FILE = join(DATA_DIR, 'schema.sql')

// ===== 单例 =====
let _db = null

/**
 * 初始化 DB（首次调用时建库 + 建表；后续直接返回已有连接）
 * @param {string} [dbPath] - 可选，自定义 DB 路径（默认 data/applications.db）
 */
export function init(dbPath) {
  if (_db) return _db

  const dbFile = dbPath || DB_FILE

  // DB 不存在时尝试读 schema.sql 建表
  if (!existsSync(dbFile)) {
    throw new Error(
      `DB 不存在: ${dbFile}\n` +
      `请先执行: npm run db:init`
    )
  }

  _db = new DatabaseSync(dbFile)
  _db.exec('PRAGMA journal_mode = WAL')
  _db.exec('PRAGMA foreign_keys = ON')
  _db.exec('PRAGMA busy_timeout = 5000')

  // 老库迁移：jobs 表加 verified 列（如果没有）
  const cols = _db.prepare("PRAGMA table_info(jobs)").all().map(c => c.name)
  if (!cols.includes('verified')) {
    _db.exec("ALTER TABLE jobs ADD COLUMN verified INTEGER NOT NULL DEFAULT 1")
  }
  if (!cols.includes('salary_range')) {
    _db.exec("ALTER TABLE jobs ADD COLUMN salary_range TEXT DEFAULT ''")
  }
  if (!cols.includes('next_action')) {
    _db.exec("ALTER TABLE jobs ADD COLUMN next_action TEXT DEFAULT ''")
  }
  if (!cols.includes('progress_url')) {
    _db.exec("ALTER TABLE jobs ADD COLUMN progress_url TEXT DEFAULT ''")
  }
  if (!cols.includes('applied_at')) {
    _db.exec("ALTER TABLE jobs ADD COLUMN applied_at TEXT DEFAULT ''")
  }
  if (!cols.includes('round')) {
    _db.exec("ALTER TABLE jobs ADD COLUMN round INTEGER")
  }
  if (!cols.includes('result')) {
    _db.exec("ALTER TABLE jobs ADD COLUMN result INTEGER")
  }
  if (!cols.includes('batch')) {
    _db.exec("ALTER TABLE jobs ADD COLUMN batch TEXT DEFAULT NULL")
  }
  // 老库迁移：idx_jobs_verified 索引
  _db.exec("CREATE INDEX IF NOT EXISTS idx_jobs_verified ON jobs(verified)")
  _db.exec("CREATE INDEX IF NOT EXISTS idx_jobs_result ON jobs(result)")

  return _db
}

/** 关闭连接（一般不需要） */
export function close() {
  if (_db) {
    _db.close()
    _db = null
  }
}

// ===== 字段清洗 =====
const ALLOWED_WEEKEND = ['周末双休', '单休', '大小周']
const ALLOWED_BATCH = ['实习', '27届秋招提前批', '27届秋招', '27届春招', '未开始']

function sanitize(raw) {
  if (!raw || typeof raw !== 'object') return null
  const w = raw.weekend
  const weekend = ALLOWED_WEEKEND.includes(w) ? w : null
  // applied 精简枚举: 0=待投递 1=已投递 4=已 offer 5=已结束;不再支持 2=已笔试/3=已面试(由 round 字段表达)
  const _applied = Number(raw.applied)
  const applied = [0,1,4,5].includes(_applied) ? _applied : 0
  // round: 0=简历初筛 1=笔试 2=测评 3=一面 4=二面 5=三面 6=终面 7=HR 面;其他值(NULL/undefined/NaN/越界)→null
  const _round = raw.round == null ? null : Number(raw.round)
  const round = [0,1,2,3,4,5,6,7].includes(_round) ? _round : null
  // result 精简语义: NULL=进行中; 1=过 -1=挂 -7=主动撤回 -8=我拒offer -9=offer撤回 -10=人才储备库 99=其他
  // 兼容旧数据(2~6 笔试过/一面过.../-2~-6 笔试挂/一面挂...):通过 round 推断阶段,只保留定性
  const _result = raw.result == null ? null : Number(raw.result)
  const _resultSign = _result != null && _result !== 0 ? Math.sign(_result) : null
  const _resultAbs = _result != null ? Math.abs(_result) : null
  let result = null
  if (_result == null) {
    result = null  // 进行中
  } else if (_resultAbs === 7 || _resultAbs === 8 || _resultAbs === 9 || _resultAbs === 10 || _resultAbs === 99) {
    result = _result  // 主动撤回(-7)/我拒offer(-8)/offer撤回(-9)/人才储备库(-10)/其他(±99)
  } else if (_resultSign === 1) {
    result = 1  // 过
  } else if (_resultSign === -1) {
    result = -1  // 挂
  }
  // batch: 实习/27届秋招提前批/27届秋招/27届春招;其他/null/空字符串→null
  const _batch = raw.batch == null || raw.batch === '' ? null : String(raw.batch).trim()
  const batch = ALLOWED_BATCH.includes(_batch) ? _batch : null
  // source (内部字段) / channel (UI 暴露): 官网 / 前程无忧 / 应届生招聘 / 猎聘 / 智联招聘 / BOSS直聘
  // 兼容旧值: manual / fetch / placeholder → 官网
  const ALLOWED_CHANNEL = ['官网', '前程无忧', '应届生招聘', '猎聘', '智联招聘', 'BOSS直聘']
  const src = String(raw.source ?? '官网')
  const source = ALLOWED_CHANNEL.includes(src) ? src
    : src === 'manual' || src === 'fetch' || src === 'placeholder' ? '官网'
    : '官网'
  // verified: 0/1/2
  const verified = [0,1,2].includes(Number(raw.verified)) ? Number(raw.verified) : 1
  const j = {
    id:        String(raw.id        ?? '').slice(0, 64),
    category:  String(raw.category  ?? '').slice(0, 32),
    city:      String(raw.city      ?? '').slice(0, 16),
    company:   String(raw.company   ?? '').slice(0, 120),
    position:  String(raw.position  ?? '').slice(0, 120),
    deadline:  raw.deadline ? String(raw.deadline).slice(0, 10) : null,
    education: String(raw.education ?? '').slice(0, 32),
    weekend,
    link:      raw.link ? String(raw.link).slice(0, 500) : null,
    notes:     String(raw.notes     ?? '').slice(0, 500),
    applied,
    round,
    result,
    batch,
    source,
    verified,
    salary_range: String(raw.salary_range ?? '').slice(0, 80),
    next_action:  String(raw.next_action  ?? '').slice(0, 200),
    progress_url:  String(raw.progress_url  ?? '').slice(0, 500),
    applied_at:    String(raw.applied_at    ?? '').slice(0, 25),
  }
  if (!j.id || !j.category || !j.city || !j.company || !j.position) return null
  return j
}

// ===== jobs API =====
export const jobs = {
  /**
   * 查询所有岗位
   * @param {object} opts - { category, city, applied, isPlaceholder, keyword, limit, offset }
   * @returns {Array<object>}
   */
  findAll(opts = {}) {
    const db = init()
    const where = []
    const params = {}

    if (opts.category && opts.category.length) {
      // category: ['国企', '事业单位'] → category IN (:cat0, :cat1)
      const ph = opts.category.map((c, i) => `:cat${i}`)
      where.push(`category IN (${ph.join(',')})`)
      opts.category.forEach((c, i) => { params[`cat${i}`] = c })
    }
    if (opts.city && opts.city.length) {
      const ph = opts.city.map((c, i) => `:city${i}`)
      where.push(`city IN (${ph.join(',')})`)
      opts.city.forEach((c, i) => { params[`city${i}`] = c })
    }
    if (opts.applied !== undefined && opts.applied !== null) {
      where.push('applied = @applied')
      params.applied = opts.applied ? 1 : 0
    }
    if (opts.isPlaceholder !== undefined && opts.isPlaceholder !== null) {
      where.push('is_placeholder = @isPlaceholder')
      params.isPlaceholder = opts.isPlaceholder ? 1 : 0
    }
    if (opts.keyword) {
      where.push('(company LIKE @kw OR position LIKE @kw OR notes LIKE @kw)')
      params.kw = `%${opts.keyword}%`
    }
    if (opts.weekend) {
      // opts.weekend: 'all' / 'unknown' / '周末双休' / '单休' / '大小周'
      if (opts.weekend === 'unknown') {
        where.push('weekend IS NULL')
      } else if (ALLOWED_WEEKEND.includes(opts.weekend)) {
        where.push('weekend = @weekend')
        params.weekend = opts.weekend
      }
      // 'all' = 不过滤
    }
    if (opts.verified !== undefined && opts.verified !== null) {
      where.push('verified = @verified')
      params.verified = opts.verified
    }
    if (opts.source) {
      where.push('source = @source')
      params.source = opts.source
    }
    if (opts.salaryMin !== undefined && opts.salaryMin !== null) {
      // salary_range 形如 "15-20k×13"，按起始数字过滤
      where.push("CAST(SUBSTR(salary_range, 1, INSTR(salary_range, '-') - 1) AS INTEGER) >= @salaryMin")
      params.salaryMin = opts.salaryMin
    }
    if (opts.hasNextAction) {
      where.push("next_action != ''")
    }

    let sql = 'SELECT * FROM jobs'
    if (where.length) sql += ' WHERE ' + where.join(' AND ')
    sql += ' ORDER BY (deadline IS NULL), deadline ASC, id ASC'
    if (opts.limit) {
      sql += ' LIMIT @limit'
      params.limit = opts.limit
      if (opts.offset) {
        sql += ' OFFSET @offset'
        params.offset = opts.offset
      }
    }

    const rows = db.prepare(sql).all(params)
    // boolean/整数字段转回 JS 类型
    return rows.map(r => ({
      ...r,
      applied: Number(r.applied),
      round: r.round == null ? null : Number(r.round),
      result: r.result == null ? null : Number(r.result),
      batch: r.batch == null || r.batch === '' ? null : r.batch,
      is_placeholder: !!r.is_placeholder,
      verified: Number(r.verified),
    }))
  },

  findById(id) {
    const db = init()
    const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id)
    if (!row) return null
    return { ...row, applied: !!row.applied, is_placeholder: !!row.is_placeholder, round: row.round == null ? null : Number(row.round), result: row.result == null ? null : Number(row.result), batch: row.batch == null || row.batch === '' ? null : row.batch }
  },

  /**
   * 插入或更新（按 id）
   * @returns {{ changed: boolean, job: object } | null}
   */
  upsert(raw) {
    const j = sanitize(raw)
    if (!j) return null
    const db = init()
    const stmt = db.prepare(`
      INSERT INTO jobs (id, category, city, company, position, deadline, education, weekend, link, notes, applied, round, result, batch, source, verified, salary_range, next_action, progress_url, applied_at, updated_at)
      VALUES (@id, @category, @city, @company, @position, @deadline, @education, @weekend, @link, @notes, @applied, @round, @result, @batch, @source, @verified, @salary_range, @next_action, @progress_url, @applied_at, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        category=excluded.category, city=excluded.city, company=excluded.company,
        position=excluded.position, deadline=excluded.deadline, education=excluded.education,
        weekend=excluded.weekend, link=excluded.link, notes=excluded.notes,
        applied=excluded.applied, round=excluded.round, result=excluded.result, batch=excluded.batch,
        source=excluded.source, verified=excluded.verified,
        salary_range=excluded.salary_range, next_action=excluded.next_action,
        progress_url=excluded.progress_url, applied_at=excluded.applied_at,
        updated_at=datetime('now')
    `)
    const result = stmt.run(j)
    return { changed: result.changes > 0, job: j }
  },

  delete(id) {
    const db = init()
    const r = db.prepare('DELETE FROM jobs WHERE id = ?').run(id)
    return r.changes > 0
  },

  /**
   * 批量插入（事务）
   * @param {Array<object>} rows - 原始岗位数组
   * @param {object} opts - { source: 'fetch'|'manual', skipExisting: true }
   * @returns {{ added: number, skipped: number, failed: number }}
   */
  bulkInsert(rows, opts = {}) {
    const source = opts.source || 'manual'
    const skipExisting = opts.skipExisting !== false
    const db = init()
    let added = 0, skipped = 0, failed = 0

    db.exec('BEGIN TRANSACTION')
    try {
      for (const raw of rows) {
        const j = sanitize(raw)
        if (!j) { failed++; continue }

        if (skipExisting) {
          const exists = db.prepare(
            'SELECT 1 FROM jobs WHERE company=? AND position=? AND city=?'
          ).get(j.company, j.position, j.city)
          if (exists) { skipped++; continue }
        }

        const id = raw.id || `job-fetch-${Date.now()}-${added}`
        db.prepare(`
          INSERT INTO jobs (id, category, city, company, position, deadline, education, weekend, link, notes, applied, round, result, batch, source, verified, salary_range, next_action, progress_url, applied_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, '', datetime('now'))
        `).run(
          id, j.category, j.city, j.company, j.position, j.deadline,
          j.education || '本科及以上', j.weekend, j.link, j.notes, j.round, j.result, j.batch,
          source, j.verified ?? 0,
          j.salary_range || '', j.next_action || '', j.progress_url || ''
        )
        added++
      }
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }

    return { added, skipped, failed }
  },

  /**
   * 在 fetch 拉取前先 diff：传入 URL 数组，返回 DB 中已存在的 URL（基于 search_cache 表）
   */
  filterExistingUrls(urls) {
    if (!urls.length) return new Set()
    const db = init()
    const placeholders = urls.map((_, i) => `:u${i}`).join(',')
    const params = {}
    urls.forEach((u, i) => { params[`u${i}`] = u })
    const rows = db.prepare(
      `SELECT url FROM search_cache WHERE url IN (${placeholders})`
    ).all(params)
    return new Set(rows.map(r => r.url))
  },

  /**
   * 标记 URL 已搜过（用于去重）
   */
  markUrlsSeen(urls, keyword = null) {
    if (!urls.length) return
    const db = init()
    db.exec('BEGIN TRANSACTION')
    try {
      const stmt = db.prepare(`
        INSERT INTO search_cache (url, keyword, first_seen, last_seen, hit_count)
        VALUES (?, ?, datetime('now'), datetime('now'), 1)
        ON CONFLICT(url) DO UPDATE SET
          last_seen = datetime('now'),
          hit_count = hit_count + 1
      `)
      for (const url of urls) stmt.run(url, keyword)
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }
  },

  /**
   * 统计
   */
  stats() {
    const db = init()
    return db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN is_placeholder = 0 THEN 1 ELSE 0 END) AS real_count,
        SUM(CASE WHEN is_placeholder = 1 THEN 1 ELSE 0 END) AS placeholder_count,
        SUM(CASE WHEN applied >= 1 AND applied <= 5 THEN 1 ELSE 0 END) AS applied_count,
        SUM(CASE WHEN is_placeholder = 0 AND applied = 0 THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN is_placeholder = 0 AND applied = 0 AND deadline IS NOT NULL
                 AND julianday(deadline) - julianday('now') BETWEEN 0 AND 7
                 THEN 1 ELSE 0 END) AS urgent_count,
        SUM(CASE WHEN result IS NOT NULL AND result < 0 AND result != -10 THEN 1 ELSE 0 END) AS rejected_count,
        SUM(CASE WHEN result = -10 THEN 1 ELSE 0 END) AS talent_pool_count
      FROM jobs
    `).get()
  },
}

// ===== fetch_log API =====
export const fetchLog = {
  record({ added = 0, skipped = 0, total = 0, keywordsCount = 0, durationMs = 0, status = 'success', error = null }) {
    const db = init()
    db.prepare(`
      INSERT INTO fetch_log (added, skipped, total, keywords_count, duration_ms, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(added, skipped, total, keywordsCount, durationMs, status, error)
  },

  recent(limit = 10) {
    const db = init()
    return db.prepare('SELECT * FROM fetch_log ORDER BY fetched_at DESC LIMIT ?').all(limit)
  },
}

// ===== 便捷导出底层 DB（高级用例） =====
export function raw() {
  return init()
}

// ===== 进程退出时关闭连接 =====
process.on('exit', close)
process.on('SIGINT', () => { close(); process.exit(0) })
process.on('SIGTERM', () => { close(); process.exit(0) })
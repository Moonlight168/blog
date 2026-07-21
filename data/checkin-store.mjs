/**
 * checkin-store.mjs — 秋招每日打卡 SQLite API
 *
 * 复用 jobs-store 的同一个 applications.db 连接（raw()）。
 * 因为 DB 已存在、schema.sql 不会重跑，建表 + 默认模板 seed 都在这里做（幂等）。
 *
 * 导出 checkin：
 *   getDay(date)        当天各模板段 + 临时任务 + done 状态
 *   toggle({date, slotId, logId})  切换某段/某任务 done
 *   heatmap(from, to)   每天完成率
 *   getTemplate()       固定作息模板
 *   setTemplate(rows)   覆盖模板
 *   addTask({date, title})     加临时任务
 *   deleteTask(logId)   删临时任务
 */

import { raw } from './jobs-store.mjs'

// 默认作息模板（首次建表时 seed，之后用户可改）
const DEFAULT_TEMPLATE = [
  { time_range: '20:00-20:15', title: '网申投递（中小厂为主 + 央国企捎带）+ 刷公告' },
  { time_range: '20:15-21:05', title: '算法题专项（LeetCode 按专题）' },
  { time_range: '21:15-22:05', title: '技术八股' },
  { time_range: '22:15-22:40', title: '行测刷题｜项目复盘/手撕代码' },
  { time_range: '22:40-22:50', title: '当日复盘 + 明日待办' },
]

let _ready = false

function db() {
  const d = raw()
  if (!_ready) {
    d.exec(`
      CREATE TABLE IF NOT EXISTS checkin_template (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time_range TEXT NOT NULL,
        title TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS checkin_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        slot_id INTEGER,
        title TEXT,
        done INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_checkin_log_date ON checkin_log(date);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_checkin_slot ON checkin_log(date, slot_id) WHERE slot_id IS NOT NULL;
    `)
    // 模板为空 → seed 默认
    const n = d.prepare('SELECT COUNT(*) AS c FROM checkin_template').get().c
    if (!n) {
      const stmt = d.prepare('INSERT INTO checkin_template (time_range, title, sort_order) VALUES (?, ?, ?)')
      DEFAULT_TEMPLATE.forEach((t, i) => stmt.run(t.time_range, t.title, i))
    }
    _ready = true
  }
  return d
}

// YYYY-MM-DD 校验，防注入 + 脏数据
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)

export const checkin = {
  getTemplate() {
    return db().prepare('SELECT * FROM checkin_template ORDER BY sort_order, id').all()
  },

  /** 覆盖整个模板（先清空再插入） */
  setTemplate(rows) {
    if (!Array.isArray(rows)) throw new Error('rows 必须是数组')
    const d = db()
    d.exec('BEGIN TRANSACTION')
    try {
      d.exec('DELETE FROM checkin_template')
      const stmt = d.prepare('INSERT INTO checkin_template (time_range, title, sort_order) VALUES (?, ?, ?)')
      rows.forEach((r, i) => {
        const tr = String(r.time_range ?? '').slice(0, 20)
        const title = String(r.title ?? '').slice(0, 120)
        if (tr && title) stmt.run(tr, title, i)
      })
      d.exec('COMMIT')
    } catch (e) {
      d.exec('ROLLBACK')
      throw e
    }
    return this.getTemplate()
  },

  /** 当天：模板段（左连 log 取 done）+ 临时任务 */
  getDay(date) {
    if (!isDate(date)) throw new Error('date 需为 YYYY-MM-DD')
    const d = db()
    const slots = d.prepare(`
      SELECT t.id AS slot_id, t.time_range,
             COALESCE(l.title, t.title) AS title,
             t.title AS template_title,
             COALESCE(l.done, 0) AS done, l.id AS log_id
      FROM checkin_template t
      LEFT JOIN checkin_log l ON l.slot_id = t.id AND l.date = @date
      ORDER BY t.sort_order, t.id
    `).all({ date }).map(r => ({ ...r, done: !!r.done }))
    const tasks = d.prepare(`
      SELECT id AS log_id, title, done FROM checkin_log
      WHERE date = @date AND slot_id IS NULL ORDER BY id
    `).all({ date }).map(r => ({ ...r, done: !!r.done, slot_id: null }))
    return { date, slots, tasks }
  },

  /** 切换 done：模板段用 (date, slotId) upsert；临时任务用 logId */
  toggle({ date, slotId, logId }) {
    const d = db()
    if (logId != null) {
      d.prepare('UPDATE checkin_log SET done = 1 - done WHERE id = ?').run(logId)
      return true
    }
    if (!isDate(date) || slotId == null) throw new Error('缺少 date/slotId')
    const existing = d.prepare('SELECT id, done FROM checkin_log WHERE date = ? AND slot_id = ?').get(date, slotId)
    if (existing) {
      d.prepare('UPDATE checkin_log SET done = 1 - done WHERE id = ?').run(existing.id)
    } else {
      d.prepare('INSERT INTO checkin_log (date, slot_id, done) VALUES (?, ?, 1)').run(date, slotId)
    }
    return true
  },

  /** 当日覆盖某固定段标题（只影响这一天；title 为空则清除覆盖，恢复模板标题） */
  setSlotTitle({ date, slotId, title }) {
    if (!isDate(date) || slotId == null) throw new Error('缺少 date/slotId')
    const d = db()
    const t = String(title ?? '').slice(0, 120).trim()
    const existing = d.prepare('SELECT id FROM checkin_log WHERE date = ? AND slot_id = ?').get(date, slotId)
    if (existing) {
      d.prepare('UPDATE checkin_log SET title = ? WHERE id = ?').run(t || null, existing.id)
    } else if (t) {
      d.prepare('INSERT INTO checkin_log (date, slot_id, title, done) VALUES (?, ?, ?, 0)').run(date, slotId, t)
    }
    return true
  },

  addTask({ date, title }) {
    if (!isDate(date)) throw new Error('date 需为 YYYY-MM-DD')
    const t = String(title ?? '').slice(0, 120)
    if (!t) throw new Error('title 必填')
    const info = db().prepare('INSERT INTO checkin_log (date, slot_id, title, done) VALUES (?, NULL, ?, 0)').run(date, t)
    return { logId: Number(info.lastInsertRowid), title: t, done: false, slot_id: null }
  },

  deleteTask(logId) {
    if (logId == null) throw new Error('logId 必填')
    return db().prepare('DELETE FROM checkin_log WHERE id = ? AND slot_id IS NULL').run(logId).changes > 0
  },

  /** 每天完成率：done 数 / 当天应做数（模板段数 + 当天临时任务数） */
  heatmap(from, to) {
    if (!isDate(from) || !isDate(to)) throw new Error('from/to 需为 YYYY-MM-DD')
    const d = db()
    const slotCount = d.prepare("SELECT COUNT(*) AS c FROM checkin_template WHERE title NOT LIKE '[休息]%'").get().c
    // 每天：done 总数，以及当天临时任务总数（模板段固定 slotCount 个）
    const rows = d.prepare(`
      SELECT date,
             SUM(done) AS done_count,
             SUM(CASE WHEN slot_id IS NULL THEN 1 ELSE 0 END) AS task_count
      FROM checkin_log
      WHERE date BETWEEN @from AND @to
      GROUP BY date
    `).all({ from, to })
    return rows.map(r => {
      const total = slotCount + Number(r.task_count)
      return {
        date: r.date,
        done: Number(r.done_count),
        total,
        rate: total ? Number(r.done_count) / total : 0,
      }
    })
  },
}

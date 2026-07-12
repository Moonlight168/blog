-- ============================================================
--  Offer 投递管理系统 — SQLite 表结构
--  日期: 2026-07-11
--  说明: 纯结构，无数据；执行 init-db.mjs 创建空库
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;          -- 提升并发读写性能
PRAGMA synchronous = NORMAL;        -- 写入性能 vs 安全的折中
PRAGMA busy_timeout = 5000;         -- 5s 锁等待
PRAGMA encoding = 'UTF-8';

-- ------------------------------------------------------------
--  岗位主表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id              TEXT PRIMARY KEY,                -- 'job-001' 或 'job-fetch-{ts}-{n}'
  category        TEXT NOT NULL,                   -- 中小厂 / 国企 / 事业单位 / 公务员 / 小而美企业
  city            TEXT NOT NULL,                   -- 广州市 / 深圳市 / 佛山市 / 清远市 / 跨地市
  company         TEXT NOT NULL,
  position        TEXT NOT NULL,
  deadline        TEXT,                            -- YYYY-MM-DD 或 NULL
  education       TEXT,                            -- 不限 / 专科 / 本科 / 本科及以上 / 硕士 / 博士
  weekend         TEXT,                            -- 周末双休 / 单休 / 大小周 / NULL (未知)
  link            TEXT,
  notes           TEXT DEFAULT '',
  applied         INTEGER NOT NULL DEFAULT 0,     -- 0=待投递 1=已投递 2=已笔试 3=已面试 4=已 offer 5=已拒
  is_placeholder  INTEGER NOT NULL DEFAULT 0,     -- 1 = 占位条目（_待补充）
  source          TEXT NOT NULL DEFAULT 'manual', -- manual / fetch / placeholder
  verified        INTEGER NOT NULL DEFAULT 0,     -- 0=待验证 1=已验证 2=失效
  salary_range    TEXT DEFAULT '',                -- 薪资范围,如 "15-20k×13" 或 "面议"
  next_action     TEXT DEFAULT '',                -- 下一步动作,如 "7/20 笔试"、"等 HR 联系"
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),

  -- 唯一约束：公司 + 岗位 + 城市 天然去重
  UNIQUE(company, position, city)
);

-- 老库迁移：加 verified 列（如果还没）
-- (放到 PRAGMA 后面)

CREATE INDEX IF NOT EXISTS idx_jobs_category       ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_city           ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline      ON jobs(deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_applied       ON jobs(applied);
CREATE INDEX IF NOT EXISTS idx_jobs_placeholder   ON jobs(is_placeholder);
CREATE INDEX IF NOT EXISTS idx_jobs_source        ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_updated_at    ON jobs(updated_at);
CREATE INDEX IF NOT EXISTS idx_jobs_weekend       ON jobs(weekend);
CREATE INDEX IF NOT EXISTS idx_jobs_verified      ON jobs(verified);

-- ------------------------------------------------------------
--  拉取日志（每次 fetch.mjs 执行追加 1 行）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fetch_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  fetched_at      TEXT NOT NULL DEFAULT (datetime('now')),
  added           INTEGER NOT NULL DEFAULT 0,
  skipped         INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL DEFAULT 0,
  keywords_count  INTEGER NOT NULL DEFAULT 0,
  duration_ms     INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'success', -- success / partial / failed / dry-run
  error_message   TEXT
);

CREATE INDEX IF NOT EXISTS idx_fetch_log_at ON fetch_log(fetched_at);

-- ------------------------------------------------------------
--  搜索缓存（避免对相同 URL 重复消耗 mmx API）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS search_cache (
  url             TEXT PRIMARY KEY,
  first_seen      TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen       TEXT NOT NULL DEFAULT (datetime('now')),
  hit_count       INTEGER NOT NULL DEFAULT 1,
  keyword         TEXT                              -- 第一次搜到这个 URL 的关键词
);

CREATE INDEX IF NOT EXISTS idx_search_cache_last_seen ON search_cache(last_seen);

-- ------------------------------------------------------------
--  元信息表（记录 schema 版本、最后执行时间等）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta (
  key             TEXT PRIMARY KEY,
  value           TEXT,
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO meta(key, value) VALUES ('schema_version', '2');
INSERT OR IGNORE INTO meta(key, value) VALUES ('created_at', datetime('now'));
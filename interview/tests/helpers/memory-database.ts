/** HTTP 回归的数据库边界桩：只返回测试给定的数据，不打开或执行任何 SQLite。 */
export interface StatementStub {
  get?: (...args: unknown[]) => unknown;
  all?: (...args: unknown[]) => unknown[];
  run?: (...args: unknown[]) => unknown;
}

export class DatabaseSync {
  static statement: (sql: string) => StatementStub = (sql) => {
    throw new Error(`测试未提供数据库结果：${sql}`);
  };

  exec(sql: string): void {
    // 启动时的 schema 和事务在此边界停止，不调用数据库驱动。
    if (!/^\s*(PRAGMA|ALTER TABLE|CREATE UNIQUE INDEX|BEGIN|COMMIT|ROLLBACK)/.test(sql)) {
      throw new Error(`测试未支持的数据库操作：${sql}`);
    }
  }

  prepare(sql: string): StatementStub {
    if (sql.startsWith("PRAGMA table_info")) return { all: () => [] };
    return DatabaseSync.statement(sql);
  }
}

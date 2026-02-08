declare module "sql.js" {
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  interface QueryResults {
    columns: string[];
    values: any[][];
  }

  interface Statement {
    bind(params?: any[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, any>;
    free(): boolean;
    reset(): void;
    run(params?: any[]): void;
  }

  interface Database {
    run(sql: string, params?: any[]): Database;
    exec(sql: string): QueryResults[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export type { Database, QueryResults, Statement, SqlJsStatic };
  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
}

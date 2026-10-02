
// A single global connection: convenient, and exactly what prevents swapping it in tests.
// region: Database.instance
class Database {
  private static _instance?: Connection
  static instance() { return (this._instance ??= PG.connect(process.env.DATABASE_URL!)) }
}
// endregion

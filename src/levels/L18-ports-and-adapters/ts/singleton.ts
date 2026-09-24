
// Una conexión global única: cómoda, y justo lo que impide cambiarla en las pruebas.
// region: Database.instance
class Database {
  private static _instance?: Connection
  static instance() { return (this._instance ??= PG.connect(process.env.DATABASE_URL!)) }
}
// endregion

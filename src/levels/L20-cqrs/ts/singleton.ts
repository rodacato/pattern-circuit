
// Una sola instancia compartida del almacén… con la misma fila de siempre.
// region: OrderStore.instance
class SharedOrderStore {
  private static _instance?: OrderStore
  static instance() { return (this._instance ??= new OrderStore()) }
}
// endregion


// A single shared instance of the store… with the same old queue.
// region: OrderStore.instance
class SharedOrderStore {
  private static _instance?: OrderStore
  static instance() { return (this._instance ??= new OrderStore()) }
}
// endregion

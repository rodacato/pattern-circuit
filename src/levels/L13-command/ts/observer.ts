
// Avisar al barista de la cancelación… que la interpreta como un pedido más.
// region: CancelBroadcast
class CancelBroadcast {
  constructor(private subscribers: Barista[]) {}
  call(request: OrderRequest) { this.subscribers.forEach((s) => s.prepare(request.drink)) }
}
// endregion

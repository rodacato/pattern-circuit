
// Notify the barista of the cancellation… who treats it as just another order.
// region: CancelBroadcast
class CancelBroadcast {
  constructor(private subscribers: Barista[]) {}
  call(request: OrderRequest) { this.subscribers.forEach((s) => s.prepare(request.drink)) }
}
// endregion

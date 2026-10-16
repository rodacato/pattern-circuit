
// Notify those interested of the failure… they find out, but nobody refunds the money.
// region: OrderFailedNotifier
class OrderFailedNotifier {
  private subscribers: { orderFailed(order: Order): void }[] = []
  notify(order: Order) { this.subscribers.forEach((s) => s.orderFailed(order)) }
}
// endregion

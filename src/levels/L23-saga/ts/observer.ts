
// Avisar del fallo a los interesados… que se enteran, pero nadie devuelve el dinero.
// region: OrderFailedNotifier
class OrderFailedNotifier {
  private subscribers: { orderFailed(order: Order): void }[] = []
  notify(order: Order) { this.subscribers.forEach((s) => s.orderFailed(order)) }
}
// endregion

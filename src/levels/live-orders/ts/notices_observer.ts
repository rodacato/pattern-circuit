class OrderUpdates {
  private subscribers: Subscriber[] = []

  // Anyone can subscribe; the updates don't know who they are.
  subscribe(subscriber: Subscriber) { this.subscribers.push(subscriber) }

  // region: OrderUpdates#publish
  publish(order: Order) { this.subscribers.forEach((s) => s.update(order)) }
  // endregion
}

// region: wiring
const updates = new OrderUpdates()
;[new Display(), new PushNotifier(), new LoyaltyProgram()].forEach((s) => updates.subscribe(s))
// endregion

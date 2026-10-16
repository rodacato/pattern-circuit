class Order {
  private status = 'pending'
  private subscribers: Subscriber[] = []

  // Anyone can subscribe; Order doesn't know who they are.
  subscribe(subscriber: Subscriber) { this.subscribers.push(subscriber) }

  // region: Order#complete!
  complete() {
    this.status = 'ready'
    this.subscribers.forEach((s) => s.update(this))
  }
  // endregion
}

// region: wiring
const order = new Order()
;[new Display(), new PushNotifier(), new LoyaltyProgram()].forEach((s) => order.subscribe(s))
// endregion

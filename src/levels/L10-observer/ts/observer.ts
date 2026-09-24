class Order {
  private status = 'pendiente'
  private subscribers: Subscriber[] = []

  // Cualquiera se suscribe; Order no sabe quiénes son.
  subscribe(subscriber: Subscriber) { this.subscribers.push(subscriber) }

  // region: Order#complete!
  complete() {
    this.status = 'listo'
    this.subscribers.forEach((s) => s.update(this))
  }
  // endregion
}

// region: wiring
const order = new Order()
;[new Display(), new PushNotifier(), new LoyaltyProgram()].forEach((s) => order.subscribe(s))
// endregion

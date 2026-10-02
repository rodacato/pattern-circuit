// Each producer is a subject with its own list of subscribers… and the lists do not match.
class Orders {
  private subscribers: Subscriber[] = []

  // region: Orders#place
  place(order: Event) { this.subscribers.forEach((s) => s.onEvent(order)) } // Inventory, Billing, Loyalty
  // endregion
}

class Returns {
  private subscribers: Subscriber[] = []

  // region: Returns#process
  process(returnRequest: Event) { this.subscribers.forEach((s) => s.onEvent(returnRequest)) } // only Inventory
  // endregion
}

// Los productores publican en el bus; los consumidores se suscriben al bus. Nadie se conoce.
class EventBus {
  private subscribers: Subscriber[] = []

  // region: EventBus#publish
  publish(event: Event) { this.subscribers.forEach((s) => s.onEvent(event)) }
  // endregion

  subscribe(subscriber: Subscriber) { this.subscribers.push(subscriber) }
}

class Orders {
  constructor(private bus: EventBus) {}

  // region: Orders#place
  place(order: Event) { this.bus.publish(order) }
  // endregion
}

class Returns {
  constructor(private bus: EventBus) {}

  // region: Returns#process
  process(returnRequest: Event) { this.bus.publish(returnRequest) }
  // endregion
}

// region: wiring
const bus = new EventBus()
for (const s of [new Inventory(), new Billing(), new Loyalty(), new Analytics()]) bus.subscribe(s) // ← un suscriptor más, nada más
// endregion

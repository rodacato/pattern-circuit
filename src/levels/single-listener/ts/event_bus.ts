// A bus for a single subscriber: to know what happens after charging you have to look up who subscribed.
type Handler = (payload: Order) => void

class EventBus {
  private handlers = new Map<string, Handler[]>()
  subscribe(event: string, handler: Handler) { this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]) }

  // region: EventBus#publish
  publish(event: string, payload: Order) { (this.handlers.get(event) ?? []).forEach((h) => h(payload)) }
  // endregion
}

class Cashier {
  constructor(private bus: EventBus) {}

  // region: Cashier#charge
  charge(order: Order) {
    CardTerminal.charge(order)
    this.bus.publish('order_paid', order)
  }
  // endregion
}

// region: wiring
const bus = new EventBus()
const kitchen = new Kitchen(new Counter())
bus.subscribe('order_paid', (order) => kitchen.start(order))
new OrderTaker(new Cashier(bus)).take('latte')
// endregion

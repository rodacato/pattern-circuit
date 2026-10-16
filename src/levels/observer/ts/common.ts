// --- those interested in knowing an order is ready ---
interface Subscriber {
  update(order: Order): void
}

class Display implements Subscriber {
  // region: Display#update
  update(order: Order) { console.log(`Ticket ${order.ticket} ready`) }
  // endregion
}

class PushNotifier implements Subscriber {
  // region: PushNotifier#update
  update(order: Order) { Push.send(order.customer, 'Your coffee is ready!') }
  // endregion
}

class LoyaltyProgram implements Subscriber {
  // region: LoyaltyProgram#update
  update(order: Order) { order.customer.addPoints(10) }
  // endregion
}

class Kitchen implements Subscriber {
  // region: Kitchen#update
  update(order: Order) { Stock.consume(order.items) }
  // endregion
}

class Barista {
  // region: Barista#prepare
  prepare(order: Order) { order.complete() }
  // endregion
}

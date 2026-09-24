// --- los interesados en saber que un pedido está listo ---
interface Subscriber {
  update(order: Order): void
}

class Display implements Subscriber {
  // region: Display#update
  update(order: Order) { console.log(`Turno ${order.ticket} listo`) }
  // endregion
}

class PushNotifier implements Subscriber {
  // region: PushNotifier#update
  update(order: Order) { Push.send(order.customer, '¡Tu café está listo!') }
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

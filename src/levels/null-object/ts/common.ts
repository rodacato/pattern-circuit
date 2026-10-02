// --- quienes usan la tarjeta del cliente ---
class Loyalty {
  // region: Loyalty#reward
  reward(order: Order) { order.card.addPoints(order.total) }
  // endregion
}

class Discounts {
  // region: Discounts#apply
  apply(order: Order) { order.total -= order.card.discount }
  // endregion
}

class Receipt {
  // region: Receipt#print
  print(order: Order) { console.log(`Tarjeta: ${order.card.maskedNumber}`) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) { console.log('¡Listo!') }
  // endregion
}

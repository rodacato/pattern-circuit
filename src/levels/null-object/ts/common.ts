// --- who uses the customer's card ---
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
  print(order: Order) { console.log(`Card: ${order.card.maskedNumber}`) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) { console.log('Ready!') }
  // endregion
}

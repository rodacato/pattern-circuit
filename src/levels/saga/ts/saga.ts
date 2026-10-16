// Each step has its compensating action. If one fails, the previous ones are undone in reverse order.
type Step = [action: (o: Order) => void, compensation: (o: Order) => void]

class PlaceOrderSaga {
  static STEPS: Step[] = [
    [(o) => Payments.charge(o), (o) => Payments.refund(o)],
    [(o) => Inventory.reserve(o), (o) => Inventory.release(o)],
  ]

  // region: PlaceOrderSaga#call
  call(order: Order) {
    const done: Step[1][] = []
    try {
      for (const [step, compensation] of PlaceOrderSaga.STEPS) {
        step(order)
        done.push(compensation)
      }
      new Barista().prepare(order)
    } catch (error) {
      if (!(error instanceof OutOfStock)) throw error
      done.reverse().forEach((compensation) => compensation(order))
      new Counter().notify(order, 'No supplies left: we refunded your money')
    }
  }
  // endregion
}

// region: Payments.charge
const Payments = {
  charge(order: Order) { Gateway.charge(order.total) },
  refund(order: Order) { Gateway.refund(order.total) },
}
// endregion

// region: Payments.refund
// The compensation for the charge: it does not erase the past, it corrects it with a refund.
// endregion

// region: Inventory.reserve
const Inventory = {
  reserve(order: Order) { if (!Stock.isAvailable(order.items)) throw new OutOfStock() },
  release(order: Order) { Stock.release(order.items) },
}
// endregion

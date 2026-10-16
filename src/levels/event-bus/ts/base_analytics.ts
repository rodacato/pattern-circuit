// Each service that produces something calls each interested service by hand.
class Orders {
  // region: Orders#place
  place(order: Event) {
    new Inventory().onEvent(order)
    new Billing().onEvent(order)
    new Loyalty().onEvent(order)
    new Analytics().onEvent(order) // ← change 1
  }
  // endregion
}

class Returns {
  // Returns copied the list… and forgot Billing and Loyalty.
  // region: Returns#process
  process(returnRequest: Event) {
    new Inventory().onEvent(returnRequest)
    new Analytics().onEvent(returnRequest) // ← change 2
  }
  // endregion
}

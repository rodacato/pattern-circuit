// Each service that produces something calls each interested service by hand.
class Orders {
  // region: Orders#place
  place(order: Event) {
    new Inventory().onEvent(order)
    new Billing().onEvent(order)
    new Loyalty().onEvent(order)
  }
  // endregion
}

class Returns {
  // Returns copied the list… and forgot Billing and Loyalty.
  // region: Returns#process
  process(returnRequest: Event) {
    new Inventory().onEvent(returnRequest)
  }
  // endregion
}

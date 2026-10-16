class Cashier {
  private approvers = [new Manager(), new Owner()]

  // Notify all the approvers: each one approves… and the refund is paid several times.
  // region: Cashier#refund
  refund(request: RefundRequest) { this.approvers.forEach((a) => a.approve(request)) }
  // endregion
}

// region: Manager#approve
class Manager {
  private refunds = new Refunds()
  approve(request: RefundRequest) { this.refunds.pay(request) }
}
// endregion

// region: Owner#approve
class Owner {
  private refunds = new Refunds()
  approve(request: RefundRequest) { this.refunds.pay(request) }
}
// endregion

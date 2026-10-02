class Cashier {
  private approvers = [new Manager(), new Owner()]

  // Avisar a todos los aprobadores: cada uno aprueba… y el reembolso se paga varias veces.
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

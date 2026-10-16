// region: Clerk#approve
class Clerk {
  private refunds = new Refunds()
  approve(request: RefundRequest) { this.refunds.pay(request) }
}
// endregion

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

class Cashier {
  static APPROVERS: Record<string, new () => { approve(request: RefundRequest): void }> = {
    low: Clerk, medium: Manager, high: Owner,
  }

  // Choosing an approver by category works… as long as you know all the categories in advance.
  // region: Cashier#refund
  refund(request: RefundRequest) { new Cashier.APPROVERS[request.category]().approve(request) } // TypeError with huge amounts
  // endregion
}

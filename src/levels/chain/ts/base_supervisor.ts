class Cashier {
  private refunds = new Refunds()

  // The cashier knows everyone who approves and decides who to send each case to.
  // region: Cashier#refund
  refund(request: RefundRequest) {
    // region: Cashier#refund:amount:low
    if (request.amount < 100) {
      this.refunds.pay(request)
    // endregion
    // region: Cashier#refund:amount:medium
    } else if (request.amount < 500) {
      new Manager().approve(request)
    // endregion
    // region: Cashier#refund:amount:medium-high
    } else if (request.amount < 1000) {
      new Supervisor().approve(request) // ← Cashier modified
    // endregion
    // region: Cashier#refund:amount:high
    } else if (request.amount < 2000) {
      new Owner().approve(request)
    // endregion
    // region: Cashier#refund:else
    } else {
      throw new Error('Now who?') // nobody thought of huge amounts
    // endregion
    }
  }
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

// region: Supervisor#approve
class Supervisor {
  private refunds = new Refunds()
  approve(request: RefundRequest) { this.refunds.pay(request) }
}
// endregion

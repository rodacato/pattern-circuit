class Cashier {
  private refunds = new Refunds()

  // El cajero conoce a todos los que aprueban y decide a quién mandarle cada caso.
  // region: Cashier#refund
  refund(request: RefundRequest) {
    // region: Cashier#refund:monto:bajo
    if (request.amount < 100) {
      this.refunds.pay(request)
    // endregion
    // region: Cashier#refund:monto:medio
    } else if (request.amount < 500) {
      new Manager().approve(request)
    // endregion
    // region: Cashier#refund:monto:alto
    } else if (request.amount < 2000) {
      new Owner().approve(request)
    // endregion
    // region: Cashier#refund:else
    } else {
      throw new Error('¿Y ahora quién?') // nadie pensó en montos enormes
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

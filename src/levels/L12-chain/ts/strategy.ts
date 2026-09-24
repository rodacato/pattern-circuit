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
    bajo: Clerk, medio: Manager, alto: Owner,
  }

  // Elegir aprobador por categoría funciona… mientras sepas de antemano todas las categorías.
  // region: Cashier#refund
  refund(request: RefundRequest) { new Cashier.APPROVERS[request.category]().approve(request) } // TypeError con montos enormes
  // endregion
}

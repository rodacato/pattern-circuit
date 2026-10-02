// Cada eslabón atiende lo suyo o lo pasa al siguiente. Nadie conoce la cadena completa.
abstract class Handler {
  private refunds = new Refunds()

  constructor(private next?: Handler) {}

  abstract canHandle(r: RefundRequest): boolean

  handle(request: RefundRequest) {
    this.canHandle(request) ? this.refunds.pay(request) : this.pass(request)
  }

  pass(request: RefundRequest) { this.next ? this.next.handle(request) : this.refunds.decline(request) }
}

// region: Cashier#handle
class Cashier extends Handler {
  canHandle(r: RefundRequest) { return r.amount < 100 }
}
// endregion

// region: Manager#handle
class Manager extends Handler {
  canHandle(r: RefundRequest) { return r.amount < 500 }
}
// endregion

// region: Owner#handle
class Owner extends Handler {
  canHandle(r: RefundRequest) { return r.amount < 2000 }
}
// endregion

// region: wiring
const chain = new Cashier(new Manager(new Owner()))
// endregion

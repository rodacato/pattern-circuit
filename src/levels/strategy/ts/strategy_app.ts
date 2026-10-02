interface PaymentMethod {
  charge(order: Order): void
}

class Cashier {
  constructor(
    private paymentMethods: Record<string, PaymentMethod>,
    private barista: Barista,
  ) {}

  // Cashier no longer knows how to charge: only who to delegate to.
  // region: Cashier#charge
  charge(order: Order) {
    this.paymentMethods[order.payment].charge(order)
    this.barista.prepare(order)
  }
  // endregion
}

class CashPayment implements PaymentMethod {
  // region: CashPayment#charge
  charge(order: Order) { CashDrawer.collect(order.total) }
  // endregion
}

class CardPayment implements PaymentMethod {
  // region: CardPayment#charge
  charge(order: Order) { CardTerminal.charge(order.total) }
  // endregion
}

class VoucherPayment implements PaymentMethod {
  // region: VoucherPayment#charge
  charge(order: Order) { VoucherBook.redeem(order.total) }
  // endregion
}

// region: AppPayment#charge
class AppPayment implements PaymentMethod { // ← new cartridge, nothing else
  charge(order: Order) { AppWallet.charge(order.total) }
}
// endregion

// region: wiring
const cashier = new Cashier(
  { cash: new CashPayment(), card: new CardPayment(), voucher: new VoucherPayment(), app: new AppPayment() },
  barista,
)
// endregion

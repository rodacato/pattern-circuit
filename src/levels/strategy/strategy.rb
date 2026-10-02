class Cashier
  def initialize(payment_methods, barista)
    @payment_methods = payment_methods
    @barista = barista
  end

  # Cashier ya no sabe cómo se cobra: solo a quién delegar.
  # region: Cashier#charge
  def charge(order)
    @payment_methods.fetch(order.payment).charge(order)
    @barista.prepare(order)
  end
  # endregion
end

class CashPayment
  # region: CashPayment#charge
  def charge(order) = CashDrawer.collect(order.total)
  # endregion
end

class CardPayment
  # region: CardPayment#charge
  def charge(order) = CardTerminal.charge(order.total)
  # endregion
end

class VoucherPayment
  # region: VoucherPayment#charge
  def charge(order) = VoucherBook.redeem(order.total)
  # endregion
end

# region: wiring
cashier = Cashier.new(
  { cash: CashPayment.new, card: CardPayment.new, voucher: VoucherPayment.new },
  barista
)
# endregion

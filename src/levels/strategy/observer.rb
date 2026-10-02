class Cashier
  def initialize = @subscribers = []

  def subscribe(payment_method) = @subscribers << payment_method

  # Observer notifies everyone; here we had to pick one.
  # region: Cashier#charge
  def charge(order)
    @subscribers.each { |s| s.charge(order) }
  end
  # endregion
end

class CashPayment
  def initialize(barista) = @barista = barista

  # region: CashPayment#charge
  def charge(order)
    CashDrawer.collect(order.total) # charges even though the customer paid by card
    @barista.prepare(order)
  end
  # endregion
end

class CardPayment
  def initialize(barista) = @barista = barista

  # region: CardPayment#charge
  def charge(order)
    CardTerminal.charge(order.total) # ...and here it charges again
    @barista.prepare(order)
  end
  # endregion
end

class VoucherPayment
  def initialize(barista) = @barista = barista

  # region: VoucherPayment#charge
  def charge(order)
    VoucherBook.redeem(order.total) # ...and again
    @barista.prepare(order)
  end
  # endregion
end

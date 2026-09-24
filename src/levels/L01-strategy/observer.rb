class Cashier
  def initialize = @subscribers = []

  def subscribe(payment_method) = @subscribers << payment_method

  # Observer avisa a todos; aquí había que elegir a uno.
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
    CashDrawer.collect(order.total) # cobra aunque el cliente pagó con tarjeta
    @barista.prepare(order)
  end
  # endregion
end

class CardPayment
  def initialize(barista) = @barista = barista

  # region: CardPayment#charge
  def charge(order)
    CardTerminal.charge(order.total) # ...y aquí se vuelve a cobrar
    @barista.prepare(order)
  end
  # endregion
end

class VoucherPayment
  def initialize(barista) = @barista = barista

  # region: VoucherPayment#charge
  def charge(order)
    VoucherBook.redeem(order.total) # ...y otra vez
    @barista.prepare(order)
  end
  # endregion
end

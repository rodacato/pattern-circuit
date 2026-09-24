# Factory Method para crear un único tipo de pago: una jerarquía de creadores con un solo producto.
IVA = 0.16

class PaymentFactory
  # region: PaymentFactory#create
  def create = CardPayment.new
  # endregion
end

class CardPayment
  def charge(total) = CardTerminal.charge(total)
end

class Cashier
  def initialize(barista, factory)
    @barista = barista
    @factory = factory
  end

  # region: Cashier#charge
  def charge(order)
    @factory.create.charge(order.price * (1 + IVA))
    @barista.prepare(order)
  end
  # endregion
end

# region: wiring
cashier = Cashier.new(Barista.new(Counter.new), PaymentFactory.new)
OrderTaker.new(cashier).take(:latte, 50)
# endregion

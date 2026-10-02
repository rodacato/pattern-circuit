# Strategy "por si acaso": una interfaz, un registro… y una sola implementación.
IVA = 0.16

class Cashier
  def initialize(barista, methods)
    @barista = barista
    @methods = methods
  end

  # region: Cashier#charge
  def charge(order)
    @methods.fetch(:card).charge(order.price * (1 + IVA))
    @barista.prepare(order)
  end
  # endregion
end

# region: CardPayment#charge
class CardPayment
  def charge(total) = CardTerminal.charge(total)
end
# endregion

# region: wiring
cashier = Cashier.new(Barista.new(Counter.new), { card: CardPayment.new })
OrderTaker.new(cashier).take(:latte, 50)
# endregion

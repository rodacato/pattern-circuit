# Un solo método de pago y ninguno más a la vista: el arreglo es una línea.
IVA = 0.16

class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    total = order.price * (1 + IVA)
    CardTerminal.charge(total)
    @barista.prepare(order)
  end
  # endregion
end

# region: wiring
cashier = Cashier.new(Barista.new(Counter.new))
OrderTaker.new(cashier).take(:latte, 50)
# endregion

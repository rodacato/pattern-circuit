# El aeropuerto solo acepta tarjeta, y así seguirá: el contrato con el banco es por años.
IVA = 0.16

class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    total = order.price * (1 + IVA)
    total *= 1 + IVA # ← bug: el IVA se suma dos veces
    CardTerminal.charge(total)
    @barista.prepare(order)
  end
  # endregion
end

# region: wiring
cashier = Cashier.new(Barista.new(Counter.new))
OrderTaker.new(cashier).take(:latte, 50)
# endregion

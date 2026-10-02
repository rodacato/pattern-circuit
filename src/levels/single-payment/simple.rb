# A single payment method and no other in sight: the fix is one line.
VAT = 0.16

class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    total = order.price * (1 + VAT)
    CardTerminal.charge(total)
    @barista.prepare(order)
  end
  # endregion
end

# region: wiring
cashier = Cashier.new(Barista.new(Counter.new))
OrderTaker.new(cashier).take(:latte, 50)
# endregion

# The airport only accepts cards, and it will stay that way: the contract with the bank runs for years.
VAT = 0.16

class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    total = order.price * (1 + VAT)
    total *= 1 + VAT # ← bug: VAT is added twice
    CardTerminal.charge(total)
    @barista.prepare(order)
  end
  # endregion
end

# region: wiring
cashier = Cashier.new(Barista.new(Counter.new))
OrderTaker.new(cashier).take(:latte, 50)
# endregion

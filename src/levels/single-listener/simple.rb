# A single interested party: Cashier calls it directly and the flow reads straight through.
class Cashier
  def initialize(kitchen) = @kitchen = kitchen

  # region: Cashier#charge
  def charge(order)
    CardTerminal.charge(order)
    @kitchen.start(order)
  end
  # endregion
end

# region: wiring
OrderTaker.new(Cashier.new(Kitchen.new(Counter.new))).take(:latte)
# endregion

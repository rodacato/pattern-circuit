# Un solo interesado: Cashier lo llama directo y el flujo se lee de corrido.
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

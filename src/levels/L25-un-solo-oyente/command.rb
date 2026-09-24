# Command convierte la llamada en un objeto… que nadie encola, deshace ni registra.
class StartOrder
  def initialize(kitchen, order)
    @kitchen = kitchen
    @order = order
  end

  # region: StartOrder#call
  def call = @kitchen.start(@order)
  # endregion
end

class Cashier
  def initialize(kitchen) = @kitchen = kitchen

  # region: Cashier#charge
  def charge(order)
    CardTerminal.charge(order)
    StartOrder.new(@kitchen, order).call
  end
  # endregion
end

# region: wiring
OrderTaker.new(Cashier.new(Kitchen.new(Counter.new))).take(:latte)
# endregion

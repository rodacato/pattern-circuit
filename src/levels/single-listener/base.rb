# Only the kitchen needs to know an order was charged… and nobody tells it.
class Cashier
  # region: Cashier#charge
  def charge(order)
    CardTerminal.charge(order)
    # and the kitchen? The order is left waiting.
  end
  # endregion
end

# region: wiring
OrderTaker.new(Cashier.new).take(:latte)
# endregion

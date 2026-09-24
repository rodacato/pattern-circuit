require "delegate"

# Envuelve el pedido y le añade algo, pero no decide nada.
# region: TrackedOrder
class TrackedOrder < SimpleDelegator
  def tracking_id = "T-#{object_id}"
end
# endregion

class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    order = TrackedOrder.new(order) # el pedido llega envuelto…
    # region: Cashier#charge:cash
    if order.payment == :cash
      CashDrawer.collect(order.total)
    # endregion
    # region: Cashier#charge:card
    elsif order.payment == :card
      CardTerminal.charge(order.total)
    # endregion
    # region: Cashier#charge:else
    else
      return # …pero cae en el mismo árbol de if
    # endregion
    end
    @barista.prepare(order)
  end
  # endregion
end

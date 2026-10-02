require "delegate"

# Wraps the order and adds something, but decides nothing.
# region: TrackedOrder
class TrackedOrder < SimpleDelegator
  def tracking_id = "T-#{object_id}"
end
# endregion

class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    order = TrackedOrder.new(order) # the order arrives wrapped…
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
      return # …but it falls into the same if tree
    # endregion
    end
    @barista.prepare(order)
  end
  # endregion
end

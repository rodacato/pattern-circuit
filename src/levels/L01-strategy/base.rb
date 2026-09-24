class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
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
      # ¿vales? Nadie los contempló: el pedido se pierde en silencio.
      return
    # endregion
    end
    @barista.prepare(order)
  end
  # endregion
end

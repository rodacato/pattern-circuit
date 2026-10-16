class Cashier
  def initialize(barista) = @barista = barista

  # Every new payment method forces us to open this class again.
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
    # region: Cashier#charge:app
    elsif order.payment == :app # ← new: Cashier modified
      AppWallet.charge(order.total)
    # endregion
    # region: Cashier#charge:else
    else
      return # vouchers are still being lost
    # endregion
    end
    @barista.prepare(order)
  end
  # endregion
end

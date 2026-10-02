class Cashier
  def initialize(barista) = @barista = barista

  # Cada método de pago nuevo obliga a abrir esta clase otra vez.
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
    elsif order.payment == :app # ← nuevo: Cashier modificado
      AppWallet.charge(order.total)
    # endregion
    # region: Cashier#charge:else
    else
      return # los vales siguen perdiéndose
    # endregion
    end
    @barista.prepare(order)
  end
  # endregion
end

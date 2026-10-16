class Cashier
  def initialize(gateway, barista)
    @gateway = gateway # now it is PagoFacil::SDK
    @barista = barista
  end

  # Cashier speaks "charge(total)"; the SDK understands "charge_in_cents". They do not fit.
  # region: Cashier#charge
  def charge(order)
    @gateway.charge(order.total) # NoMethodError: PagoFacil::SDK has no #charge
    @barista.prepare(order)
  end
  # endregion
end

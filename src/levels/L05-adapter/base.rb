class Cashier
  def initialize(gateway, barista)
    @gateway = gateway # ahora es PagoFacil::SDK
    @barista = barista
  end

  # Cashier habla "charge(total)"; el SDK entiende "cobrar_en_centavos". No encajan.
  # region: Cashier#charge
  def charge(order)
    @gateway.charge(order.total) # NoMethodError: PagoFacil::SDK no tiene #charge
    @barista.prepare(order)
  end
  # endregion
end

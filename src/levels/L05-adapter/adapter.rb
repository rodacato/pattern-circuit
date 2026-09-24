class Cashier
  def initialize(gateway, barista)
    @gateway = gateway
    @barista = barista
  end

  # Cashier no cambió: sigue hablando su idioma.
  # region: Cashier#charge
  def charge(order)
    @gateway.charge(order.total)
    @barista.prepare(order)
  end
  # endregion
end

# Traduce la interfaz que Cashier espera a la que el SDK ofrece.
# region: PagoFacilAdapter#charge
class PagoFacilAdapter
  def initialize(sdk) = @sdk = sdk

  def charge(total)
    @sdk.cobrar_en_centavos(monto_centavos: (total * 100).round, referencia: SecureRandom.uuid)
  end
end
# endregion

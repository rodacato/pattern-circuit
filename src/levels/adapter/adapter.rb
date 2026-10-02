require "securerandom"

class Cashier
  def initialize(gateway, barista)
    @gateway = gateway
    @barista = barista
  end

  # Cashier did not change: it still speaks its own language.
  # region: Cashier#charge
  def charge(order)
    @gateway.charge(order.total)
    @barista.prepare(order)
  end
  # endregion
end

# Translates the interface Cashier expects into the one the SDK offers.
# region: PagoFacilAdapter#charge
class PagoFacilAdapter
  def initialize(sdk) = @sdk = sdk

  def charge(total)
    @sdk.charge_in_cents(amount_cents: (total * 100).round, reference: SecureRandom.uuid)
  end
end
# endregion

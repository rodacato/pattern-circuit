class Cashier
  def initialize(payments, barista)
    @payments = payments
    @barista = barista
  end

  # region: Cashier#charge
  def charge(order)
    @payments.charge(order.total)
    @barista.prepare(order)
  end
  # endregion
end

# A facade simplifies a subsystem, but it does not translate: it still asks for #charge.
# region: Payments#charge
class Payments
  def initialize(sdk) = @sdk = sdk
  def charge(total) = @sdk.charge(total)
end
# endregion

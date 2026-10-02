
# Un proxy delante del proveedor… que le reenvía cada cobro y espera el mismo timeout.
# region: GatewayProxy
class GatewayProxy
  def charge(order) = PaymentGateway.new.charge(order)
end
# endregion

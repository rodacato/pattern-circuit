
// Un proxy delante del proveedor… que le reenvía cada cobro y espera el mismo timeout.
// region: GatewayProxy
class GatewayProxy implements Gateway {
  charge(order: Order) { return new PaymentGateway().charge(order) }
}
// endregion

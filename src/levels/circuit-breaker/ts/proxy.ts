
// A proxy in front of the provider… that forwards every charge to it and waits for the same timeout.
// region: GatewayProxy
class GatewayProxy implements Gateway {
  charge(order: Order) { return new PaymentGateway().charge(order) }
}
// endregion

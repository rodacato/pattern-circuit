
// Un adaptador para Stripe ayuda… pero el núcleo sigue atado a Postgres.
// region: StripeAdapter
class StripeAdapter {
  charge(order: Order) { return Stripe.Charge.create({ amount: order.totalCents }) }
}
// endregion

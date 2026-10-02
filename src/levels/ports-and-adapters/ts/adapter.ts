
// An adapter for Stripe helps… but the core is still tied to Postgres.
// region: StripeAdapter
class StripeAdapter {
  charge(order: Order) { return Stripe.Charge.create({ amount: order.totalCents }) }
}
// endregion

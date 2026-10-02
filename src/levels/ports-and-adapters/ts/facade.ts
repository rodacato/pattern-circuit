
// An infrastructure facade hides the details, but the core still calls the real DB.
// region: Infrastructure
class Infrastructure {
  saveAndCharge(order: Order) { PG.connect(process.env.DATABASE_URL!); return Stripe.Charge.create({ amount: order.totalCents }) }
}
// endregion

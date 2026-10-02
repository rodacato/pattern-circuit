
// Una fachada de infraestructura esconde los detalles, pero el núcleo sigue llamando a la BD real.
// region: Infrastructure
class Infrastructure {
  saveAndCharge(order: Order) { PG.connect(process.env.DATABASE_URL!); return Stripe.Charge.create({ amount: order.totalCents }) }
}
// endregion

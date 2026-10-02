// The business core talks directly to the database and to Stripe.
class OrderService {
  // region: OrderService#place
  place(params: OrderParams) {
    const order = new Order(params)
    const db = PG.connect(process.env.DATABASE_URL!) // always the real database
    db.exec('INSERT INTO orders …', order.toRow())
    Stripe.Charge.create({ amount: order.totalCents, source: params.card })
    new Receipt().confirm(order)
  }
  // endregion
}

// region: Postgres
// In the test environment there is no DATABASE_URL: PG.connect blows up.
// endregion

// region: Stripe
// And every test would try to really charge.
// endregion

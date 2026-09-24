// El núcleo del negocio habla directo con la base de datos y con Stripe.
class OrderService {
  // region: OrderService#place
  place(params: OrderParams) {
    const order = new Order(params)
    const db = PG.connect(process.env.DATABASE_URL!) // la base real, siempre
    db.exec('INSERT INTO orders …', order.toRow())
    Stripe.Charge.create({ amount: order.totalCents, source: params.card })
    new Receipt().confirm(order)
  }
  // endregion
}

// region: Postgres
// En el entorno de pruebas no hay DATABASE_URL: PG.connect explota.
// endregion

// region: Stripe
// Y cada prueba intentaría cobrar de verdad.
// endregion

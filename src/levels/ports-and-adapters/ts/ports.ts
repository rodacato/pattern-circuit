// The core only knows ports: interfaces it defines itself.
class OrderService {
  constructor(
    private repository: OrderRepository,
    private payments: Payments,
  ) {}

  // region: OrderService#place
  place(params: OrderParams) {
    const order = new Order(params)
    this.repository.save(order)
    this.payments.charge(order)
    new Receipt().confirm(order)
  }
  // endregion
}

// region: Port::Repository
// Outbound port: save and find orders. The core does not know where.
interface OrderRepository {
  save(order: Order): void
}
// endregion

// region: Port::Payments
// Outbound port: charge an order. The core does not know with whom.
interface Payments {
  charge(order: Order): unknown
}
// endregion

// Adapters: the outside world plugs into the ports.
// region: InMemoryOrders
class InMemoryOrders implements OrderRepository {
  private orders: Order[] = []
  save(order: Order) { this.orders.push(order) }
}
// endregion

// region: PostgresOrders
class PostgresOrders implements OrderRepository {
  save(order: Order) { PG.connect(process.env.DATABASE_URL!).exec('INSERT INTO orders …', order.toRow()) }
}
// endregion

// region: FakePayments
class FakePayments implements Payments {
  charge(_order: Order) { return 'ok' }
}
// endregion

// region: StripePayments
class StripePayments implements Payments {
  charge(order: Order) { return Stripe.Charge.create({ amount: order.totalCents }) }
}
// endregion

// region: wiring
const test = new OrderService(new InMemoryOrders(), new FakePayments())
const prod = new OrderService(new PostgresOrders(), new StripePayments())
// endregion

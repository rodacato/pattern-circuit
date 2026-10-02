# The core only knows ports: interfaces it defines itself.
class OrderService
  def initialize(repository:, payments:)
    @repository = repository
    @payments = payments
  end

  # region: OrderService#place
  def place(params)
    order = Order.new(params)
    @repository.save(order)
    @payments.charge(order)
    Receipt.new.confirm(order)
  end
  # endregion
end

# region: Port::Repository
# Outbound port: save and find orders. The core does not know where.
# endregion

# region: Port::Payments
# Outbound port: charge an order. The core does not know with whom.
# endregion

# Adapters: the outside world plugs into the ports.
# region: InMemoryOrders
class InMemoryOrders
  def save(order) = (@orders ||= []) << order
end
# endregion

# region: PostgresOrders
class PostgresOrders
  def save(order) = PG.connect(ENV.fetch("DATABASE_URL")).exec("INSERT INTO orders …", order.to_row)
end
# endregion

# region: FakePayments
class FakePayments
  def charge(order) = :ok
end
# endregion

# region: StripePayments
class StripePayments
  def charge(order) = Stripe::Charge.create(amount: order.total_cents)
end
# endregion

# region: wiring
test = OrderService.new(repository: InMemoryOrders.new, payments: FakePayments.new)
prod = OrderService.new(repository: PostgresOrders.new, payments: StripePayments.new)
# endregion

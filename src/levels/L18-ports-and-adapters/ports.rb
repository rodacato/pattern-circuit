# El núcleo solo conoce puertos: interfaces que él mismo define.
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
# Puerto de salida: guardar y buscar pedidos. El núcleo no sabe dónde.
# endregion

# region: Port::Payments
# Puerto de salida: cobrar un pedido. El núcleo no sabe con quién.
# endregion

# Adaptadores: el mundo exterior se enchufa a los puertos.
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

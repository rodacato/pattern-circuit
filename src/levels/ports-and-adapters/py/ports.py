import os
from abc import ABC, abstractmethod


# The core only knows ports: interfaces it defines itself.
class OrderService:
    def __init__(self, repository, payments):
        self.repository = repository
        self.payments = payments

    # region: OrderService#place
    def place(self, params):
        order = Order(params)
        self.repository.save(order)
        self.payments.charge(order)
        Receipt().confirm(order)
    # endregion


# region: Port::Repository
# Outbound port: save and find orders. The core does not know where.
class OrderRepository(ABC):
    @abstractmethod
    def save(self, order): ...
# endregion


# region: Port::Payments
# Outbound port: charge an order. The core does not know with whom.
class Payments(ABC):
    @abstractmethod
    def charge(self, order): ...
# endregion


# Adapters: the outside world plugs into the ports.
# region: InMemoryOrders
class InMemoryOrders(OrderRepository):
    def __init__(self):
        self.orders = []

    def save(self, order):
        self.orders.append(order)
# endregion


# region: PostgresOrders
class PostgresOrders(OrderRepository):
    def save(self, order):
        PG.connect(os.environ["DATABASE_URL"]).exec("INSERT INTO orders …", order.to_row())
# endregion


# region: FakePayments
class FakePayments(Payments):
    def charge(self, order):
        return "ok"
# endregion


# region: StripePayments
class StripePayments(Payments):
    def charge(self, order):
        return Stripe.Charge.create(amount=order.total_cents)
# endregion


# region: wiring
test = OrderService(InMemoryOrders(), FakePayments())
prod = OrderService(PostgresOrders(), StripePayments())
# endregion

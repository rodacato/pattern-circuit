import os


# The business core talks directly to the database and to Stripe.
class OrderService:
    # region: OrderService#place
    def place(self, params):
        order = Order(params)
        db = PG.connect(os.environ["DATABASE_URL"])  # always the real database
        db.exec("INSERT INTO orders …", order.to_row())
        Stripe.Charge.create(amount=order.total_cents, source=params.card)
        Receipt().confirm(order)
    # endregion


# region: Postgres
# In the test environment there is no DATABASE_URL: PG.connect blows up.
# endregion

# region: Stripe
# And every test would try to really charge.
# endregion

# The business core talks directly to the database and to Stripe.
class OrderService
  # region: OrderService#place
  def place(params)
    order = Order.new(params)
    db = PG.connect(ENV.fetch("DATABASE_URL")) # always the real database
    db.exec("INSERT INTO orders …", order.to_row)
    Stripe::Charge.create(amount: order.total_cents, source: params[:card])
    Receipt.new.confirm(order)
  end
  # endregion
end

# region: Postgres
# In the test environment there is no DATABASE_URL: PG.connect blows up.
# endregion

# region: Stripe
# And every test would try to really charge.
# endregion

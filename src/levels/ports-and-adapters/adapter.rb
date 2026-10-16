
# An adapter for Stripe helps… but the core is still tied to Postgres.
# region: StripeAdapter
class StripeAdapter
  def charge(order) = Stripe::Charge.create(amount: order.total_cents)
end
# endregion

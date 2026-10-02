
# Un adaptador para Stripe ayuda… pero el núcleo sigue atado a Postgres.
# region: StripeAdapter
class StripeAdapter
  def charge(order) = Stripe::Charge.create(amount: order.total_cents)
end
# endregion

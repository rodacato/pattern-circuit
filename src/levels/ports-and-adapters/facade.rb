
# An infrastructure facade hides the details, but the core still calls the real DB.
# region: Infrastructure
class Infrastructure
  def save_and_charge(order) = (PG.connect(ENV.fetch("DATABASE_URL")); Stripe::Charge.create(amount: order.total_cents))
end
# endregion


# Una fachada de infraestructura esconde los detalles, pero el núcleo sigue llamando a la BD real.
# region: Infrastructure
class Infrastructure
  def save_and_charge(order) = (PG.connect(ENV.fetch("DATABASE_URL")); Stripe::Charge.create(amount: order.total_cents))
end
# endregion

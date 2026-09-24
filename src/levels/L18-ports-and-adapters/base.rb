# El núcleo del negocio habla directo con la base de datos y con Stripe.
class OrderService
  # region: OrderService#place
  def place(params)
    order = Order.new(params)
    db = PG.connect(ENV.fetch("DATABASE_URL")) # la base real, siempre
    db.exec("INSERT INTO orders …", order.to_row)
    Stripe::Charge.create(amount: order.total_cents, source: params[:card])
    Receipt.new.confirm(order)
  end
  # endregion
end

# region: Postgres
# En el entorno de pruebas no hay DATABASE_URL: PG.connect explota.
# endregion

# region: Stripe
# Y cada prueba intentaría cobrar de verdad.
# endregion


# Traduce el pedido de la app al formato del mostrador… pero la orquestación incompleta sigue ahí.
# region: DeliveryRequestAdapter
class DeliveryRequestAdapter
  def initialize(app) = @app = app
  def make_latte = @app.make_latte
end
# endregion

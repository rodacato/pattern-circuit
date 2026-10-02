
# Translates the app's request to the counter's format… but the incomplete orchestration is still there.
# region: DeliveryRequestAdapter
class DeliveryRequestAdapter
  def initialize(app) = @app = app
  def make_latte = @app.make_latte
end
# endregion

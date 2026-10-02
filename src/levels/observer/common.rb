# --- los interesados en saber que un pedido está listo ---
class Display
  # region: Display#update
  def update(order) = puts("Turno #{order.ticket} listo")
  # endregion
end

class PushNotifier
  # region: PushNotifier#update
  def update(order) = Push.send(order.customer, "¡Tu café está listo!")
  # endregion
end

class LoyaltyProgram
  # region: LoyaltyProgram#update
  def update(order) = order.customer.add_points(10)
  # endregion
end

class Kitchen
  # region: Kitchen#update
  def update(order) = Stock.consume(order.items)
  # endregion
end

class Barista
  # region: Barista#prepare
  def prepare(order) = order.complete!
  # endregion
end

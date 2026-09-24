
# Avisar del fallo a los interesados… que se enteran, pero nadie devuelve el dinero.
# region: OrderFailedNotifier
class OrderFailedNotifier
  def notify(order) = @subscribers.each { |s| s.order_failed(order) }
end
# endregion

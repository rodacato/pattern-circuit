
# Notify those interested of the failure… they find out, but nobody refunds the money.
# region: OrderFailedNotifier
class OrderFailedNotifier
  def notify(order) = @subscribers.each { |s| s.order_failed(order) }
end
# endregion

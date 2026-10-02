
# A single desk in front of the store: everyone goes through it into the same queue.
# region: OrdersDesk
class OrdersDesk
  def handle(request) = OrderStore.new.handle(request)
end
# endregion

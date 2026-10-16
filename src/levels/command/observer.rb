
# Notify the barista of the cancellation… who treats it as just another order.
# region: CancelBroadcast
class CancelBroadcast
  def call(request) = @subscribers.each { |s| s.prepare(request.drink) }
end
# endregion

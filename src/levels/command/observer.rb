
# Avisar al barista de la cancelación… que la interpreta como un pedido más.
# region: CancelBroadcast
class CancelBroadcast
  def call(request) = @subscribers.each { |s| s.prepare(request.drink) }
end
# endregion

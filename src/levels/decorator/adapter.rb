class Menu
  # region: Menu#drink_for
  def drink_for(request)
    LegacyMenuAdapter.new(OldPos.new).drink_for(request)
  end
  # endregion
end

# Traduce el pedido al formato del punto de venta viejo… que tampoco conoce combinaciones.
# region: LegacyMenuAdapter
class LegacyMenuAdapter
  def initialize(pos) = @pos = pos
  def drink_for(request) = @pos.lookup(request.extras.join("+"))
end
# endregion

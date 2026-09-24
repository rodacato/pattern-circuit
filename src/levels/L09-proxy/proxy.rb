# Mismo contrato que RemoteInventory; solo va al almacén si no conoce la respuesta.
# region: CachedInventory#in_stock?
class CachedInventory
  def initialize(real) = (@real = real; @known = {})

  def in_stock?(item)
    @known.fetch(item) { @known[item] = @real.in_stock?(item) }
  end
end
# endregion

# OrderTaker no se entera del cambio: recibe algo que responde igual.
# region: wiring
taker = OrderTaker.new(CachedInventory.new(RemoteInventory.new), barista)
# endregion

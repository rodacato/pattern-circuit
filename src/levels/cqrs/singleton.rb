
# Una sola instancia compartida del almacén… con la misma fila de siempre.
# region: OrderStore.instance
class OrderStore
  def self.instance = @instance ||= new
end
# endregion

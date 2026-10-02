
# Una estrategia de cancelación no sirve si la acción ya se ejecutó.
# region: CancelStrategy
class CancelStrategy
  def call(request) = raise "No hay a qué aplicarle la estrategia: el pedido ya corrió"
end
# endregion

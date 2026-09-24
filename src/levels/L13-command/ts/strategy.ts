
// Una estrategia de cancelación no sirve si la acción ya se ejecutó.
// region: CancelStrategy
class CancelStrategy {
  call(request: OrderRequest) { throw new Error('No hay a qué aplicarle la estrategia: el pedido ya corrió') }
}
// endregion

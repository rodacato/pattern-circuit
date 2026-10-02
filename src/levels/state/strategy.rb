# Una estrategia por evento… pero ninguna recuerda en qué estado está el pedido.
class Order
  attr_reader :status

  HANDLERS = { pagar: PayHandler, preparar: PrepareHandler, entregar: DeliverHandler, cancelar: CancelHandler }

  # region: EventHandlers
  def handle(event)
    @status = HANDLERS.fetch(event).new.apply # siempre aplica, pase lo que pase
    @history.record(self, event)
  end
  # endregion
end

# One strategy per event… but none remembers which state the order is in.
class Order
  attr_reader :status

  HANDLERS = { pay: PayHandler, prepare: PrepareHandler, deliver: DeliverHandler, cancel: CancelHandler }

  # region: EventHandlers
  def handle(event)
    @status = HANDLERS.fetch(event).new.apply # always applies, no matter what
    @history.record(self, event)
  end
  # endregion
end

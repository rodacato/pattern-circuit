# Encolar los eventos como comandos no cambia qué se permite: la cola los ejecuta igual.
# region: EventQueue
class EventQueue
  def push(event) = (@events ||= []) << event
  def run(order) = @events.each { |e| order.handle(e) }
end
# endregion

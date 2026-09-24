# Encolar los eventos como comandos no cambia qué se permite: la cola los ejecuta igual.
# region: EventQueue
class EventCommand
  def initialize(order, event) = (@order, @event = order, event)
  def execute = @order.handle(@event)
end

class EventQueue
  def push(command) = (@commands ||= []) << command
  def run = @commands.each(&:execute) # los ejecuta en orden, tengan sentido o no
end
# endregion

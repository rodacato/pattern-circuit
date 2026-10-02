# Cada evento del pedido es un comando: se encola y se puede retirar antes de ejecutarse.
class OrderEventCommand
  attr_reader :id

  def initialize(order, event, id) = (@order, @event, @id = order, event, id)
  def execute = @order.handle(@event)
end

class FrontDesk
  # region: FrontDesk#submit
  def submit(request)
    return @queue.cancel(request.command_id) if request.undo?
    @queue.push(OrderEventCommand.new(@order, request.event, request.command_id))
  end
  # endregion
end

class CommandQueue
  # region: CommandQueue#push
  def push(command) = @pending << command
  def cancel(command_id) = @pending.reject! { |c| c.id == command_id }
  def run_next = @pending.shift&.execute
  # endregion
end

# Un pedido convertido en objeto: se puede guardar, encolar, ejecutar después… o deshacer.
class OrderCommand
  attr_reader :order_id

  def initialize(barista, drink, order_id) = (@barista, @drink, @order_id = barista, drink, order_id)
  def execute = @barista.prepare(@drink)
end

class FrontDesk
  # region: FrontDesk#submit
  def submit(request)
    return @queue.cancel(request.order_id) if request.action == :cancelar
    @queue.push(OrderCommand.new(@barista, request.drink, request.order_id))
  end
  # endregion
end

class CommandQueue
  # Los comandos esperan su turno; deshacer es sacarlos de la cola antes de que corran.
  # region: CommandQueue#push
  def push(command) = @pending << command
  def cancel(order_id) = @pending.reject! { |c| c.order_id == order_id }
  def run_next = @pending.shift&.execute
  # endregion
end

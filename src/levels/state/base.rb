class Order
  attr_reader :status

  def initialize = @status = :pendiente

  # Cada evento cambia el status sin preguntar si tiene sentido.
  # Las reglas viven repartidas en ifs, en cada método… cuando alguien se acuerda.
  # region: Order#handle
  def handle(event)
    case event
    when :pagar then @status = :pagado
    when :preparar then @status = :preparando # ¿y si no está pagado?
    when :entregar then @status = :entregado  # ¿y si no está preparado?
    when :cancelar then @status = :cancelado  # ¿y si ya se entregó?
    end
    @history.record(self, event)
  end
  # endregion
end

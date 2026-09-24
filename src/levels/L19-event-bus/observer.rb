# Cada productor es un sujeto con su propia lista de suscriptores… y las listas no coinciden.
class Orders
  # region: Orders#place
  def place(order) = @subscribers.each { |s| s.on_event(order) } # Inventario, Facturación, Lealtad
  # endregion
end

class Returns
  # region: Returns#process
  def process(return_request) = @subscribers.each { |s| s.on_event(return_request) } # solo Inventario
  # endregion
end

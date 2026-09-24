# Cada servicio que produce algo llama a mano a cada servicio interesado.
class Orders
  # region: Orders#place
  def place(order)
    Inventory.new.on_event(order)
    Billing.new.on_event(order)
    Loyalty.new.on_event(order)
  end
  # endregion
end

class Returns
  # Devoluciones copió la lista… y se le olvidó Facturación y Lealtad.
  # region: Returns#process
  def process(return_request)
    Inventory.new.on_event(return_request)
  end
  # endregion
end

# Una fachada que agrupa los servicios… a la que cada productor sigue llamando con su propia lista.
# region: Services
class Services
  def notify(event, *targets) = targets.each { |t| t.on_event(event) }
end
# endregion

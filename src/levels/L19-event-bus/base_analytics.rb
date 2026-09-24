# Cada servicio que produce algo llama a mano a cada servicio interesado.
class Orders
  # region: Orders#place
  def place(order)
    Inventory.new.on_event(order)
    Billing.new.on_event(order)
    Loyalty.new.on_event(order)
    Analytics.new.on_event(order) # ← cambio 1
  end
  # endregion
end

class Returns
  # Devoluciones copió la lista… y se le olvidó Facturación y Lealtad.
  # region: Returns#process
  def process(return_request)
    Inventory.new.on_event(return_request)
    Analytics.new.on_event(return_request) # ← cambio 2
  end
  # endregion
end

# --- el resto de la cafetería ---
class OrderTaker
  def initialize(inventory, barista)
    @inventory = inventory
    @barista = barista
  end

  # region: OrderTaker#take
  def take(order)
    return unless @inventory.in_stock?(order.item)
    @barista.prepare(order)
  end
  # endregion
end

# El almacén está lejos: cada consulta tarda y atiende de a una.
class RemoteInventory
  # region: RemoteInventory#in_stock?
  def in_stock?(item)
    sleep 2 # viaje de ida y vuelta al almacén
    Warehouse.api.stock(item).positive?
  end
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # region: Barista#prepare
  def prepare(order) = @counter.hand_over(order)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("¡#{order.item} listo!")
  # endregion
end

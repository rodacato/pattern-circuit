class PlaceOrder
  # Tres pasos, cada uno en su propio servicio: no hay una transacción que los envuelva a todos.
  # region: PlaceOrder#call
  def call(order)
    Payments.charge(order)      # 1. se cobra (ya no hay vuelta atrás)
    Inventory.reserve(order)    # 2. ¿sin avena? OutOfStock… y el cliente ya pagó
    Barista.new.prepare(order)  # 3.
  end
  # endregion
end

# region: Payments.charge
module Payments
  def self.charge(order) = Gateway.charge(order.total)
end
# endregion

# region: Inventory.reserve
module Inventory
  def self.reserve(order) = raise(OutOfStock) unless Stock.available?(order.items)
end
# endregion

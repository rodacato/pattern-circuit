class PlaceOrder
  # Three steps, each in its own service: there is no transaction wrapping them all.
  # region: PlaceOrder#call
  def call(order)
    Payments.charge(order)      # 1. charge (no way back now)
    Inventory.reserve(order)    # 2. out of oat? OutOfStock… and the customer already paid
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
  def self.reserve(order) = (raise OutOfStock unless Stock.available?(order.items))
end
# endregion

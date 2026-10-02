# A facade with a single door… that calls the warehouse just as often.
# region: StockDesk#in_stock?
class StockDesk
  def initialize(inventory) = @inventory = inventory
  def in_stock?(item) = @inventory.in_stock?(item)
end
# endregion

# region: wiring
taker = OrderTaker.new(StockDesk.new(RemoteInventory.new), barista)
# endregion

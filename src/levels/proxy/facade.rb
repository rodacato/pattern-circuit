# Una fachada con una sola puerta… que llama igual de seguido al almacén.
# region: StockDesk#in_stock?
class StockDesk
  def initialize(inventory) = @inventory = inventory
  def in_stock?(item) = @inventory.in_stock?(item)
end
# endregion

# region: wiring
taker = OrderTaker.new(StockDesk.new(RemoteInventory.new), barista)
# endregion

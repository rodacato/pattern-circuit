# Same contract as RemoteInventory; only goes to the warehouse if it doesn't know the answer.
# region: CachedInventory#in_stock?
class CachedInventory
  def initialize(real) = (@real = real; @known = {})

  def in_stock?(item)
    @known.fetch(item) { @known[item] = @real.in_stock?(item) }
  end
end
# endregion

# OrderTaker doesn't notice the change: it gets something that answers the same.
# region: wiring
taker = OrderTaker.new(CachedInventory.new(RemoteInventory.new), barista)
# endregion

# A single instance of the remote client… that still travels to the warehouse on every query.
# region: RemoteInventory.instance
class RemoteInventory
  def self.instance = @instance ||= new
end
# endregion

# region: wiring
taker = OrderTaker.new(RemoteInventory.instance, barista)
# endregion

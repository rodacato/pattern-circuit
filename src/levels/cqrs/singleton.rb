
# A single shared instance of the store… with the same old queue.
# region: OrderStore.instance
class OrderStore
  def self.instance = @instance ||= new
end
# endregion

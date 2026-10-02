# Each producer is a subject with its own list of subscribers… and the lists do not match.
class Orders
  # region: Orders#place
  def place(order) = @subscribers.each { |s| s.on_event(order) } # Inventory, Billing, Loyalty
  # endregion
end

class Returns
  # region: Returns#process
  def process(return_request) = @subscribers.each { |s| s.on_event(return_request) } # only Inventory
  # endregion
end

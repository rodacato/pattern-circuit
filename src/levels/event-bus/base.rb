# Each service that produces something calls each interested service by hand.
class Orders
  # region: Orders#place
  def place(order)
    Inventory.new.on_event(order)
    Billing.new.on_event(order)
    Loyalty.new.on_event(order)
  end
  # endregion
end

class Returns
  # Returns copied the list… and forgot Billing and Loyalty.
  # region: Returns#process
  def process(return_request)
    Inventory.new.on_event(return_request)
  end
  # endregion
end

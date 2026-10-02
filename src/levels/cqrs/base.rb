# A single model for everything: the screens and the counter queue up in the same place.
class OrderStore
  # region: OrderStore#handle
  def handle(request)
    # region: OrderStore#handle:read
    if request.read?
      @mutex.synchronize { orders_with_items_and_customers } # heavy query, one at a time
    # endregion
    # region: OrderStore#handle:write
    else
      @mutex.synchronize { validate_and_save(request.order) }
    # endregion
    end
  end
  # endregion
end

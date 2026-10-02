# Write and read through different paths.
class PlaceOrder
  # Write side: validates business rules, one order at a time.
  # region: PlaceOrder#call
  def call(command)
    raise InvalidOrder unless command.valid? # business rules, only on the write side
    order = Order.create!(command.attributes)
    @events.publish(:order_placed, order)
  end
  # endregion
end

# region: BoardProjection#on_order_placed
class BoardProjection
  # Each change updates a view that is already ready to read.
  def on_order_placed(order) = @board_view.upsert(order.summary)
end
# endregion

# region: BoardQuery#call
class BoardQuery
  # Read side: a flat table, no joins or locks. Fast and no queue.
  def call = @board_view.all
end
# endregion

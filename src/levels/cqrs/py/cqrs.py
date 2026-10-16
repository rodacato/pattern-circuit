# Write and read through different paths.
class PlaceOrder:
    def __init__(self, events):
        self.events = events

    # Write side: validates business rules, one order at a time.
    # region: PlaceOrder#call
    def call(self, command):
        if not command.is_valid():
            raise InvalidOrder()  # business rules, only on the write side
        order = Order.create(command.attributes)
        self.events.publish("order_placed", order)
    # endregion


# region: BoardProjection#on_order_placed
class BoardProjection:
    def __init__(self, board_view):
        self.board_view = board_view

    # Each change updates a view that is already ready to read.
    def on_order_placed(self, order):
        self.board_view.upsert(order.summary)
# endregion


# region: BoardQuery#call
class BoardQuery:
    def __init__(self, board_view):
        self.board_view = board_view

    # Read side: a flat table, no joins or locks. Fast and no queue.
    def call(self):
        return self.board_view.all()
# endregion

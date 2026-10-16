# A bus for a single subscriber: to know what happens after charging you have to look up who subscribed.
class EventBus:
    def __init__(self):
        self.handlers = {}

    def subscribe(self, event, handler):
        self.handlers.setdefault(event, []).append(handler)

    # region: EventBus#publish
    def publish(self, event, payload):
        for h in self.handlers.get(event, []):
            h(payload)
    # endregion


class Cashier:
    def __init__(self, bus):
        self.bus = bus

    # region: Cashier#charge
    def charge(self, order):
        CardTerminal.charge(order)
        self.bus.publish("order_paid", order)
    # endregion


# region: wiring
bus = EventBus()
kitchen = Kitchen(Counter())
bus.subscribe("order_paid", lambda order: kitchen.start(order))
OrderTaker(Cashier(bus)).take("latte")
# endregion

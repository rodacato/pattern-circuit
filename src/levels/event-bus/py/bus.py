# Producers publish to the bus; consumers subscribe to the bus. Nobody knows each other.
class EventBus:
    def __init__(self):
        self.subscribers = []

    # region: EventBus#publish
    def publish(self, event):
        for s in self.subscribers:
            s.on_event(event)
    # endregion

    def subscribe(self, subscriber):
        self.subscribers.append(subscriber)


class Orders:
    def __init__(self, bus):
        self.bus = bus

    # region: Orders#place
    def place(self, order):
        self.bus.publish(order)
    # endregion


class Returns:
    def __init__(self, bus):
        self.bus = bus

    # region: Returns#process
    def process(self, return_request):
        self.bus.publish(return_request)
    # endregion


# region: wiring
bus = EventBus()
for s in [Inventory(), Billing(), Loyalty()]:
    bus.subscribe(s)
# endregion

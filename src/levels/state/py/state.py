from abc import ABC, abstractmethod


# Each state is an object that knows which events it accepts and which state it leads to.
class State(ABC):
    name: str

    @abstractmethod
    def on(self, event):
        ...


class Order:
    def __init__(self):
        self.state = Pending()
        self.history = History()

    @property
    def status(self):
        return self.state.name

    # region: Order#handle
    def handle(self, event):
        next_state = self.state.on(event)
        if next_state is None:
            return self.history.reject(self, event)
        self.state = next_state
        self.history.record(self, event)
    # endregion


# region: Order#handle:pending
class Pending(State):
    name = "pending"

    def on(self, event):
        return {"pay": Paid(), "cancel": Cancelled()}.get(event)
# endregion


# region: Order#handle:paid
class Paid(State):
    name = "paid"

    def on(self, event):
        return {"prepare": Preparing(), "cancel": Cancelled()}.get(event)
# endregion


# region: Order#handle:preparing
class Preparing(State):
    name = "preparing"

    def on(self, event):
        return {"deliver": Delivered()}.get(event)
# endregion


# region: Order#handle:delivered
class Delivered(State):
    name = "delivered"

    def on(self, _event):
        return None  # a delivered order no longer changes
# endregion


# region: Order#handle:cancelled
class Cancelled(State):
    name = "cancelled"

    def on(self, _event):
        return None
# endregion

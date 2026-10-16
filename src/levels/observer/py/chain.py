from abc import ABC, abstractmethod


class Handler(ABC):
    @abstractmethod
    def handle(self, order):
        ...


class Order:
    def __init__(self, handler):
        self.status = "pending"
        self.handler = handler

    # In a chain, the first one that handles it keeps the notice: the others never find out.
    # region: Order#complete!
    def complete(self):
        self.status = "ready"
        self.handler.handle(self)
    # endregion

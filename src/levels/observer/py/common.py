# --- those interested in knowing an order is ready ---
from abc import ABC, abstractmethod


class Subscriber(ABC):
    @abstractmethod
    def update(self, order):
        ...


class Display(Subscriber):
    # region: Display#update
    def update(self, order):
        print(f"Ticket {order.ticket} ready")
    # endregion


class PushNotifier(Subscriber):
    # region: PushNotifier#update
    def update(self, order):
        Push.send(order.customer, "Your coffee is ready!")
    # endregion


class LoyaltyProgram(Subscriber):
    # region: LoyaltyProgram#update
    def update(self, order):
        order.customer.add_points(10)
    # endregion


class Kitchen(Subscriber):
    # region: Kitchen#update
    def update(self, order):
        Stock.consume(order.items)
    # endregion


class Barista:
    # region: Barista#prepare
    def prepare(self, order):
        order.complete()
    # endregion

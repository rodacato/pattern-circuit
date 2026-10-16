from abc import ABC, abstractmethod

# Strategy "just in case": an interface, a registry… and a single implementation.
VAT = 0.16


class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, total):
        ...


class Cashier:
    def __init__(self, barista, methods):
        self.barista = barista
        self.methods = methods

    # region: Cashier#charge
    def charge(self, order):
        self.methods["card"].charge(order.price * (1 + VAT))
        self.barista.prepare(order)
    # endregion


# region: CardPayment#charge
class CardPayment(PaymentMethod):
    def charge(self, total):
        CardTerminal.charge(total)
# endregion


# region: wiring
cashier = Cashier(Barista(Counter()), {"card": CardPayment()})
OrderTaker(cashier).take("latte", 50)
# endregion

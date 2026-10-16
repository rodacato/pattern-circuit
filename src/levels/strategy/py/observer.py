from abc import ABC, abstractmethod


class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, order): ...


class Cashier:
    def __init__(self):
        self.subscribers = []

    def subscribe(self, payment_method):
        self.subscribers.append(payment_method)

    # Observer notifies everyone; here we had to pick one.
    # region: Cashier#charge
    def charge(self, order):
        for s in self.subscribers:
            s.charge(order)
    # endregion


class CashPayment(PaymentMethod):
    def __init__(self, barista):
        self.barista = barista

    # region: CashPayment#charge
    def charge(self, order):
        CashDrawer.collect(order.total)  # charges even though the customer paid by card
        self.barista.prepare(order)
    # endregion


class CardPayment(PaymentMethod):
    def __init__(self, barista):
        self.barista = barista

    # region: CardPayment#charge
    def charge(self, order):
        CardTerminal.charge(order.total)  # ...and here it charges again
        self.barista.prepare(order)
    # endregion


class VoucherPayment(PaymentMethod):
    def __init__(self, barista):
        self.barista = barista

    # region: VoucherPayment#charge
    def charge(self, order):
        VoucherBook.redeem(order.total)  # ...and again
        self.barista.prepare(order)
    # endregion

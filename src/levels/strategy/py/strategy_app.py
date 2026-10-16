from abc import ABC, abstractmethod


class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, order): ...


class Cashier:
    def __init__(self, payment_methods, barista):
        self.payment_methods = payment_methods
        self.barista = barista

    # Cashier no longer knows how to charge: only who to delegate to.
    # region: Cashier#charge
    def charge(self, order):
        self.payment_methods[order.payment].charge(order)
        self.barista.prepare(order)
    # endregion


class CashPayment(PaymentMethod):
    # region: CashPayment#charge
    def charge(self, order):
        CashDrawer.collect(order.total)
    # endregion


class CardPayment(PaymentMethod):
    # region: CardPayment#charge
    def charge(self, order):
        CardTerminal.charge(order.total)
    # endregion


class VoucherPayment(PaymentMethod):
    # region: VoucherPayment#charge
    def charge(self, order):
        VoucherBook.redeem(order.total)
    # endregion


# region: AppPayment#charge
class AppPayment(PaymentMethod):  # ← new cartridge, nothing else
    def charge(self, order):
        AppWallet.charge(order.total)
# endregion


# region: wiring
cashier = Cashier(
    {"cash": CashPayment(), "card": CardPayment(), "voucher": VoucherPayment(), "app": AppPayment()},
    barista,
)
# endregion

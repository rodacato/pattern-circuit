from abc import ABC, abstractmethod


# The full coffee shop: every piece is a pattern you already know.

# Builder: the order is assembled in named steps and validated before charging.
class OrderBuilder:
    def __init__(self):
        self.size_value = "medium"
        self.is_hot = False
        self.is_iced = False
        self.extras = []

    # region: OrderBuilder#size
    def size(self, value):
        self.size_value = value
        return self

    def hot(self):
        self.is_hot = True
        return self

    def iced(self):
        self.is_iced = True
        return self

    def extra(self, name):
        self.extras.append(name)
        return self
    # endregion

    # region: OrderBuilder#build
    def build(self):
        if self.is_hot and self.is_iced:
            raise InvalidOrder("hot and iced")
        return Order(size=self.size_value, extras=self.extras)
    # endregion


# Strategy: each payment method is a cartridge.
class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, order): ...


class Cashier:
    def __init__(self, payment_methods):
        self.payment_methods = payment_methods

    # region: Cashier#charge
    def charge(self, order):
        self.payment_methods[order.payment].charge(order)
    # endregion


# region: CashPayment#charge
class CashPayment(PaymentMethod):
    def charge(self, order):
        CashDrawer.collect(order.total)
# endregion


# region: CardPayment#charge
class CardPayment(PaymentMethod):
    def charge(self, order):
        PagoFacilAdapter(PagoFacil.SDK()).charge(order.total)  # Adapter
# endregion


# region: AppPayment#charge
class AppPayment(PaymentMethod):
    def charge(self, order):
        AppWallet.charge(order.total)
# endregion


# Command: orders wait in a queue and can be cancelled in time.
class CommandQueue:
    def __init__(self):
        self.pending = []

    # region: CommandQueue#push
    def push(self, command):
        self.pending.append(command)

    def cancel(self, order_id):
        self.pending = [c for c in self.pending if c.order_id != order_id]
    # endregion


# Facade: a simple door to the kitchen.
class KitchenFacade:
    # region: KitchenFacade#latte
    def latte(self, order):
        shot = EspressoMachine().extract(Grinder().grind("arabica"))
        milk = MilkFrother().froth(order.milk)
        order.complete([shot, milk])
    # endregion


# region: EspressoMachine#extract
class EspressoMachine:
    def extract(self, ground):
        return "espresso"
# endregion


# Observer: when the order is ready, all subscribers find out.
class Subscriber(ABC):
    @abstractmethod
    def update(self, order): ...


class Order:
    def __init__(self, size, extras):
        self.subscribers = []
        self.size = size
        self.extras = extras

    # region: Order#complete!
    def complete(self, drink):
        for s in self.subscribers:
            s.update(self)
    # endregion


class Display(Subscriber):
    # region: Display#update
    def update(self, order):
        print(f"Ticket {order.ticket} ready")
    # endregion


class LoyaltyProgram(Subscriber):
    # region: LoyaltyProgram#update
    def update(self, order):
        order.card.add_points(10)  # NullCard if it has no card
    # endregion


class Counter:
    # region: Counter#notify
    def notify(self, message):
        print(f"Before charging: {message}")
    # endregion

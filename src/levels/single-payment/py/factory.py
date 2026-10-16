# Factory Method to create a single payment type: a hierarchy of creators with one product.
VAT = 0.16


class PaymentFactory:
    # region: PaymentFactory#create
    def create(self):
        return CardPayment()
    # endregion


class CardPayment:
    def charge(self, total):
        CardTerminal.charge(total)


class Cashier:
    def __init__(self, barista, factory):
        self.barista = barista
        self.factory = factory

    # region: Cashier#charge
    def charge(self, order):
        self.factory.create().charge(order.price * (1 + VAT))
        self.barista.prepare(order)
    # endregion


# region: wiring
cashier = Cashier(Barista(Counter()), PaymentFactory())
OrderTaker(cashier).take("latte", 50)
# endregion

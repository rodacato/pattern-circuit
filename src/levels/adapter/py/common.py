# --- the rest of the coffee shop ---
class OrderTaker:
    def __init__(self, cashier):
        self.cashier = cashier

    # region: OrderTaker#take
    def take(self, order):
        self.cashier.charge(order)
    # endregion


# External vendor SDK: we cannot modify it.
class PagoFacil:
    class SDK:
        # region: PagoFacil::SDK#charge_in_cents
        def charge_in_cents(self, amount_cents, reference):
            return {"status": "ok"}
        # endregion


class Barista:
    def __init__(self, counter):
        self.counter = counter

    # region: Barista#prepare
    def prepare(self, order):
        self.counter.hand_over(order)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print(f"{order.drink} ready!")
    # endregion

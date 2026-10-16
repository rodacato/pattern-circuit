import uuid


class Cashier:
    def __init__(self, gateway, barista):
        self.gateway = gateway
        self.barista = barista

    # Cashier did not change: it still speaks its own language.
    # region: Cashier#charge
    def charge(self, order):
        self.gateway.charge(order.total)
        self.barista.prepare(order)
    # endregion


# Translates the interface Cashier expects into the one the SDK offers.
# region: PagoFacilAdapter#charge
class PagoFacilAdapter:
    def __init__(self, sdk):
        self.sdk = sdk

    def charge(self, total):
        self.sdk.charge_in_cents(amount_cents=round(total * 100), reference=str(uuid.uuid4()))
# endregion

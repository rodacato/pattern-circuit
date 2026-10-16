class Cashier:
    def __init__(self, gateway, barista):
        self.gateway = gateway  # now it is PagoFacil.SDK
        self.barista = barista

    # Cashier speaks "charge(total)"; the SDK understands "charge_in_cents". They do not fit.
    # region: Cashier#charge
    def charge(self, order):
        self.gateway.charge(order.total)  # AttributeError: PagoFacil.SDK has no charge()
        self.barista.prepare(order)
    # endregion

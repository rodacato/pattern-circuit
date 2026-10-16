class OrderFlow:
    def __init__(self, branch, barista):
        self.branch = branch
        self.barista = barista

    # Every new branch forces us to open the flow they all share.
    # region: OrderFlow#create_drink
    def create_drink(self):
        # region: OrderFlow#create_drink:downtown
        if self.branch == "downtown":
            return Latte()
        # endregion
        # region: OrderFlow#create_drink:beach
        elif self.branch == "beach":
            return Frappe()
        # endregion
        # region: OrderFlow#create_drink:harbor
        elif self.branch == "harbor":  # ← new: OrderFlow modified
            return IcedTea()
        # endregion
        # region: OrderFlow#create_drink:else
        else:
            return Latte()  # Mountain still gets lattes
        # endregion
    # endregion

    def take(self, order):
        self.barista.prepare(self.create_drink())

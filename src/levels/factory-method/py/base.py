class OrderFlow:
    def __init__(self, branch, barista):
        self.branch = branch
        self.barista = barista

    # The shared flow knows every concrete drink of every branch.
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
        # region: OrderFlow#create_drink:else
        else:
            return Latte()  # Mountain? Nobody planned for it: it gets a latte
        # endregion
    # endregion

    def take(self, order):
        self.barista.prepare(self.create_drink())

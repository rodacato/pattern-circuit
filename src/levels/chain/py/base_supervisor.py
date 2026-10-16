class Cashier:
    def __init__(self):
        self.refunds = Refunds()

    # The cashier knows everyone who approves and decides who to send each case to.
    # region: Cashier#refund
    def refund(self, request):
        # region: Cashier#refund:amount:low
        if request.amount < 100:
            self.refunds.pay(request)
        # endregion
        # region: Cashier#refund:amount:medium
        elif request.amount < 500:
            Manager().approve(request)
        # endregion
        # region: Cashier#refund:amount:medium-high
        elif request.amount < 1000:
            Supervisor().approve(request)  # ← Cashier modified
        # endregion
        # region: Cashier#refund:amount:high
        elif request.amount < 2000:
            Owner().approve(request)
        # endregion
        # region: Cashier#refund:else
        else:
            raise Exception("Now who?")  # nobody thought of huge amounts
        # endregion
    # endregion


# region: Manager#approve
class Manager:
    def __init__(self):
        self.refunds = Refunds()

    def approve(self, request):
        self.refunds.pay(request)
# endregion


# region: Owner#approve
class Owner:
    def __init__(self):
        self.refunds = Refunds()

    def approve(self, request):
        self.refunds.pay(request)
# endregion


# region: Supervisor#approve
class Supervisor:
    def __init__(self):
        self.refunds = Refunds()

    def approve(self, request):
        self.refunds.pay(request)
# endregion

# region: Clerk#approve
class Clerk:
    def __init__(self):
        self.refunds = Refunds()

    def approve(self, request):
        self.refunds.pay(request)
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


class Cashier:
    APPROVERS = {"low": Clerk, "medium": Manager, "high": Owner}

    # Choosing an approver by category works… as long as you know all the categories in advance.
    # region: Cashier#refund
    def refund(self, request):
        Cashier.APPROVERS[request.category]().approve(request)  # KeyError with huge amounts
    # endregion

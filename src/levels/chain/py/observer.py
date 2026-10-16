class Cashier:
    def __init__(self):
        self.approvers = [Manager(), Owner()]

    # Notify all the approvers: each one approves… and the refund is paid several times.
    # region: Cashier#refund
    def refund(self, request):
        for a in self.approvers:
            a.approve(request)
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

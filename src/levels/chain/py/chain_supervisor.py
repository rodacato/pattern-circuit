from abc import ABC, abstractmethod


# Each link handles its own or passes it to the next. Nobody knows the whole chain.
class Handler(ABC):
    def __init__(self, next_handler=None):
        self.refunds = Refunds()
        self.next = next_handler

    @abstractmethod
    def can_handle(self, r):
        ...

    def handle(self, request):
        if self.can_handle(request):
            self.refunds.pay(request)
        else:
            self.pass_on(request)

    def pass_on(self, request):
        if self.next:
            self.next.handle(request)
        else:
            self.refunds.decline(request)


# region: Cashier#handle
class Cashier(Handler):
    def can_handle(self, r):
        return r.amount < 100
# endregion


# region: Manager#handle
class Manager(Handler):
    def can_handle(self, r):
        return r.amount < 500
# endregion


# region: Supervisor#handle
class Supervisor(Handler):  # ← a new link; the others don't change
    def can_handle(self, r):
        return r.amount < 1000
# endregion


# region: Owner#handle
class Owner(Handler):
    def can_handle(self, r):
        return r.amount < 2000
# endregion


# region: wiring
chain = Cashier(Manager(Supervisor(Owner())))
# endregion

# The same outside world as prelude.rb, for Python: things the examples talk to but never define.
# They do nothing and print nothing, so what a snippet outputs is only its own.
class _Quiet:
    def __getattr__(self, name):
        return lambda *args, **kwargs: self


CardTerminal = CashDrawer = VoucherBook = Stripe = PG = HTTP = _Quiet()


class _Barista:
    def prepare(self, *args):
        return None


barista = _Barista()


class PayHandler:
    def apply(self, *args):
        return "done"


class PrepareHandler(PayHandler):
    pass


class DeliverHandler(PayHandler):
    pass


class CancelHandler(PayHandler):
    pass

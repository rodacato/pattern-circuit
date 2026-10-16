

# Notify the barista of the cancellation… who treats it as just another order.
# region: CancelBroadcast
class CancelBroadcast:
    def __init__(self, subscribers):
        self.subscribers = subscribers

    def call(self, request):
        for s in self.subscribers:
            s.prepare(request.drink)
# endregion

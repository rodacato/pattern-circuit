# An order turned into an object: it can be saved, queued, run later… or undone.
class OrderCommand:
    def __init__(self, barista, drink, order_id):
        self.barista = barista
        self.drink = drink
        self.order_id = order_id

    def execute(self):
        self.barista.prepare(self.drink)


class FrontDesk:
    def __init__(self, barista, queue):
        self.barista = barista
        self.queue = queue

    # region: FrontDesk#submit
    def submit(self, request):
        if request.action == "cancel":
            return self.queue.cancel(request.order_id)
        self.queue.push(OrderCommand(self.barista, request.drink, request.order_id))
    # endregion


class CommandQueue:
    def __init__(self):
        self.pending = []

    # Commands wait their turn; undoing is taking them out of the queue before they run.
    # region: CommandQueue#push
    def push(self, command):
        self.pending.append(command)

    def cancel(self, order_id):
        self.pending = [c for c in self.pending if c.order_id != order_id]

    def run_next(self):
        if self.pending:
            self.pending.pop(0).execute()
    # endregion

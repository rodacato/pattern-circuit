# Each order event is a command: it is queued and can be withdrawn before it runs.
class OrderEventCommand:
    def __init__(self, order, event, id):
        self.order = order
        self.event = event
        self.id = id

    def execute(self):
        self.order.handle(self.event)


class FrontDesk:
    def __init__(self, queue, order):
        self.queue = queue
        self.order = order

    # region: FrontDesk#submit
    def submit(self, request):
        if request.undo:
            return self.queue.cancel(request.command_id)
        self.queue.push(OrderEventCommand(self.order, request.event, request.command_id))
    # endregion


class CommandQueue:
    def __init__(self):
        self.pending = []

    # region: CommandQueue#push
    def push(self, command):
        self.pending.append(command)

    def cancel(self, command_id):
        self.pending = [c for c in self.pending if c.id != command_id]

    def run_next(self):
        if self.pending:
            self.pending.pop(0).execute()
    # endregion

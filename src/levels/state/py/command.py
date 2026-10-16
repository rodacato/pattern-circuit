

# Queueing events as commands doesn't change what is allowed: the queue runs them anyway.
# region: EventQueue
class EventCommand:
    def __init__(self, order, event):
        self.order = order
        self.event = event

    def execute(self):
        self.order.handle(self.event)


class EventQueue:
    def __init__(self):
        self.commands = []

    def push(self, command):
        self.commands.append(command)

    def run(self):
        for c in self.commands:  # runs them in order, whether they make sense or not
            c.execute()
# endregion

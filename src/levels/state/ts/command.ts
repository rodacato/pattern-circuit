// Queueing events as commands doesn't change what is allowed: the queue runs them anyway.
// region: EventQueue
class EventCommand {
  constructor(private order: Order, private event: string) {}
  execute() { this.order.handle(this.event) }
}

class EventQueue {
  private commands: EventCommand[] = []
  push(command: EventCommand) { this.commands.push(command) }
  run() { this.commands.forEach((c) => c.execute()) } // runs them in order, whether they make sense or not
}
// endregion

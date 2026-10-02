// Encolar los eventos como comandos no cambia qué se permite: la cola los ejecuta igual.
// region: EventQueue
class EventCommand {
  constructor(private order: Order, private event: string) {}
  execute() { this.order.handle(this.event) }
}

class EventQueue {
  private commands: EventCommand[] = []
  push(command: EventCommand) { this.commands.push(command) }
  run() { this.commands.forEach((c) => c.execute()) } // los ejecuta en orden, tengan sentido o no
}
// endregion

// --- el resto de la cafetería ---
type Order = { register: string; ticket?: number }

class Lobby {
  constructor(private registers: Record<string, Register>) {}

  // region: Lobby#route
  route(order: Order) { this.registers[order.register].checkout(order) }
  // endregion
}

class Display {
  // region: Display#show
  show(order: Order) { console.log(`Turno ${order.ticket}`) }
  // endregion
}

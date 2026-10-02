// --- el resto de la cafetería ---
class Tray {
  private parts: Product[] = []

  constructor(private counter: Counter) {}

  // region: Tray#collect
  collect(parts: Product[]) { this.parts.push(...parts) } // espera todas las partes del pedido
  // endregion

  // region: Tray#serve
  serve() { this.counter.handOver(this.parts) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(parts: Product[]) { console.log(`Bandeja con ${parts.length} cosas`) }
  // endregion
}

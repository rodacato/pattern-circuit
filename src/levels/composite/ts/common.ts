// --- the rest of the coffee shop ---
class Tray {
  private parts: Product[] = []

  constructor(private counter: Counter) {}

  // region: Tray#collect
  collect(parts: Product[]) { this.parts.push(...parts) } // expects all the parts of the order
  // endregion

  // region: Tray#serve
  serve() { this.counter.handOver(this.parts) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(parts: Product[]) { console.log(`Tray with ${parts.length} items`) }
  // endregion
}

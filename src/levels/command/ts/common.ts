// --- the rest of the coffee shop ---
type OrderRequest = { action: string; drink: string; orderId: number }

class Barista {
  private pickup = new Pickup()

  // region: Barista#prepare
  prepare(drink: string) { this.pickup.handOver(drink) }
  // endregion
}

class Pickup {
  // region: Pickup#hand_over
  handOver(drink: string) { console.log(`${drink} ready!`) }
  // endregion
}

// --- el resto de la cafetería ---
type DrinkRequest = { extras: string[] }

interface Drink {
  cost(): number
  description(): string
}

class OrderTaker {
  constructor(
    private menu: Menu,
    private barista: Barista,
  ) {}

  // region: OrderTaker#take
  take(request: DrinkRequest) { this.barista.prepare(this.menu.drinkFor(request)) }
  // endregion
}

class Barista {
  constructor(private counter: Counter) {}

  // region: Barista#prepare
  prepare(drink: Drink) { this.counter.handOver(drink) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(drink: Drink) { console.log(`${drink.description()}: $${drink.cost()}`) }
  // endregion
}

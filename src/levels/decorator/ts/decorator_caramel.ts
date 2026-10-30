// region: Latte
class Latte implements Drink {
  cost() { return 45 }
  description() { return 'Latte' }
}
// endregion

// Each extra wraps the drink and adds its own cost. They combine on their own.
// region: WithOatMilk
class WithOatMilk implements Drink {
  constructor(private drink: Drink) {}
  cost() { return this.drink.cost() + 8 }
  description() { return `${this.drink.description()} with oat` }
}
// endregion

// region: WithShot
class WithShot implements Drink {
  constructor(private drink: Drink) {}
  cost() { return this.drink.cost() + 10 }
  description() { return `${this.drink.description()} with shot` }
}
// endregion

// region: WithCinnamon
class WithCinnamon implements Drink {
  constructor(private drink: Drink) {}
  cost() { return this.drink.cost() + 5 }
  description() { return `${this.drink.description()} with cinnamon` }
}
// endregion

// region: WithCaramel
class WithCaramel implements Drink { // ← a new extra: one class plus its entry in EXTRAS
  constructor(private drink: Drink) {}
  cost() { return this.drink.cost() + 7 }
  description() { return `${this.drink.description()} with caramel` }
}
// endregion

class Menu {
  static EXTRAS: Record<string, new (drink: Drink) => Drink> = { oat: WithOatMilk, shot: WithShot, cinnamon: WithCinnamon, caramel: WithCaramel }

  // region: Menu#drink_for
  drinkFor(request: DrinkRequest): Drink {
    return request.extras.reduce<Drink>((drink, extra) => new Menu.EXTRAS[extra](drink), new Latte())
  }
  // endregion
}

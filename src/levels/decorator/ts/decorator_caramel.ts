// region: Latte
class Latte implements Drink {
  cost() { return 45 }
  description() { return 'Latte' }
}
// endregion

// Cada extra envuelve a la bebida y suma lo suyo. Se combinan solos.
// region: WithOatMilk
class WithOatMilk implements Drink {
  constructor(private drink: Drink) {}
  cost() { return this.drink.cost() + 8 }
  description() { return `${this.drink.description()} con avena` }
}
// endregion

// region: WithShot
class WithShot implements Drink {
  constructor(private drink: Drink) {}
  cost() { return this.drink.cost() + 10 }
  description() { return `${this.drink.description()} con shot` }
}
// endregion

// region: WithCinnamon
class WithCinnamon implements Drink {
  constructor(private drink: Drink) {}
  cost() { return this.drink.cost() + 5 }
  description() { return `${this.drink.description()} con canela` }
}
// endregion

// region: WithCaramel
class WithCaramel implements Drink { // ← un extra nuevo: una clase, nada más
  constructor(private drink: Drink) {}
  cost() { return this.drink.cost() + 7 }
  description() { return `${this.drink.description()} con caramelo` }
}
// endregion

class Menu {
  static EXTRAS: Record<string, new (drink: Drink) => Drink> = { avena: WithOatMilk, shot: WithShot, canela: WithCinnamon, caramelo: WithCaramel }

  // region: Menu#drink_for
  drinkFor(request: DrinkRequest): Drink {
    return request.extras.reduce<Drink>((drink, extra) => new Menu.EXTRAS[extra](drink), new Latte())
  }
  // endregion
}

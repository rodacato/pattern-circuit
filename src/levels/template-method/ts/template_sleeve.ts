// The recipe skeleton lives in one place; subclasses only fill in `brew`.
abstract class Recipe {
  protected cup = new Cup()

  // region: Recipe#make
  make() {
    this.boilWater()
    this.brew()
    this.pourInCup()
    this.putLid()
    this.addSleeve() // ← a single place
  }
  // endregion

  // region: Recipe#boil_water
  boilWater() { this.heat('water', 92) }
  // endregion

  // region: Recipe#pour_in_cup
  pourInCup() { this.cup.fill() }
  // endregion

  // region: Recipe#put_lid
  putLid() { this.cup.lid() }
  // endregion

  // region: Recipe#add_sleeve
  addSleeve() { this.cup.sleeve() }
  // endregion

  abstract brew(): void
}

class CoffeeRecipe extends Recipe {
  // region: CoffeeRecipe#brew
  brew() { this.extractEspresso() }
  // endregion
}

class TeaRecipe extends Recipe {
  // region: TeaRecipe#brew
  brew() { this.steep(3 * 60) }
  // endregion
}

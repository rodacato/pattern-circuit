class CoffeeRecipe {
  // region: CoffeeRecipe#make
  make() {
    this.boilWater()
    this.extract()
    this.pourInCup()
    this.putLid()
  }
  // endregion
}

class TeaRecipe {
  // Copy of the coffee recipe… that forgot the lid.
  // region: TeaRecipe#make
  make() {
    this.boilWater()
    this.steep()
    this.pourInCup()
  }
  // endregion
}

// Building the cup step by step before the recipe does not touch the tea recipe.
// region: CupBuilder
class CupBuilder {
  private cupSize = ''
  size(s: string) { this.cupSize = s; return this }
  build() { return new Cup(this.cupSize) }
}
// endregion

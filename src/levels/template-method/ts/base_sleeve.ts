class CoffeeRecipe {
  // region: CoffeeRecipe#make
  make() {
    this.boilWater()
    this.extract()
    this.pourInCup()
    this.putLid()
    this.addSleeve() // ← change 1
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
    this.addSleeve() // ← change 2: the same line in the other copy
  }
  // endregion
}

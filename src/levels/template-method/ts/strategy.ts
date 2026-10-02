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

// Picking the recipe as a strategy does not remove the duplication: they are two complete algorithms.
// region: RecipeStrategy
const RECIPES = { coffee: CoffeeRecipe, tea: TeaRecipe }
// endregion

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
  // Copia de la receta del café… a la que se le olvidó la tapa.
  // region: TeaRecipe#make
  make() {
    this.boilWater()
    this.steep()
    this.pourInCup()
  }
  // endregion
}

// Armar la taza paso a paso antes de la receta no toca la receta del té.
// region: CupBuilder
class CupBuilder {
  private cupSize = ''
  size(s: string) { this.cupSize = s; return this }
  build() { return new Cup(this.cupSize) }
}
// endregion

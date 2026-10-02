class CoffeeRecipe {
  // region: CoffeeRecipe#make
  make() {
    this.boilWater()
    this.extract()
    this.pourInCup()
    this.putLid()
    this.addSleeve() // ← cambio 1
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
    this.addSleeve() // ← cambio 2: la misma línea en la otra copia
  }
  // endregion
}

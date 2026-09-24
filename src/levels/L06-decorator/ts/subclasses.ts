class Latte implements Drink {
  cost() { return 45 }
  description() { return 'Latte' }
}

// Una subclase por cada combinación de extras.
// region: LatteConAvena
class LatteConAvena extends Latte {
  cost() { return super.cost() + 8 }
  description() { return 'Latte con avena' }
}
// endregion

// region: LatteConShot
class LatteConShot extends Latte {
  cost() { return super.cost() + 10 }
  description() { return 'Latte con shot' }
}
// endregion

// region: LatteConAvenaYShot
class LatteConAvenaYShot extends Latte {
  cost() { return super.cost() + 18 }
  description() { return 'Latte con avena y shot' }
}
// endregion

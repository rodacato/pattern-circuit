class Latte implements Drink {
  cost() { return 45 }
  description() { return 'Latte' }
}

// One subclass for each combination of extras.
// region: OatMilkLatte
class OatMilkLatte extends Latte {
  cost() { return super.cost() + 8 }
  description() { return 'Latte with oat' }
}
// endregion

// region: ShotLatte
class ShotLatte extends Latte {
  cost() { return super.cost() + 10 }
  description() { return 'Latte with shot' }
}
// endregion

// region: OatShotLatte
class OatShotLatte extends Latte {
  cost() { return super.cost() + 18 }
  description() { return 'Latte with oat and shot' }
}
// endregion

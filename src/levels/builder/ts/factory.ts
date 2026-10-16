// Factory Method: each preset is a subclass that decides which order to create.
abstract class PresetOrders {
  // region: OrderPresets#create
  abstract createOrder(): Order
  // endregion
}

class LargeLattePreset extends PresetOrders {
  createOrder() { return new Order('large', 'whole', 1, null, 'hot', false, null, null, null) }
}

class AmericanoPreset extends PresetOrders {
  createOrder() { return new Order('medium', null, 2, null, 'hot', false, null, null, null) }
}

// Large latte with oat, vanilla and two shots? There is no subclass for that.
// 4 sizes × 5 milks × 6 syrups × 2 temperatures = 240 subclasses.
const PRESETS: Record<string, new () => PresetOrders> = { 'combo:large-latte': LargeLattePreset, 'combo:americano': AmericanoPreset }

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // region: OrderTaker#take
  take(request: OrderRequest) {
    const preset = PRESETS[request.combo]
    if (!preset) return // no preset: the order is lost
    this.cashier.charge(new preset().createOrder())
  }
  // endregion
}

// Factory Method: cada preset es una subclase que decide qué pedido crear.
abstract class PresetOrders {
  // region: OrderPresets#create
  abstract createOrder(): Order
  // endregion
}

class LatteGrandePreset extends PresetOrders {
  createOrder() { return new Order('grande', 'entera', 1, null, 'caliente', false, null, null, null) }
}

class AmericanoPreset extends PresetOrders {
  createOrder() { return new Order('mediano', null, 2, null, 'caliente', false, null, null, null) }
}

// ¿Latte grande con avena, vainilla y dos shots? No hay subclase para eso.
// 4 tamaños × 5 leches × 6 jarabes × 2 temperaturas = 240 subclases.
const PRESETS: Record<string, new () => PresetOrders> = { 'combo:latte-grande': LatteGrandePreset, 'combo:americano': AmericanoPreset }

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // region: OrderTaker#take
  take(request: OrderRequest) {
    const preset = PRESETS[request.combo]
    if (!preset) return // sin molde: el pedido se pierde
    this.cashier.charge(new preset().createOrder())
  }
  // endregion
}

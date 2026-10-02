// --- el resto de la cafetería ---
type Order = { drink: string; total: number }

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // region: OrderTaker#take
  take(order: Order) { this.cashier.charge(order) }
  // endregion
}

// SDK del proveedor externo: no lo podemos modificar.
namespace PagoFacil {
  export class SDK {
    // region: PagoFacil::SDK#cobrar_en_centavos
    cobrarEnCentavos({ montoCentavos, referencia }: { montoCentavos: number; referencia: string }) { return { estado: 'ok' } }
    // endregion
  }
}

class Barista {
  constructor(private counter: Counter) {}

  // region: Barista#prepare
  prepare(order: Order) { this.counter.handOver(order) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) { console.log(`¡${order.drink} listo!`) }
  // endregion
}

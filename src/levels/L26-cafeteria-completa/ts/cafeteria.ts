// La cafetería completa: cada pieza es un patrón que ya conoces.

// Builder: el pedido se arma por pasos con nombre y se valida antes de cobrar.
class OrderBuilder {
  private sizeValue = 'mediano'
  private isHot = false
  private isIced = false
  private extras: string[] = []

  // region: OrderBuilder#size
  size(value: string) { this.sizeValue = value; return this }
  hot() { this.isHot = true; return this }
  iced() { this.isIced = true; return this }
  extra(name: string) { this.extras.push(name); return this }
  // endregion

  // region: OrderBuilder#build
  build() {
    if (this.isHot && this.isIced) throw new InvalidOrder('caliente y con hielo')
    return new Order({ size: this.sizeValue, extras: this.extras })
  }
  // endregion
}

// Strategy: cada forma de pago es un cartucho.
interface PaymentMethod {
  charge(order: Order): void
}

class Cashier {
  constructor(private paymentMethods: Record<string, PaymentMethod>) {}

  // region: Cashier#charge
  charge(order: Order) { this.paymentMethods[order.payment].charge(order) }
  // endregion
}

// region: CashPayment#charge
class CashPayment implements PaymentMethod {
  charge(order: Order) { CashDrawer.collect(order.total) }
}
// endregion

// region: CardPayment#charge
class CardPayment implements PaymentMethod {
  charge(order: Order) { new PagoFacilAdapter(new PagoFacil.SDK()).charge(order.total) } // Adapter
}
// endregion

// region: AppPayment#charge
class AppPayment implements PaymentMethod {
  charge(order: Order) { AppWallet.charge(order.total) }
}
// endregion

// Command: los pedidos esperan en cola y se pueden cancelar a tiempo.
type OrderCommand = { orderId: number; execute(): void }

class CommandQueue {
  private pending: OrderCommand[] = []

  // region: CommandQueue#push
  push(command: OrderCommand) { this.pending.push(command) }
  cancel(orderId: number) { this.pending = this.pending.filter((c) => c.orderId !== orderId) }
  // endregion
}

// Facade: una puerta simple a la cocina.
class KitchenFacade {
  // region: KitchenFacade#latte
  latte(order: Order) {
    const shot = new EspressoMachine().extract(new Grinder().grind('arabica'))
    const milk = new MilkFrother().froth(order.milk)
    order.complete([shot, milk])
  }
  // endregion
}

// region: EspressoMachine#extract
class EspressoMachine {
  extract(ground: string) { return 'espresso' }
}
// endregion

// Observer: cuando el pedido está listo, se enteran todos los suscriptores.
interface Subscriber {
  update(order: Order): void
}

class Order {
  private subscribers: Subscriber[] = []
  constructor(private details: { size: string; extras: string[] }) {}

  // region: Order#complete!
  complete(drink: string[]) { this.subscribers.forEach((s) => s.update(this)) }
  // endregion
}

class Display implements Subscriber {
  // region: Display#update
  update(order: Order) { console.log(`Turno ${order.ticket} listo`) }
  // endregion
}

class LoyaltyProgram implements Subscriber {
  // region: LoyaltyProgram#update
  update(order: Order) { order.card.addPoints(10) } // NullCard si no tiene tarjeta
  // endregion
}

class Counter {
  // region: Counter#notify
  notify(message: string) { console.log(`Antes de cobrar: ${message}`) }
  // endregion
}

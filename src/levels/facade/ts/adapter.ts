
// Traduce el pedido de la app al formato del mostrador… pero la orquestación incompleta sigue ahí.
// region: DeliveryRequestAdapter
class DeliveryRequestAdapter {
  constructor(private app: DeliveryApp) {}
  makeLatte() { this.app.makeLatte() }
}
// endregion

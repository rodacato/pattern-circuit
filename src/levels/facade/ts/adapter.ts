
// Translates the app's request to the counter's format… but the incomplete orchestration is still there.
// region: DeliveryRequestAdapter
class DeliveryRequestAdapter {
  constructor(private app: DeliveryApp) {}
  makeLatte() { this.app.makeLatte() }
}
// endregion

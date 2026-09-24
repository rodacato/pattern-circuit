
// Traducir la tarjeta al formato de otro sistema no ayuda cuando no hay tarjeta que traducir.
// region: CardAdapter
class CardAdapter {
  constructor(private card: TarjetaExterna) {}
  addPoints(amount: number) { this.card.sumarPuntos(amount) }
}
// endregion

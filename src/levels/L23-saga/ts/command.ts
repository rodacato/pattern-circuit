
// Un comando con undo sirve para estado local; aquí nadie coordina qué deshacer cuando falla otro servicio.
// region: ChargeCommand
class ChargeCommand {
  execute(order: Order) { Payments.charge(order) }
  undo(order: Order) { Payments.refund(order) } // ¿quién lo llama cuando falla Inventory, en otro servicio?
}
// endregion

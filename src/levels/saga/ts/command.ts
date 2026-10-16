
// A command with undo works for local state; here nobody coordinates what to undo when another service fails.
// region: ChargeCommand
class ChargeCommand {
  execute(order: Order) { Payments.charge(order) }
  undo(order: Order) { Payments.refund(order) } // who calls it when Inventory fails, in another service?
}
// endregion

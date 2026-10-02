
# A command with undo works for local state; here nobody coordinates what to undo when another service fails.
# region: ChargeCommand
class ChargeCommand
  def execute(order) = Payments.charge(order)
  def undo(order) = Payments.refund(order) # who calls it when Inventory fails, in another service?
end
# endregion

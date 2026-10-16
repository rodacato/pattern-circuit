
# A command with undo works for local state; here nobody coordinates what to undo when another service fails.
# region: ChargeCommand
class ChargeCommand:
    def execute(self, order):
        Payments.charge(order)

    def undo(self, order):
        Payments.refund(order)  # who calls it when Inventory fails, in another service?
# endregion

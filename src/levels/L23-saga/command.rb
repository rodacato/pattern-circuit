
# Un comando con undo sirve para estado local; aquí nadie coordina qué deshacer cuando falla otro servicio.
# region: ChargeCommand
class ChargeCommand
  def execute(order) = Payments.charge(order)
  def undo(order) = Payments.refund(order) # ¿quién lo llama cuando falla Inventory, en otro servicio?
end
# endregion

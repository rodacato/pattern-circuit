
# Command deshace lo que todavía no se ejecutó; el cobro ya pasó por el banco.
# region: ChargeCommand
class ChargeCommand
  def undo = raise("El cobro ya se procesó: no está en ninguna cola")
end
# endregion

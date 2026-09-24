
# Una estrategia por tipo de ítem… y ninguna sabe qué hacer con un combo anidado.
# region: ComboStrategy
class ComboStrategy
  def prepare(combo) = raise(NotImplementedError, "combo anidado")
end
# endregion

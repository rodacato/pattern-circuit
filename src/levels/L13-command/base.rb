class FrontDesk
  # Cada pedido se ejecuta en el acto: no queda nada que se pueda deshacer.
  # region: FrontDesk#submit
  def submit(request)
    # region: FrontDesk#submit:cmd:pedir
    case request.action
    when :pedir then @barista.prepare(request.drink)
    # endregion
    # region: FrontDesk#submit:cmd:cancelar
    when :cancelar then Undo.new.call(request)
    # endregion
    end
  end
  # endregion
end

# region: Undo#call
class Undo
  def call(request) = raise "¿Deshacer qué? El café ya se está haciendo"
end
# endregion

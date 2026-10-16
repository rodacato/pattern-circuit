class FrontDesk
  # Each order runs on the spot: there is nothing left to undo.
  # region: FrontDesk#submit
  def submit(request)
    # region: FrontDesk#submit:cmd:order
    case request.action
    when :order then @barista.prepare(request.drink)
    # endregion
    # region: FrontDesk#submit:cmd:cancel
    when :cancel then Undo.new.call(request)
    # endregion
    end
  end
  # endregion
end

# region: Undo#call
class Undo
  def call(request) = raise "Undo what? The coffee is already being made"
end
# endregion

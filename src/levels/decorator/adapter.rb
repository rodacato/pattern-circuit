class Menu
  # region: Menu#drink_for
  def drink_for(request)
    LegacyMenuAdapter.new(OldPos.new).drink_for(request)
  end
  # endregion
end

# Translates the request to the old POS format… which doesn't know combinations either.
# region: LegacyMenuAdapter
class LegacyMenuAdapter
  def initialize(pos) = @pos = pos
  def drink_for(request) = @pos.lookup(request.extras.join("+"))
end
# endregion

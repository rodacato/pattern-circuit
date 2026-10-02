# Una sola instancia del cliente remoto… que sigue viajando al almacén en cada consulta.
# region: RemoteInventory.instance
class RemoteInventory
  def self.instance = @instance ||= new
end
# endregion

# region: wiring
taker = OrderTaker.new(RemoteInventory.instance, barista)
# endregion

// Una sola instancia del cliente remoto… que sigue viajando al almacén en cada consulta.
// region: RemoteInventory.instance
namespace RemoteInventory {
  let shared: RemoteInventory | undefined
  export const instance = () => (shared ??= new RemoteInventory())
}
// endregion

// region: wiring
const taker = new OrderTaker(RemoteInventory.instance(), barista)
// endregion

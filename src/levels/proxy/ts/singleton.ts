// A single instance of the remote client… that still travels to the warehouse on every query.
// region: RemoteInventory.instance
namespace RemoteInventory {
  let shared: RemoteInventory | undefined
  export const instance = () => (shared ??= new RemoteInventory())
}
// endregion

// region: wiring
const taker = new OrderTaker(RemoteInventory.instance(), barista)
// endregion

// A single instance of the remote client… that still travels to the warehouse on every query.
// region: RemoteInventory.instance
let sharedInventory: RemoteInventory | undefined
const remoteInventory = () => (sharedInventory ??= new RemoteInventory())
// endregion

// region: wiring
const taker = new OrderTaker(remoteInventory(), barista)
// endregion

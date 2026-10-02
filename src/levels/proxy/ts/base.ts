// Every order queries the remote warehouse, even the tenth time we ask about coffee.
// region: wiring
const taker = new OrderTaker(new RemoteInventory(), barista)
// endregion

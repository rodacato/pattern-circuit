// Cada pedido consulta al almacén remoto, aunque sea la décima vez que preguntamos por café.
// region: wiring
const taker = new OrderTaker(new RemoteInventory(), barista)
// endregion

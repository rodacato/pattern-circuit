// --- el resto de la cafetería ---
class History {
  // region: History#record
  record(order: Order, event: string) { console.log(`${event} → ${order.status}`) }
  // endregion

  // region: History#reject
  reject(order: Order, event: string) { console.log(`${event} no aplica cuando el pedido está ${order.status}`) }
  // endregion
}

// --- the rest of the coffee shop ---
class History {
  // region: History#record
  record(order: Order, event: string) { console.log(`${event} → ${order.status}`) }
  // endregion

  // region: History#reject
  reject(order: Order, event: string) { console.log(`${event} does not apply when the order is ${order.status}`) }
  // endregion
}

// --- the rest of the coffee shop ---
type RefundRequest = { amount: number; category: string }

class Refunds {
  // region: Refunds#pay
  pay(request: RefundRequest) { console.log(`Refunded: $${request.amount}`) }
  // endregion

  // region: Refunds#decline
  decline(request: RefundRequest) { console.log(`Nobody can approve $${request.amount}: the customer is notified`) }
  // endregion
}

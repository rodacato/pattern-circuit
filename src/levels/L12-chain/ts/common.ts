// --- el resto de la cafetería ---
type RefundRequest = { amount: number; category: string }

class Refunds {
  // region: Refunds#pay
  pay(request: RefundRequest) { console.log(`Reembolsado: $${request.amount}`) }
  // endregion

  // region: Refunds#decline
  decline(request: RefundRequest) { console.log(`Nadie puede aprobar $${request.amount}: se avisa al cliente`) }
  // endregion
}

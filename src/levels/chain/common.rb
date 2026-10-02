# --- the rest of the coffee shop ---
class Refunds
  # region: Refunds#pay
  def pay(request) = puts("Refunded: $#{request.amount}")
  # endregion

  # region: Refunds#decline
  def decline(request) = puts("Nobody can approve $#{request.amount}: the customer is notified")
  # endregion
end

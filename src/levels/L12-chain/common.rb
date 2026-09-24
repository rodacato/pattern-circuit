# --- el resto de la cafetería ---
class Refunds
  # region: Refunds#pay
  def pay(request) = puts("Reembolsado: $#{request.amount}")
  # endregion

  # region: Refunds#decline
  def decline(request) = puts("Nadie puede aprobar $#{request.amount}: se avisa al cliente")
  # endregion
end

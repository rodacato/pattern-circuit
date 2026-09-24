class Cashier
  # Avisar a todos los aprobadores: cada uno aprueba… y el reembolso se paga varias veces.
  # region: Cashier#refund
  def refund(request) = @approvers.each { |a| a.approve(request) }
  # endregion
end

# region: Manager#approve
class Manager
  def approve(request) = @refunds.pay(request)
end
# endregion

# region: Owner#approve
class Owner
  def approve(request) = @refunds.pay(request)
end
# endregion

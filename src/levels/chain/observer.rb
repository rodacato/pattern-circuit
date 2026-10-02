class Cashier
  # Notify all the approvers: each one approves… and the refund is paid several times.
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

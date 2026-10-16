# region: Clerk#approve
class Clerk
  def approve(request) = @refunds.pay(request)
end
# endregion

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

class Cashier
  APPROVERS = { low: Clerk, medium: Manager, high: Owner }

  # Choosing an approver by category works… as long as you know all the categories in advance.
  # region: Cashier#refund
  def refund(request) = APPROVERS.fetch(request.category).new.approve(request) # KeyError with huge amounts
  # endregion
end

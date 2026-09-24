class Cashier
  APPROVERS = { bajo: Refunds, medio: Manager, alto: Owner }

  # Elegir aprobador por categoría funciona… mientras sepas de antemano todas las categorías.
  # region: Cashier#refund
  def refund(request) = APPROVERS.fetch(request.category).new.approve(request) # KeyError con montos enormes
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

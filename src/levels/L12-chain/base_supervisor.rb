class Cashier
  # El cajero conoce a todos los que aprueban y decide a quién mandarle cada caso.
  # region: Cashier#refund
  def refund(request)
    # region: Cashier#refund:monto:bajo
    if request.amount < 100 then @refunds.pay(request)
    # endregion
    # region: Cashier#refund:monto:medio
    elsif request.amount < 500 then Manager.new.approve(request)
    # endregion
    # region: Cashier#refund:monto:medio-alto
    elsif request.amount < 1000 then Supervisor.new.approve(request) # ← Cashier modificado
    # endregion
    # region: Cashier#refund:monto:alto
    elsif request.amount < 2000 then Owner.new.approve(request)
    # endregion
    # region: Cashier#refund:else
    else raise "¿Y ahora quién?" # nadie pensó en montos enormes
    # endregion
    end
  end
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

# region: Supervisor#approve
class Supervisor
  def approve(request) = @refunds.pay(request)
end
# endregion

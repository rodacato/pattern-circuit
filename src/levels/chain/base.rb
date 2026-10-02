class Cashier
  # The cashier knows everyone who approves and decides who to send each case to.
  # region: Cashier#refund
  def refund(request)
    # region: Cashier#refund:amount:low
    if request.amount < 100 then @refunds.pay(request)
    # endregion
    # region: Cashier#refund:amount:medium
    elsif request.amount < 500 then Manager.new.approve(request)
    # endregion
    # region: Cashier#refund:amount:high
    elsif request.amount < 2000 then Owner.new.approve(request)
    # endregion
    # region: Cashier#refund:else
    else raise "Now who?" # nobody thought of huge amounts
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

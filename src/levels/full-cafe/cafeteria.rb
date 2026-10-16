# The full coffee shop: every piece is a pattern you already know.

# Builder: the order is assembled in named steps and validated before charging.
class OrderBuilder
  # region: OrderBuilder#size
  def size(value) = tap { @size = value }
  def hot = tap { @hot = true }
  def iced = tap { @iced = true }
  def extra(name) = tap { (@extras ||= []) << name }
  # endregion

  # region: OrderBuilder#build
  def build
    raise InvalidOrder, "hot and iced" if @hot && @iced
    Order.new(size: @size, extras: @extras)
  end
  # endregion
end

# Strategy: each payment method is a cartridge.
class Cashier
  # region: Cashier#charge
  def charge(order) = @payment_methods.fetch(order.payment).charge(order)
  # endregion
end

# region: CashPayment#charge
class CashPayment
  def charge(order) = CashDrawer.collect(order.total)
end
# endregion

# region: CardPayment#charge
class CardPayment
  def charge(order) = PagoFacilAdapter.new(PagoFacil::SDK.new).charge(order.total) # Adapter
end
# endregion

# region: AppPayment#charge
class AppPayment
  def charge(order) = AppWallet.charge(order.total)
end
# endregion

# Command: orders wait in a queue and can be cancelled in time.
class CommandQueue
  # region: CommandQueue#push
  def push(command) = @pending << command
  def cancel(order_id) = @pending.reject! { |c| c.order_id == order_id }
  # endregion
end

# Facade: a simple door to the kitchen.
class KitchenFacade
  # region: KitchenFacade#latte
  def latte(order)
    shot = EspressoMachine.new.extract(Grinder.new.grind(:arabica))
    milk = MilkFrother.new.froth(order.milk)
    order.complete!([shot, milk])
  end
  # endregion
end

# region: EspressoMachine#extract
class EspressoMachine
  def extract(ground) = :espresso
end
# endregion

# Observer: when the order is ready, all subscribers find out.
class Order
  # region: Order#complete!
  def complete!(drink) = @subscribers.each { |s| s.update(self) }
  # endregion
end

class Display
  # region: Display#update
  def update(order) = puts("Ticket #{order.ticket} ready")
  # endregion
end

class LoyaltyProgram
  # region: LoyaltyProgram#update
  def update(order) = order.card.add_points(10) # NullCard if it has no card
  # endregion
end

class Counter
  # region: Counter#notify
  def notify(message) = puts("Before charging: #{message}")
  # endregion
end

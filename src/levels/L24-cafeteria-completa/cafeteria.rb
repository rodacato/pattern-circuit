# La cafetería completa: cada pieza es un patrón que ya conoces.

# Builder: el pedido se arma por pasos con nombre y se valida antes de cobrar.
class OrderBuilder
  # region: OrderBuilder#size
  def size(value) = tap { @size = value }
  # endregion

  # region: OrderBuilder#build
  def build
    raise InvalidOrder, "caliente y con hielo" if @hot && @iced
    Order.new(size: @size, extras: @extras)
  end
  # endregion
end

# Strategy: cada forma de pago es un cartucho.
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

# Command: los pedidos esperan en cola y se pueden cancelar a tiempo.
class CommandQueue
  # region: CommandQueue#push
  def push(command) = @pending << command
  def cancel(order_id) = @pending.reject! { |c| c.order_id == order_id }
  # endregion
end

# Facade: una puerta simple a la cocina.
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

# Observer: cuando el pedido está listo, se enteran todos los suscriptores.
class Order
  # region: Order#complete!
  def complete!(drink) = @subscribers.each { |s| s.update(self) }
  # endregion
end

class Display
  # region: Display#update
  def update(order) = puts("Turno #{order.ticket} listo")
  # endregion
end

class LoyaltyProgram
  # region: LoyaltyProgram#update
  def update(order) = order.card.add_points(10) # NullCard si no tiene tarjeta
  # endregion
end

class Counter
  # region: Counter#notify
  def notify(message) = puts("Antes de cobrar: #{message}")
  # endregion
end

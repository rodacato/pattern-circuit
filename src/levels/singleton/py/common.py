# --- the rest of the coffee shop ---
class Lobby:
    def __init__(self, registers):
        self.registers = registers

    # region: Lobby#route
    def route(self, order):
        self.registers[order.register].checkout(order)
    # endregion


class Display:
    # region: Display#show
    def show(self, order):
        print(f"Ticket {order.ticket}")
    # endregion

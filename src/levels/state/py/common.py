# --- the rest of the coffee shop ---
class History:
    # region: History#record
    def record(self, order, event):
        print(f"{event} → {order.status}")
    # endregion

    # region: History#reject
    def reject(self, order, event):
        print(f"{event} does not apply when the order is {order.status}")
    # endregion

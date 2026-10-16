# --- the rest of the coffee shop ---
class Refunds:
    # region: Refunds#pay
    def pay(self, request):
        print(f"Refunded: ${request.amount}")
    # endregion

    # region: Refunds#decline
    def decline(self, request):
        print(f"Nobody can approve ${request.amount}: the customer is notified")
    # endregion

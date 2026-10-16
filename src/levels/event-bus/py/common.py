# --- the services that react to what happens in the coffee shop ---
class Inventory:
    # region: Inventory#on_event
    def on_event(self, event):
        if event.type == "returned":
            restock(event)
        else:
            reserve(event)
    # endregion


class Billing:
    # region: Billing#on_event
    def on_event(self, event):
        if event.type == "returned":
            credit_note(event)
        else:
            invoice(event)
    # endregion


class Loyalty:
    # region: Loyalty#on_event
    def on_event(self, event):
        if event.type == "returned":
            remove_points(event)
        else:
            add_points(event)
    # endregion


class Analytics:
    # region: Analytics#on_event
    def on_event(self, event):
        Metrics.track(event)
    # endregion

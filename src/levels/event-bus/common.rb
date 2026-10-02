# --- los servicios que reaccionan a lo que pasa en la cafetería ---
class Inventory
  # region: Inventory#on_event
  def on_event(event) = event.type == :returned ? restock(event) : reserve(event)
  # endregion
end

class Billing
  # region: Billing#on_event
  def on_event(event) = event.type == :returned ? credit_note(event) : invoice(event)
  # endregion
end

class Loyalty
  # region: Loyalty#on_event
  def on_event(event) = event.type == :returned ? remove_points(event) : add_points(event)
  # endregion
end

class Analytics
  # region: Analytics#on_event
  def on_event(event) = Metrics.track(event)
  # endregion
end

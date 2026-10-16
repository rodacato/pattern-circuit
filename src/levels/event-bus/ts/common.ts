// --- the services that react to what happens in the coffee shop ---
type Event = { type: string }

interface Subscriber {
  onEvent(event: Event): void
}

class Inventory implements Subscriber {
  // region: Inventory#on_event
  onEvent(event: Event) { event.type === 'returned' ? restock(event) : reserve(event) }
  // endregion
}

class Billing implements Subscriber {
  // region: Billing#on_event
  onEvent(event: Event) { event.type === 'returned' ? creditNote(event) : invoice(event) }
  // endregion
}

class Loyalty implements Subscriber {
  // region: Loyalty#on_event
  onEvent(event: Event) { event.type === 'returned' ? removePoints(event) : addPoints(event) }
  // endregion
}

class Analytics implements Subscriber {
  // region: Analytics#on_event
  onEvent(event: Event) { Metrics.track(event) }
  // endregion
}

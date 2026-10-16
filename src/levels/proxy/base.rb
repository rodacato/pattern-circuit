# Every order queries the remote warehouse, even the tenth time we ask about coffee.
# region: wiring
taker = OrderTaker.new(RemoteInventory.new, barista)
# endregion

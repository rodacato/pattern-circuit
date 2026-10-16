// Level command: English texts, by key (the source of the typed keys).
export default {
  title: 'Wrong order',
  'brief.problem': 'A customer orders a latte and cancels it a few seconds later. But the counter runs every order on the spot: when the cancellation arrives, the latte is already being prepared.',
  'brief.goal': 'Make sure an order cancelled in time isn\'t prepared, without losing any other order.',
  'node.undo': 'Undo',
  'node.barista': 'Barista',
  'socket.orders': 'Orders',
  'option.orders.command.title': 'Command: the request turned into an object',
  'option.orders.command.body': 'Each order becomes a card that is queued and runs when the barista is free. While it waits, it can be cancelled: the cancellation takes the card out of the queue before it runs. (A Command can also revert what already ran with an undo that stores the previous state.)',
  'option.orders.strategy.title': 'Strategy can\'t go back in time',
  'option.orders.strategy.body': 'Changing how you cancel doesn\'t help if the action already ran. To cancel it in time, the request has to exist as an object before it runs.',
  'option.orders.observer.title': 'Observer broadcasts, it doesn\'t undo',
  'option.orders.observer.body': 'Notifying everyone about the cancellation means the barista gets it… as if it were just another order. Something nobody ordered gets prepared.',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Mocha',
  'scenario.main.2': 'Cancel latte',
  'scenario.main.3': 'Tea',
} as const

// Level single-payment: English texts, by key (the source of the typed keys).
export default {
  title: 'A single payment method',
  'brief.problem': 'The airport coffee shop only takes cards, and it\'ll stay that way: the contract with the bank runs for years. Charge adds VAT twice, and someone suggests adding a payments Strategy "just in case".',
  'brief.goal': 'Make every charge come out right without adding pieces nobody needs today.',
  'socket.charging': 'Charge',
  'option.charging.keep-simple.title': 'Keep it simple: fix the calculation and nothing else',
  'option.charging.keep-simple.body': 'There\'s a single payment method and no other in sight: the fix is one line in Cashier. If a second method shows up tomorrow, that\'ll be the time to refactor toward Strategy, not before.',
  'option.charging.strategy.title': 'Strategy with no alternatives',
  'option.charging.strategy.body': 'An interface, a registry and a single implementation. It works, but it\'s complexity you have to carry through every change with nothing asking for it today: what Fowler calls the cost of carry (YAGNI).',
  'option.charging.factory-method.title': 'A factory for a single product',
  'option.charging.factory-method.body': 'Factory Method lets a subclass decide what to create; here the same thing is always created. GoF warns that a pattern adds indirection and only pays off when the flexibility it gives is needed.',
  'win.1': 'charges with double VAT',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Americano',
  'scenario.main.2': 'Tea',
  'node.card': 'Card',
  'node.factory': 'Payment factory',
} as const

// Level adapter: English texts, by key (the source of the typed keys).
export default {
  title: 'The new terminal',
  'brief.problem': 'We signed up for the PagoFácil terminal. Its SDK speaks another language: Charge sends payments in its own format (■) and the terminal only accepts its own (◆). Everything bounces.',
  'brief.goal': 'Make Charge use the new terminal without touching Charge or the vendor\'s SDK.',
  'node.terminal': 'PagoFácil',
  'socket.gateway': 'Payment gateway',
  'option.gateway.adapter.title': 'Adapter: a translator between two interfaces',
  'option.gateway.adapter.body': 'Charge keeps calling charge(total) and the SDK stays unchanged. The adapter translates one call into the other: the pulse goes in square and comes out in the shape the terminal understands.',
  'option.gateway.decorator.title': 'Decorator adds, but keeps the interface',
  'option.gateway.decorator.body': 'The wrapper logs each charge and delegates the exact same call. The pulse\'s shape doesn\'t change: the terminal still rejects it.',
  'option.gateway.facade.title': 'Facade simplifies a subsystem; Adapter fits an interface',
  'option.gateway.facade.body': 'Facade defines a new, simpler interface over a subsystem with several pieces. There\'s no subsystem here: there\'s a single class whose interface doesn\'t match the one Charge already expects. This facade forwards charge as is and the terminal rejects it; if it translated to the existing interface, it would be an Adapter.',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Mocha',
  'scenario.main.2': 'Tea',
  'node.logger': 'With log',
  'node.payments': 'Payments',
} as const

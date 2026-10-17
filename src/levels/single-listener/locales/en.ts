// Level single-listener: English texts, by key (the source of the typed keys).
export default {
  title: 'A single interested party',
  'brief.problem': 'When an order is charged, the kitchen has to find out so it can start preparing it. Today nobody tells it and orders get lost. Only the kitchen needs to know, and there are no other interested parties in sight.',
  'brief.goal': 'Make sure the kitchen gets every order and the flow still reads straight through.',
  'socket.notice': 'Kitchen notice',
  'option.notice.keep-simple.title': 'A direct call reads straight through',
  'option.notice.keep-simple.body': 'With a single interested party, Cashier calls the kitchen and the flow is written in the code from start to finish. A bus or a list of subscribers will make sense when more interested parties show up.',
  'option.notice.event-bus.title': 'A bus for a single subscriber',
  'option.notice.event-bus.body': 'It works, but the flow is no longer written anywhere: to know what happens after charging you have to hunt down who subscribed. Fowler warns that with events the flow is hard to see; here there is a single listener that doesn\'t need to run later or on its own, and the direct call is enough.',
  'option.notice.command.title': 'A command nobody queues or undoes',
  'option.notice.command.body': 'Command turns a request into an object so it can be queued, undone or logged. None of that happens here: it\'s just one more object between Cashier and the kitchen.',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Mocha',
  'scenario.main.2': 'Tea',
  'node.bus': 'Event bus',
  'node.startOrder': 'Kitchen order',
} as const

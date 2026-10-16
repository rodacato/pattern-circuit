// Texts of the game area. Keys are `game.<element>`; the other locales must define exactly the same ones.
export const game = {
  // hints
  'game.hints.socketSuffix': ' (socket "{socket}")',
  'game.hints.question.fallback': 'Run the circuit and follow a pulse: where does the path go wrong?',
  'game.hints.question.dropped': 'Why are orders getting lost? Look for the case that has nowhere to go.',
  'game.hints.question.invalidAtSink': 'Are wrong orders arriving? Look at who decides what gets created or how it is put together.',
  'game.hints.question.duplicatesAtSink': 'Does something happen more than once? Ask yourself whether everyone should be notified or just one chosen.',
  'game.hints.question.nodesTouched': 'Does the change force you to open pieces that already worked? Look for where the new part could plug in without touching them.',
  'game.hints.question.nodes': 'Is every piece you add needed? Look for the smallest fix that works.',
  'game.hints.question.maxLoad': 'Is someone carrying extra work or waiting for no reason?',
  'game.hints.question.cancelled': 'Can something be stopped before it happens?',
  'game.hints.question.delivered': "Why don't all orders reach the customer? Click a pulse to follow it.",
  'game.hints.family': 'The pattern you are looking for{where} is in the {family} family: {detail}.',
  'game.hints.familyDetail.creational': 'creational patterns, which deal with how objects are created',
  'game.hints.familyDetail.structural': 'structural patterns, which deal with how classes and objects are composed',
  'game.hints.familyDetail.behavioral': 'behavioral patterns, which assign responsibilities and define how objects interact',
  'game.hints.familyDetail.architecture': 'architecture patterns, which organize whole components and how they communicate',
  'game.hints.familyDetail.resilience': 'resilience patterns, which decide what to do when another service fails',
  'game.hints.familyDetail.principle': "principles: sometimes the best piece is the one you don't add",
  'game.hints.ruleOut': "Rule out {pattern}{where}: it doesn't fit this problem.",
  'game.hints.answer': 'Try {pattern}{where}.',
  // predictions
  'game.prediction.outcome.solves': 'It solves the problem',
  'game.prediction.outcome.partial': 'It half solves it',
  'game.prediction.outcome.misfit': "It doesn't fit here",
  'game.prediction.touched.none': 'None: only something new is added',
  'game.prediction.touched.one': 'One',
  'game.prediction.touched.many': 'More than one',
  'game.prediction.outcomeQuestion': 'Before running it: what will {pattern} do in this socket?',
  'game.prediction.touchedQuestion': 'How many pieces that already worked will need changing to meet the ticket?',
  // code diff
  'game.diff.ticketWith': 'What the ticket changed, with {names}',
  'game.diff.ticketWithout': 'What the ticket changed, without the pattern',
  'game.diff.withoutToWith': 'From the code without the pattern to the code with {names}',
  // several pattern names in a row
  'game.names.join': '{head} + {tail}',
} as const

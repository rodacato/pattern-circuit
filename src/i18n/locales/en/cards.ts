// Texts of the cards area. Keys are `cards.<element>`; the other locales must define exactly the same ones.
export const cards = {
  // metrics (also used as the label of an assertion that has none)
  'cards.metrics.spawned': 'orders created',
  'cards.metrics.delivered': 'orders delivered',
  'cards.metrics.dropped': 'orders lost',
  'cards.metrics.invalidAtSink': 'wrong orders',
  'cards.metrics.duplicatesAtSink': 'duplicated orders',
  'cards.metrics.cancelled': 'orders cancelled in time',
  'cards.metrics.maxLoad': 'peak load on a node',
  'cards.metrics.nodesTouched': 'existing nodes modified',
  'cards.metrics.nodes': 'pieces in the circuit',

  // how an assertion compares its value
  'cards.expectation.equal': 'expected',
  'cards.expectation.atMost': 'max',
  'cards.expectation.atLeast': 'min',

  // outcome of a tried pattern
  'cards.outcome.solves': 'Solves it!',
  'cards.outcome.partial': 'Partial',
  'cards.outcome.misfit': "Doesn't fit",

  // shared
  'cards.close': 'Close',

  // failed run
  'cards.stage.fail.title': 'Something went wrong',
  'cards.stage.fail.retry': 'Try again',
  'cards.stage.fail.connect': 'Connect {from} → {to} without dragging',

  // hints
  'cards.stage.hints.first': 'I want a hint',
  'cards.stage.hints.another': 'Another hint',

  // problem found
  'cards.stage.problem.title': 'Problem found',
  'cards.stage.problem.instruction': 'Drag a pattern from the inventory to the pulsing socket ⬡ on the circuit (or pick it with a click or the keyboard). Trying the wrong one teaches too.',

  // prediction
  'cards.stage.predict.title': 'Predict',
  'cards.stage.predict.skip': 'Skip and see what happens',
  'cards.stage.predict.right': 'Your prediction was right',
  'cards.stage.predict.wrong': 'You predicted "{guess}"; it was "{answer}"',

  // note after plugging a pattern
  'cards.stage.note.nextTicket': 'Next: a change arrives →',
  'cards.stage.note.nextCompare': 'Compare without/with the pattern →',
  'cards.stage.note.pending': 'This socket is solved. Still missing: {pending}.',
  'cards.stage.note.tryAnother': 'Try another pattern from the inventory.',

  // change ticket
  'cards.stage.ticket.title': 'Change ticket',
  'cards.stage.ticket.skipPrediction': 'Apply without predicting',
  'cards.stage.ticket.apply': 'Apply the change',
  'cards.stage.ticket.opened': 'Code that already worked had to be opened up.',
  'cards.stage.ticket.added': 'Only a new piece was added: no existing node changed its behavior.',
  'cards.stage.ticket.compare': 'Compare without/with the pattern →',

  // comparison
  'cards.comparison.title': 'Comparison',
  'cards.comparison.without': 'Without the pattern',
  'cards.comparison.with': 'With {names}',
  'cards.comparison.withoutShort': 'without',
  'cards.comparison.withShort': 'with',
  'cards.comparison.finish': 'Finish level ✓',

  // level complete
  'cards.win.finishedGame': 'You completed the final walkthrough!',
  'cards.win.learned': 'You solved it with {names}',
  'cards.win.cafeWorks': 'The coffee shop works!',
  'cards.win.levelDone': 'Level complete',
  'cards.win.endOfTour': 'End of the journey',
  'cards.win.endBody': "The whole coffee shop runs on the patterns of the walkthrough. Your notebook keeps what you tried with each one, including what didn't fit.",
  'cards.win.again': 'Watch again',
  'cards.win.next': 'Next level →',
} as const

// Texts of the ui area. Keys are `ui.<element>`; the other locales must define exactly the same ones.
export const ui = {
  // course description (course.json)
  'ui.course.description': 'Learn design patterns by plugging them into a cafeteria circuit.',
  // host
  'ui.host.unavailable': 'Not connected to its host: your progress is saved only in this browser.',
  // top bar
  'ui.header.language': 'Change language',
  'ui.header.reviewHint': 'Review problems from levels you already completed',
  'ui.header.review': 'Review',
  'ui.header.reviewDue': 'Due: {n}',
  'ui.header.notebook': 'Notebook',
  'ui.header.notes': 'Notes: {n}',
  'ui.header.level': 'Level',
  'ui.stage.circuit': 'Circuit for level {n}: {title}',
  'ui.app.desktopOnly': 'Pattern Circuit needs a wider screen: open it on a tablet or a computer, or rotate your phone.',

  // shared
  'ui.common.levelTitle': 'Level {n} · {title}',

  // legend
  'ui.legend.order': 'order',
  'ui.legend.concrete': 'depends on a concrete class',
  'ui.legend.interface': 'depends on an interface',
  'ui.legend.cameraMouse': 'wheel: zoom · drag the background: pan · double-click: reframe · space, ←, →, R: playback',
  'ui.legend.cameraTouch': 'pinch: zoom · drag the background: pan · double-tap: reframe',

  // brief card
  'ui.brief.eyebrow': 'Level {n} · {chapter}',
  'ui.brief.goal': 'Goal',
  'ui.brief.stage.observe': 'Observe',
  'ui.brief.stage.choose': 'Pick a pattern',
  'ui.brief.stage.change': 'Change',
  'ui.brief.stage.compare': 'Compare',

  // inventory
  'ui.inventory.wrongSocket': "{pattern} doesn't go in that socket",
  'ui.inventory.groupLabel': 'Pattern inventory',
  'ui.inventory.title': 'Inventory',
  'ui.inventory.tried': 'tried: {outcome}',
  'ui.inventory.hintMany': 'Drag each pattern to its socket ⬡',
  'ui.inventory.hintOne': 'Drag a pattern to the socket ⬡',
  'ui.inventory.outcome.solves': 'solves it',
  'ui.inventory.outcome.partial': 'partial',
  'ui.inventory.outcome.misfit': "doesn't fit",

  // notebook
  'ui.notebook.confirmReset': 'Erase all progress? Completed levels and notebook notes will be lost.',
  'ui.notebook.eyebrow': 'Pattern notebook',
  'ui.notebook.title': 'Field notes ({n})',
  'ui.notebook.predictions': 'Correct predictions: {right} of {total}',
  'ui.notebook.close': 'Close notebook',
  'ui.notebook.empty': 'Still empty. Every pattern you try in a socket leaves here what you learned.',
  'ui.notebook.reset': 'Erase progress',
  'ui.notebook.resetYes': 'Yes, erase it all',
  'ui.notebook.resetNo': 'Cancel',
  'ui.notebook.outcome.solves': 'Solves it',
  'ui.notebook.outcome.partial': 'Partial',
  'ui.notebook.outcome.misfit': "Doesn't fit",

  // review
  'ui.review.eyebrow': 'Review',
  'ui.review.done': 'Round complete',
  'ui.review.question': 'Question {i} of {n}',
  'ui.review.close': 'Close review',
  'ui.review.empty': 'Nothing due. Problems from the levels you complete come back here, spaced further apart each time.',
  'ui.review.summary': 'You got {right} of {n}. The ones you missed come back next round; the ones you got right, in a few days.',
  'ui.review.back': 'Back to the game',
  'ui.review.prompt': 'Which pattern would you plug in?',
  'ui.review.correct': 'Correct',
  'ui.review.answer': 'The answer was {pattern}',
  'ui.review.next': 'Next →',
  'ui.review.result': 'See result',
  'ui.review.socket': 'socket "{label}"',

  // seen in
  'ui.seenIn.label': 'In {language}: {example}.',
  'ui.seenIn.source': 'See source ↗',

  // transport
  'ui.transport.label': 'Playback',
  'ui.transport.restart.title': 'Restart (R)',
  'ui.transport.restart.label': 'Restart',
  'ui.transport.back.title': 'Step back (←)',
  'ui.transport.back.label': 'Step back',
  'ui.transport.play.title': 'Play / pause (space)',
  'ui.transport.pause': 'Pause',
  'ui.transport.play': 'Play',
  'ui.transport.forward.title': 'Step forward (→)',
  'ui.transport.forward.label': 'Step forward',
  'ui.transport.speed': 'Speed {s}×',

  // code panel
  'ui.code.view': 'Code view',
  'ui.code.tabCode': 'Code',
  'ui.code.tabChanges': 'Changes',
  'ui.code.diffLabel': '{title}: {added} lines added, {removed} removed',
  'ui.code.unchanged': '{count} unchanged lines',
  'ui.code.diffFoot': 'Green: new lines. Red: lines that had to be removed or changed. Look at which classes they land in.',
  'ui.code.pulse': 'pulse #{id}',
  'ui.code.node': 'node · {label}',
  'ui.code.labelRuby': 'Ruby code for the circuit',
  'ui.code.labelTypeScript': 'TypeScript code for the circuit',
  'ui.code.labelPython': 'Python code for the circuit',
  'ui.code.language': 'Code language',
  'ui.code.footHint': 'Click a node or a pulse to follow its code.',
} as const

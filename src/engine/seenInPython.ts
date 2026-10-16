import type { PatternId } from './schema'
import type { SeenIn } from './patterns'

// Python examples verified against the linked docs or source (review of 2026-10); `example` and `text` are catalog keys.
// If the example is a variant or a relative of the pattern, the text says so.
export const SEEN_IN_PYTHON: Partial<Record<PatternId, SeenIn>> = {
  'factory-method': {
    example: 'seenIn.factoryMethod.pyExample',
    text: 'seenIn.factoryMethod.pyText',
    url: 'https://docs.python.org/3/library/logging.html#logging.Logger.makeRecord',
  },
  builder: {
    example: 'seenIn.builder.pyExample',
    text: 'seenIn.builder.pyText',
    url: 'https://docs.python.org/3/library/xml.etree.elementtree.html#treebuilder-objects',
  },
  singleton: {
    example: 'seenIn.singleton.pyExample',
    text: 'seenIn.singleton.pyText',
    url: 'https://docs.python.org/3/reference/datamodel.html#none',
  },
  adapter: {
    example: 'seenIn.adapter.pyExample',
    text: 'seenIn.adapter.pyText',
    url: 'https://docs.python.org/3/library/io.html#io.TextIOWrapper',
  },
  decorator: {
    example: 'seenIn.decorator.pyExample',
    text: 'seenIn.decorator.pyText',
    url: 'https://docs.python.org/3/library/functools.html#functools.lru_cache',
  },
  composite: {
    example: 'seenIn.composite.pyExample',
    text: 'seenIn.composite.pyText',
    url: 'https://docs.python.org/3/library/unittest.html#unittest.TestSuite',
  },
  facade: {
    example: 'seenIn.facade.pyExample',
    text: 'seenIn.facade.pyText',
    url: 'https://docs.python.org/3/library/subprocess.html#subprocess.run',
  },
  proxy: {
    example: 'seenIn.proxy.pyExample',
    text: 'seenIn.proxy.pyText',
    url: 'https://docs.python.org/3/library/multiprocessing.html#proxy-objects',
  },
  strategy: {
    example: 'seenIn.strategy.pyExample',
    text: 'seenIn.strategy.pyText',
    url: 'https://docs.djangoproject.com/en/stable/topics/auth/passwords/',
  },
  observer: {
    example: 'seenIn.observer.pyExample',
    text: 'seenIn.observer.pyText',
    url: 'https://docs.djangoproject.com/en/stable/topics/signals/',
  },
  state: {
    example: 'seenIn.state.pyExample',
    text: 'seenIn.state.pyText',
    url: 'https://github.com/pytransitions/transitions',
  },
  command: {
    example: 'seenIn.command.pyExample',
    text: 'seenIn.command.pyText',
    url: 'https://docs.celeryq.dev/en/stable/userguide/tasks.html',
  },
  'chain-of-responsibility': {
    example: 'seenIn.chainOfResponsibility.pyExample',
    text: 'seenIn.chainOfResponsibility.pyText',
    url: 'https://docs.djangoproject.com/en/stable/topics/http/middleware/',
  },
  'template-method': {
    example: 'seenIn.templateMethod.pyExample',
    text: 'seenIn.templateMethod.pyText',
    url: 'https://docs.python.org/3/library/unittest.html#unittest.TestCase.setUp',
  },
  'ports-and-adapters': {
    example: 'seenIn.portsAndAdapters.pyExample',
    text: 'seenIn.portsAndAdapters.pyText',
    url: 'https://docs.djangoproject.com/en/stable/topics/email/#email-backends',
  },
  'event-bus': {
    example: 'seenIn.eventBus.pyExample',
    text: 'seenIn.eventBus.pyText',
    url: 'https://blinker.readthedocs.io/en/stable/',
  },
  cqrs: {
    example: 'seenIn.cqrs.pyExample',
    text: 'seenIn.cqrs.pyText',
    url: 'https://www.cosmicpython.com/book/chapter_12_cqrs.html',
  },
  'null-object': {
    example: 'seenIn.nullObject.pyExample',
    text: 'seenIn.nullObject.pyText',
    url: 'https://docs.python.org/3/library/contextlib.html#contextlib.nullcontext',
  },
  'circuit-breaker': {
    example: 'seenIn.circuitBreaker.pyExample',
    text: 'seenIn.circuitBreaker.pyText',
    url: 'https://github.com/danielfm/pybreaker',
  },
  saga: {
    example: 'seenIn.saga.pyExample',
    text: 'seenIn.saga.pyText',
    url: 'https://docs.temporal.io/design-patterns/saga-pattern',
  },
}

import type { PatternId } from './schema'
import type { SeenIn } from './patterns'

// Examples verified against the linked docs or source (review of 2026-09); `example` and `text` are catalog keys.
// If the example is a variant or a relative of the pattern, the text says so.
export const SEEN_IN: Partial<Record<PatternId, SeenIn>> = {
  'factory-method': {
    example: 'seenIn.factoryMethod.example',
    text: 'seenIn.factoryMethod.text',
    url: 'https://api.rubyonrails.org/classes/ActiveRecord/Inheritance.html',
  },
  builder: {
    example: 'seenIn.builder.example',
    text: 'seenIn.builder.text',
    url: 'https://rack.github.io/rack/3.2/Rack/Builder.html',
  },
  singleton: {
    example: 'seenIn.singleton.example',
    text: 'seenIn.singleton.text',
    url: 'https://docs.ruby-lang.org/en/master/Singleton.html',
  },
  adapter: {
    example: 'seenIn.adapter.example',
    text: 'seenIn.adapter.text',
    url: 'https://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/AbstractAdapter.html',
  },
  decorator: {
    example: 'seenIn.decorator.example',
    text: 'seenIn.decorator.text',
    url: 'https://docs.ruby-lang.org/en/master/SimpleDelegator.html',
  },
  composite: {
    example: 'seenIn.composite.example',
    text: 'seenIn.composite.text',
    url: 'https://github.com/sparklemotion/nokogiri/blob/main/lib/nokogiri/xml/node.rb',
  },
  facade: {
    example: 'seenIn.facade.example',
    text: 'seenIn.facade.text',
    url: 'https://docs.ruby-lang.org/en/master/OpenURI.html',
  },
  proxy: {
    example: 'seenIn.proxy.example',
    text: 'seenIn.proxy.text',
    url: 'https://api.rubyonrails.org/classes/ActiveRecord/Associations/CollectionProxy.html',
  },
  strategy: {
    example: 'seenIn.strategy.example',
    text: 'seenIn.strategy.text',
    url: 'https://api.rubyonrails.org/classes/ActiveSupport/Cache/Store.html',
  },
  observer: {
    example: 'seenIn.observer.example',
    text: 'seenIn.observer.text',
    url: 'https://docs.ruby-lang.org/en/3.3/Observable.html',
  },
  state: {
    example: 'seenIn.state.example',
    text: 'seenIn.state.text',
    url: 'https://github.com/aasm/aasm',
  },
  command: {
    example: 'seenIn.command.example',
    text: 'seenIn.command.text',
    url: 'https://guides.rubyonrails.org/active_job_basics.html',
  },
  'chain-of-responsibility': {
    example: 'seenIn.chainOfResponsibility.example',
    text: 'seenIn.chainOfResponsibility.text',
    url: 'https://guides.rubyonrails.org/rails_on_rack.html',
  },
  'template-method': {
    example: 'seenIn.templateMethod.example',
    text: 'seenIn.templateMethod.text',
    url: 'https://api.rubyonrails.org/classes/ActiveModel/EachValidator.html',
  },
  'ports-and-adapters': {
    example: 'seenIn.portsAndAdapters.example',
    text: 'seenIn.portsAndAdapters.text',
    url: 'https://guides.rubyonrails.org/active_storage_overview.html',
  },
  'event-bus': {
    example: 'seenIn.eventBus.example',
    text: 'seenIn.eventBus.text',
    url: 'https://api.rubyonrails.org/classes/ActiveSupport/Notifications.html',
  },
  cqrs: {
    example: 'seenIn.cqrs.example',
    text: 'seenIn.cqrs.text',
    url: 'https://github.com/RailsEventStore/ecommerce',
  },
  'null-object': {
    example: 'seenIn.nullObject.example',
    text: 'seenIn.nullObject.text',
    url: 'https://api.rubyonrails.org/classes/ActiveRecord/QueryMethods.html',
  },
  'circuit-breaker': {
    example: 'seenIn.circuitBreaker.example',
    text: 'seenIn.circuitBreaker.text',
    url: 'https://github.com/Shopify/semian',
  },
  saga: {
    example: 'seenIn.saga.example',
    text: 'seenIn.saga.text',
    url: 'https://github.com/RailsEventStore/ecommerce/blob/master/apps/rails_application/app/processes/processes/reservation_process.rb',
  },
}

import type { PatternId } from './schema'
import type { SeenIn } from './patterns'

// Ejemplos verificados contra la documentación o el código fuente enlazado (revisión de 2026-09).
// Si el ejemplo es una variante o un pariente del patrón, el texto lo dice.
export const SEEN_IN: Partial<Record<PatternId, SeenIn>> = {
  'factory-method': {
    example: 'Herencia de tabla única en ActiveRecord',
    text: 'Al crear o cargar un registro, Rails lee la columna type y construye la subclase correcta (Firm, Client) en vez de la clase base: una fábrica parametrizada, pariente del Factory Method.',
    url: 'https://api.rubyonrails.org/classes/ActiveRecord/Inheritance.html',
  },
  builder: {
    example: 'Rack::Builder',
    text: 'config.ru arma la aplicación paso a paso con use, map y run; al final to_app entrega el objeto terminado.',
    url: 'https://rack.github.io/rack/3.2/Rack/Builder.html',
  },
  singleton: {
    example: 'El módulo Singleton de Ruby',
    text: 'include Singleton vuelve privado new y ofrece Klass.instance, que siempre devuelve el mismo objeto.',
    url: 'https://docs.ruby-lang.org/en/master/Singleton.html',
  },
  adapter: {
    example: 'Adaptadores de conexión de ActiveRecord',
    text: 'Cada adaptador (PostgreSQL, MySQL, SQLite) traduce la misma interfaz de AbstractAdapter a los detalles de su base de datos.',
    url: 'https://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/AbstractAdapter.html',
  },
  decorator: {
    example: 'SimpleDelegator',
    text: 'Una subclase de SimpleDelegator envuelve un objeto, le agrega métodos y delega todo lo demás al original; el ejemplo oficial se llama UserDecorator.',
    url: 'https://docs.ruby-lang.org/en/master/SimpleDelegator.html',
  },
  composite: {
    example: 'Nokogiri::XML::Node',
    text: 'Un documento y sus elementos son nodos del mismo tipo: traverse recorre cada hijo con el mismo método, sea hoja o rama.',
    url: 'https://github.com/sparklemotion/nokogiri/blob/main/lib/nokogiri/xml/node.rb',
  },
  facade: {
    example: 'OpenURI (URI.open)',
    text: 'URI.open(url) esconde Net::HTTP, Net::HTTPS y Net::FTP detrás de una sola llamada, como si abrieras un archivo.',
    url: 'https://docs.ruby-lang.org/en/master/OpenURI.html',
  },
  proxy: {
    example: 'CollectionProxy de ActiveRecord',
    text: 'blog.posts no es un arreglo: es un proxy que no carga los registros hasta necesitarlos; blog.posts.count va directo a SQL.',
    url: 'https://api.rubyonrails.org/classes/ActiveRecord/Associations/CollectionProxy.html',
  },
  strategy: {
    example: 'Cache stores de Rails',
    text: 'Todos los stores comparten fetch, read y write; config.cache_store elige cuál usar sin tocar el código que cachea.',
    url: 'https://api.rubyonrails.org/classes/ActiveSupport/Cache/Store.html',
  },
  observer: {
    example: 'Observable de Ruby',
    text: 'El objeto observado llama changed y notify_observers, y Ruby invoca update en cada observador registrado con add_observer (gema observer desde Ruby 3.4).',
    url: 'https://docs.ruby-lang.org/en/3.3/Observable.html',
  },
  state: {
    example: 'La gema AASM',
    text: 'Declaras estados y eventos, y qué eventos se pueden disparar depende del estado actual: una máquina de estados declarativa, pariente de State.',
    url: 'https://github.com/aasm/aasm',
  },
  command: {
    example: 'ActiveJob',
    text: 'Cada job es un objeto con perform; perform_later lo guarda en una cola para ejecutarlo después, con reintentos.',
    url: 'https://guides.rubyonrails.org/active_job_basics.html',
  },
  'chain-of-responsibility': {
    example: 'Middleware de Rack',
    text: 'Cada middleware recibe la petición y decide si responde o la pasa al siguiente con @app.call(env).',
    url: 'https://guides.rubyonrails.org/rails_on_rack.html',
  },
  'template-method': {
    example: 'ActiveModel::EachValidator',
    text: 'validate fija el algoritmo (recorrer atributos, saltar vacíos) y llama a validate_each, que tu subclase implementa.',
    url: 'https://api.rubyonrails.org/classes/ActiveModel/EachValidator.html',
  },
  'ports-and-adapters': {
    example: 'Servicios de ActiveStorage',
    text: 'Tu app usa has_one_attached; el servicio (Disk, S3, GCS) es un adaptador intercambiable que eliges en storage.yml. La forma es la misma, aunque el puerto lo define Rails y no tu dominio.',
    url: 'https://guides.rubyonrails.org/active_storage_overview.html',
  },
  'event-bus': {
    example: 'ActiveSupport::Notifications',
    text: 'Publicas con instrument y cualquier parte de la app se suscribe con subscribe, sin conocerse entre sí.',
    url: 'https://api.rubyonrails.org/classes/ActiveSupport/Notifications.html',
  },
  cqrs: {
    example: 'La app de ejemplo de Rails Event Store',
    text: 'Los comandos cambian el estado y publican eventos; los modelos de lectura escuchan esos eventos y arman tablas solo para leer.',
    url: 'https://github.com/RailsEventStore/ecommerce',
  },
  'null-object': {
    example: 'Post.none en ActiveRecord',
    text: 'Devuelve una relación vacía que sigue aceptando where u order sin consultar la base; la documentación dice que implementa el patrón Null Object.',
    url: 'https://api.rubyonrails.org/classes/ActiveRecord/QueryMethods.html',
  },
  'circuit-breaker': {
    example: 'Semian, de Shopify',
    text: 'Tras error_threshold fallos abre el circuito y rechaza al instante; pasado error_timeout vuelve a probar el servicio.',
    url: 'https://github.com/Shopify/semian',
  },
  saga: {
    example: 'ReservationProcess en Rails Event Store',
    text: 'Reserva stock producto por producto y, si alguno falla, libera lo ya reservado y rechaza el pedido. RES lo llama process manager.',
    url: 'https://github.com/RailsEventStore/ecommerce/blob/master/apps/rails_application/app/processes/processes/reservation_process.rb',
  },
}

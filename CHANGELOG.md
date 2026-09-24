# Changelog

Todos los cambios relevantes de Pattern Circuit se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/). Para un juego, "API pública" significa: el formato de los niveles (`LevelDef`), la API del motor (`engine/index.ts`) y el progreso guardado del jugador; un cambio que rompa el progreso guardado es un cambio mayor.

## [Unreleased]

### Added

- **Predecir antes de ver**: al enchufar un patrón el juego pregunta qué hará (resuelve, a medias, no encaja), y antes de un ticket, cuántas piezas habrá que modificar. Después de correr, muestra si acertaste; el Cuaderno lleva la cuenta de predicciones acertadas.
- **Cambios en el código**: en la comparación, la pestaña "Cambios" del panel muestra qué líneas de Ruby se agregaron o quitaron (con ticket: lo que el ticket obligó a tocar, sin y con patrón).

### Fixed

- En escritorios angostos (1024 px), la tarjeta del nivel ya no tapa la tarjeta de etapa.

## [1.0.0] - 2026-09-24

Primera versión pública.

### Added

- **25 niveles** (0–24) en ocho capítulos de una cafetería que crece: Apertura, El mostrador, La barra crece, Hora pico, Todo junto, Arquitectura, Resiliencia y La cafetería completa.
- **20 patrones**: Factory Method, Builder, Singleton, Adapter, Decorator, Composite, Facade, Proxy, Strategy, Observer, State, Command, Chain of Responsibility, Template Method, Ports & Adapters, Event Bus, CQRS, Null Object, Circuit Breaker y Saga.
- Ritmo de cada nivel: observar el problema → elegir un patrón → aplicar un ticket de cambio → comparar sin/con patrón.
- Niveles de combinación con varios sockets (Factory Method + Strategy, Composite + Decorator, State + Observer + Command).
- Notas de campo para cada patrón probado, también los que no encajan, reunidas en el **Cuaderno de patrones**.
- Contenido verificado contra las fuentes originales, con bibliografía en `docs/DESIGN.md`.
- Panel de código Ruby con resaltado que sigue al pulso o al nodo seleccionado.
- Render neón con PixiJS: firma visual por patrón, estelas, partículas, cámara con zoom y paneo.
- Controles de reproducción: play/pausa, paso adelante y atrás, velocidades y atajos de teclado.
- Juego completo con teclado: cartuchos con Enter/Espacio y reparación de cables sin arrastrar.
- Accesibilidad: nombres accesibles, tarjetas anunciadas (`role="status"`), cuaderno como diálogo, foco visible y soporte de `prefers-reduced-motion`.
- Progreso guardado en `localStorage` con esquema versionado, y opción para borrarlo.
- Motor de simulación determinista con 14 primitivas, parches de circuito y métrica de nodos modificados.
- Validación exhaustiva de cada nivel: todas las variantes alcanzables compilan, tienen escenario y código.
- Vista de depuración del motor (`?debug`).
- Deploy estático a GitHub Pages y CI para pull requests con GitHub Actions.


[Unreleased]: https://github.com/rodacato/pattern-circuit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rodacato/pattern-circuit/releases/tag/v1.0.0

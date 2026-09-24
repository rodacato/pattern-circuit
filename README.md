# Pattern Circuit

Juego educativo para entender patrones de diseño viendo cómo un pulso recorre el circuito de una cafetería. Diseño completo en [docs/DESIGN.md](docs/DESIGN.md).

```bash
npm install
npm run dev        # el juego (añade ?debug para la vista del motor)
npm test           # motor, niveles, aplicación, render y arquitectura
npm run check      # tipos + lint + tests
```

Arquitectura por capas en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

- `src/engine/`: motor de simulación puro (sin DOM) y esquema de niveles.
- `src/levels/<id>/`: un nivel = `level.ts` (datos) + fragmentos `.rb`. Se registran solos.
- `src/game/`: aplicación: sesión, flujo del nivel, reproducción y progreso.
- `src/render/`: render PixiJS neón y skins por patrón.
- `src/ui/`: interfaz React.
- `src/debug/`: vista de depuración del motor (`?debug`).

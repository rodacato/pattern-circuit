# Pattern Circuit

Juego educativo para entender patrones de diseño viendo cómo un pulso recorre el circuito de una cafetería. Diseño completo en [docs/DESIGN.md](docs/DESIGN.md).

```bash
npm install
npm run dev        # el juego (añade ?debug para la vista del motor)
npm test           # motor + niveles
npm run typecheck
```

- `src/engine/`: motor de simulación puro (sin DOM) y esquema de niveles.
- `src/levels/<id>/`: un nivel = `level.ts` (datos) + fragmentos `.rb`. Se registran solos.
- `src/game/`: sesión de juego (`session.ts`), render PixiJS neón (`render/`) e interfaz React (`ui/`).
- `src/debug/`: vista de depuración del motor (`?debug`).

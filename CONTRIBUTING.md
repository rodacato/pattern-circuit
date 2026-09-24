# Contribuir a Pattern Circuit

¡Gracias por el interés! Este documento explica cómo preparar el entorno, qué se espera de un cambio y cómo agregar niveles o patrones.

## Entorno

- Node 22 o superior.
- Ruby (opcional): si está instalado, `npm test` corre `ruby -wc` sobre cada archivo Ruby que ve el jugador.

```bash
npm install
npm run dev      # http://localhost:5173 (añade ?debug para la vista del motor)
npm run check    # tipos + lint + tests: debe pasar antes de cada commit
npm run coverage # cobertura con umbrales
```

## Flujo de trabajo

1. Crea una rama desde `main`.
2. Haz commits pequeños y enfocados. Los mensajes van en español, con el formato `tipo(ámbito): qué cambia`:
   - tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`;
   - ámbitos habituales: `engine`, `game`, `render`, `ui`, `levels`, `contenido`.
3. `npm run check` en verde. Si cambias lógica, agrega o ajusta tests.
4. Anota el cambio en la sección `[Unreleased]` de [CHANGELOG.md](CHANGELOG.md).
5. Abre un pull request; CI corre las mismas verificaciones.

## Reglas del código

- **Capas**: `engine ← levels`, `engine ← game ← render ← ui`. Las reglas están en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y `src/architecture.test.ts` las hace cumplir. Si ese test falla, la solución casi nunca es relajar la regla.
- **Fuera de `engine/` solo se importa `engine/index.ts`.**
- **La lógica no vive en componentes ni en el render**: si hay que decidir algo, va a `game/` (funciones puras cuando se pueda) con su test.
- **El motor es determinista**: nada de `Math.random()` ni de tiempo real dentro de `engine/`.
- Identificadores en inglés; comentarios, textos de UI y documentación en español.
- Comentarios cortos que explican el *porqué*, no el *qué*.
- Accesibilidad: todo lo nuevo tiene que poder usarse con teclado, y los controles con ícono llevan `aria-label`.

## Agregar un nivel

1. Crea `src/levels/LNN-nombre/` con:
   - `level.ts`: los datos, con `defineLevel` y los ayudantes de `levels/kit.ts`;
   - los fragmentos `.rb`, con regiones `# region: Clase#metodo` / `# endregion` para cada `codeRef`;
   - `level.test.ts`: el comportamiento pedagógico de cada opción ("Observer cobra tres veces", "Strategy + ticket toca 0 nodos").
2. El registro lo descubre solo. `defineLevel` valida todas las variantes alcanzables y `levels.test.ts` comprueba las invariantes comunes (sin patrón se falla, con el correcto se gana, ningún incorrecto gana…).
3. Si el nivel va en un capítulo nuevo, agrégalo en `levels/chapters.ts`, en orden.
4. Actualiza la tabla de progresión en [docs/DESIGN.md](docs/DESIGN.md).

## Agregar un patrón

1. Súmalo a `PATTERN_IDS` (`engine/schema.ts`) y a `PATTERNS` (`engine/patterns.ts`), con su familia y su idea en una frase.
2. Dale una skin en `render/skins/` (el tipo exige una por patrón).
3. Enséñalo en algún nivel (un test lo exige).
4. Agrega su fuente a la sección "Fuentes" de [docs/DESIGN.md](docs/DESIGN.md).

## Contenido: nada inventado

Pattern Circuit enseña, así que el contenido tiene que ser correcto:

- Cada idea, nota de campo y veredicto (`solves`, `partial`, `misfit`) tiene que poder respaldarse con una fuente verificable: libro, paper o artículo del autor del patrón. Cita la fuente en el PR.
- Si el juego simplifica, que la simplificación no contradiga la fuente. Si enseña una variante (por ejemplo, el Builder de Bloch), se nombra en la documentación.
- Textos simples, cortos y concretos, en el mundo de la cafetería.

## Publicar una versión

1. Mueve lo de `[Unreleased]` a una sección nueva `[X.Y.Z] - AAAA-MM-DD` en [CHANGELOG.md](CHANGELOG.md), según [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
2. Sube la versión en `package.json` según [Versionado Semántico](https://semver.org/lang/es/). Un cambio que invalide el progreso guardado o el formato de niveles es un cambio mayor.
3. Commit `chore(release): vX.Y.Z` y tag anotado `vX.Y.Z`.
4. Push de `main` y del tag: el deploy a GitHub Pages es automático.

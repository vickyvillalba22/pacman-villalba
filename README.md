# Pac-Man · Instalación interactiva

Instalación interactiva basada en Pac-Man, desarrollada con **TypeScript** y **HTML5 Canvas** (sin frameworks). El objetivo es que el juego pueda controlarse con un teclado o con hardware físico (Arduino / ESP32) sin modificar el motor del juego.

## Arquitectura

La lógica del juego es independiente de la entrada y del renderizado:

- `src/game/` — Motor del juego, ciclo (GameLoop) y máquina de estados (lógica pura, sin I/O)
- `src/entities/` — Jugador, fantasmas y entidades (interfaz `GameEntity`)
- `src/renderer/` — Dibujo de escenas (interfaz `Renderer`, sin lógica de juego)
- `src/input/` — Interfaz de entrada agnóstica (`InputProvider`: teclado, hardware, etc.)
- `src/map/` — Carga y representación del laberinto (interfaz `Level`)
- `src/audio/` — Reproducción de sonidos y música
- `src/resources/` — Carga y gestión de recursos (interfaz `ResourceLoader`)
- `src/hardware/` — Implementaciones de hardware (reemplazan al teclado)
- `src/ui/` — HUD, menús y overlays
- `src/types/` — Tipos compartidos entre módulos (sin lógica)
- `assets/` — Sprites, sonidos, mapas y demás recursos
- `docs/` — Documentación técnica y de diseño

El hardware debe cumplir la misma interfaz que la entrada por teclado, de modo que pueda reemplazarla sin tocar el motor del juego. Las implementaciones concretas se inyectan desde `src/main.ts` (punto de composición).

## Motor

- `GameEngine` / `PacmanGame`: ciclo del juego (`init`, `update`, `start`, `stop`, `reset`), sin renderizado ni eventos de teclado.
- `GameLoop`: bucle con `requestAnimationFrame` que calcula `deltaTime` y llama al motor.
- `GameStateMachine`: cambia entre estados (`Boot`, `Loading`, `AttractMode`, `WaitingForPlayer`, `Playing`, `Paused`, `LevelCompleted`, `GameOver`) mediante `State` y `StateContext`.
- Interfaces públicas: `Renderer`, `InputProvider`, `GameEntity`, `Level`, `ResourceLoader`, `State`.

## Mapas

Los niveles se definen como texto plano (una fila = una línea) en `assets/maps/`. Cada carácter es una celda:

| Carácter  | Tile          |
| --------- | ------------- |
| `#`       | `wall`        |
| (espacio) | `empty`       |
| `.`       | `dot`         |
| `o`       | `powerPellet` |
| `-`       | `tunnel`      |
| `=`       | `ghostDoor`   |

Para agregar un nivel: crear un archivo en `assets/maps/` (extensión `.level`), importarlo con `?raw` y pasarlo a `parseTileMap`. Los caracteres desconocidos lanzan un error indicando fila y columna.

## Requisitos

- Node.js ≥ 22
- npm ≥ 10

## Scripts

| Script                 | Descripción                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Servidor de desarrollo con Vite |
| `npm run build`        | Typecheck + build de producción |
| `npm run preview`      | Sirve el build de producción    |
| `npm run typecheck`    | Verifica tipos con TypeScript   |
| `npm run lint`         | Lint con ESLint                 |
| `npm run lint:fix`     | Lint con autocorrección         |
| `npm run format`       | Formatea el código con Prettier |
| `npm run format:check` | Verifica el formato             |

## Estado

Etapa 1 (configuración y arquitectura del motor), Etapa 2 (sistema de mapas: `TileMap` + carga desde archivos), Etapa 3 (entidades base: `Pacman`, `Ghost` con sus cuatro tipos clásicos, sistema de spawn y `GameWorld`), Etapa 4.2 (infraestructura de movimiento con `deltaTime` en `BaseEntity`, velocidad en tiles/segundo), Etapa 4.3.1 (capa de input: `KeyboardInput` como `InputProvider`), Etapa 4.3.2 (input conectado a Pac-Man: flechas/WASD actualizan la dirección solicitada, que la dirección actual adopta durante la actualización; el engine recibe `InputProvider` por composición, sin acoplarse a `KeyboardInput`), Etapa 4.4.1 (debug renderer con fondo negro y paredes azules, decidido por tipo de tile), Etapa 4.4.2-4.4.3 (colisión simple: `TileMap.isWalkable()` reutilizado, Pac-Man consulta la celda destino antes de moverse y se detiene ante paredes y límites del mapa; sin ajuste fino de grilla) y Etapa 4.4.4 (ajuste fino de movimiento: al ser bloqueado por una pared Pac-Man se pega exactamente al borde de la celda con `snapToCellBoundary`, haciendo la posición de reposo independiente del FPS; y solo adopta la dirección solicitada si la celda adyacente en esa dirección es transitable —`canTurn` consulta la celda que se va a entrar, no el siguiente paso—, por lo que pedir una dirección contra una pared ya no congela a Pac-Man: sigue con su dirección actual) completas. El render de depuración dibuja el mapa por tiles y las entidades como formas simples. Pac-Man se controla con el teclado y ya no atraviesa paredes; aún falta IA, pellets consumibles, puntuación, animaciones y sprites.

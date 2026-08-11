# AGENTS.md

Reglas del proyecto Pac-Man. Toda contribución al código debe respetarlas.

## Reglas de arquitectura

- La lógica del juego nunca depende del método de entrada.
- El renderizado no contiene lógica del juego.
- Todo debe ser modular.
- El hardware debe poder reemplazar al teclado sin modificar el motor del juego.

## Estructura del proyecto

```
src/
    game/        Motor del juego, ciclo (GameLoop) y máquina de estados (lógica pura, sin I/O)
    entities/    Jugador, fantasmas y entidades (interfaz GameEntity y comportamiento)
    renderer/    Dibujo de escenas (interfaz Renderer, sin lógica de juego)
    input/       Interfaz de entrada agnóstica (InputProvider: teclado, hardware, etc.)
    map/         Carga y representación del laberinto (interfaz Level)
    audio/       Reproducción de sonidos y música
    resources/   Carga y gestión de recursos (interfaz ResourceLoader)
    hardware/    Implementaciones de hardware (reemplazan al teclado)
    ui/          HUD, menús y overlays
    types/       Tipos compartidos entre módulos (sin lógica)
assets/          Sprites, sonidos, mapas y demás recursos
docs/            Documentación técnica y de diseño
```

## Convenciones

- Cada módulo expone una interfaz clara; el resto del sistema depende de la interfaz, no de la implementación.
- Los módulos se comunican mediante interfaces (`Renderer`, `InputProvider`, `GameEntity`, `Level`, `ResourceLoader`, `State`). Las implementaciones concretas se inyectan desde el punto de composición (`src/main.ts`).
- El motor (`src/game`) depende de `renderer`, `input`, `map` y `resources` solo a través de sus interfaces.
- Los tipos compartidos por más de un módulo se definen en `src/types`.
- El módulo `game` se comunica con la entrada solo a través de la abstracción de `input`.
- Las implementaciones de `hardware` deben cumplir la misma interfaz que la entrada por teclado.
- No importar lógica de juego dentro de `renderer` ni de `ui`.
- Mantener cada módulo autocontenido y sin dependencias circulares.

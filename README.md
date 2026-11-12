# SALTARÍN

Runner de un botón con auto-scroll lateral. El jugador controla un cubo de neón que avanza solo por el escenario y tiene que saltar trampas para llegar al final de cada nivel. Son 3 niveles y cada uno agrega un tipo de obstáculo nuevo.

Trabajo Práctico Módulo 7: Desarrollo Tecnológico 2 (UNRaf).

## Integrantes

- Mariano _[Apellido]_
- _[Nombre Apellido]_

## Tecnologías

- JavaScript
- Node.js
- Vite
- Phaser 4 (Arcade Physics)

## Instalación

```
npm install
```

## Ejecutar

```
npm run dev
```

## Build

```
npm run build
```

## Gameplay

El cubo avanza automáticamente y el jugador solo decide cuándo saltar. Si toca una trampa, muere, el nivel reinicia desde el principio y se suma un intento. Al llegar al final de un nivel se pasa al siguiente.

### Objetivo

Completar los 3 niveles con la menor cantidad de intentos posible.

### Mecánicas principales

- **Salto de altura fija:** solo con apoyo, sin doble salto.
- **Avance automático:** el mundo se desplaza y la velocidad aumenta en cada nivel.
- **Obstáculos progresivos:**
  - Nivel 1: pinchos
  - Nivel 2: se suman los pozos
  - Nivel 3: se suman los bloques (se puede caminar encima; chocarlos de costado mata)
- **Progreso:** barra con el % recorrido del nivel, contador de intentos totales e indicador de nivel.
- **Victoria:** completar el nivel 3. **Derrota:** tocar una trampa reinicia el nivel actual.

## Controles

| Acción | Control |
|---|---|
| Saltar / Comenzar / Continuar | Espacio o click |
| Reiniciar el juego (pantalla final) | R |

## Arquitectura

El código está organizado por responsabilidad: escenas, entidades, sistemas, patrones y datos de niveles. Los niveles son **datos** (`src/data/levels.js`), no código: para balancear un nivel se editan posiciones y velocidades sin tocar la lógica.

```
src/
├── scenes/     MenuScene, GameScene, LevelCompleteScene, VictoryScene
├── entities/   Player, Spike, Pit, Block
├── systems/    LevelManager, HUD
├── patterns/   ObstaclePool, EventBus
├── data/       levels.js
├── assets/     (vacío: todo se dibuja con formas de Phaser)
└── main.js
```

```
GameScene
├── Player
├── LevelManager
│   └── ObstaclePool
│       ├── Spike
│       ├── Pit
│       └── Block
└── HUD
        ▲
     EventBus (eventos entre sistemas)
```

### Patrones de diseño utilizados

**Object Pool (`src/patterns/ObstaclePool.js`)**
- *Problema:* en cada nivel aparecen y desaparecen decenas de obstáculos, y el nivel se reinicia muchas veces.
- *Solución:* hay un pool por tipo de obstáculo. El `LevelManager` pide un obstáculo cuando su posición entra por la derecha de la pantalla y lo devuelve cuando sale por la izquierda. Al reiniciar el nivel, todos los obstáculos vuelven al pool: no se crean ni se destruyen objetos durante la partida.

**Observer (`src/patterns/EventBus.js`)**
- *Problema:* el HUD, el contador de intentos y el flujo entre niveles dependen de lo que pasa en el juego, pero no deberían conocerse entre sí.
- *Solución:* un bus de eventos (`player:died`, `level:progress`, `level:completed`, `attempts:changed`). Cada sistema se suscribe a lo que le interesa y se desuscribe en el evento `shutdown` de la escena, para que los listeners no se dupliquen en cada reinicio.

## Desarrollo con OpenCode

### Agentes de OpenCode utilizados

- **Plan:** análisis del GDD y del proyecto, y planificación de cada funcionalidad sin modificar archivos.
- **Build:** implementación de un paso concreto del plan por vez.
- **Modelo:** Big Pickle (gratuito, vía OpenCode Zen), en la versión de terminal de OpenCode 1.19.5.
- **Contexto del agente:** `AGENTS.md` (stack, arquitectura, patrones obligatorios y reglas), generado con `/init` y completado con la plantilla de la cátedra.

### Flujo de trabajo

Para cada funcionalidad: se eligió un punto del GDD → se analizó con **Plan** → se revisó y corrigió el plan → se implementó un paso con **Build** → se probó con `npm run dev` → se corrigieron los errores → se hizo commit.

### Principales prompts empleados

Todos los prompts siguen la plantilla Contexto / Objetivo / Comportamiento esperado / Restricciones / Criterio de finalización / Verificación.

**Plan general (Plan):**
> Analizá docs/GDD.md, AGENTS.md y la estructura actual del proyecto. Necesito un plan de implementación completo del juego. Para cada paso indicá qué se desarrolla, archivos afectados, comportamiento esperado, cómo se prueba, dependencias y qué queda fuera. [...] Detectá posibles problemas con el reinicio de nivel. No modifiques ningún archivo todavía.

_[Completar con los prompts de Build más representativos, por ejemplo el del ObstaclePool y el del EventBus.]_

### Problemas encontrados y soluciones aplicadas

| Problema | Solución |
|---|---|
| `npm` no se reconocía como comando: Node.js no estaba instalado. | Se instaló Node.js. |
| `/init` se ejecutó antes de crear el proyecto Phaser y generó un `AGENTS.md` que indicaba que no había código. | Se creó el scaffold con `npx @phaserjs/create-game@latest` y se completó `AGENTS.md` con la plantilla de la cátedra y las reglas del GDD. |
| La app de escritorio y la versión de terminal de OpenCode compartían la base de datos de sesiones y fallaban con "Database is not empty and has no session table". | Se configuró una base de datos separada para la terminal con la variable `OPENCODE_DB`. |
| La carpeta `Docs` quedó con mayúscula; GitHub distingue mayúsculas y el GDD debía estar en `docs/`. | Se renombró con `git mv` en dos pasos (Windows no detecta cambios que son solo de mayúsculas). |
| _[Completar con los problemas que aparezcan durante el desarrollo]_ | |

## Documentación

- GDD: [`docs/GDD.pdf`](docs/GDD.pdf)
- Reglas del agente: [`AGENTS.md`](AGENTS.md)

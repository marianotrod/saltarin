# SALTARÍN

Runner de un botón con auto-scroll lateral. El jugador controla un cubo de neón que avanza solo por el escenario y tiene que saltar trampas para llegar al final de cada nivel. Son 3 niveles y cada uno agrega un tipo de obstáculo nuevo.

| | |
|---|---|
| **Trabajo práctico** | Módulo 7 — Desarrollo Tecnológico 2 |
| **Universidad** | Universidad Nacional de Rafaela (UNRaf) |
| **Profesores** | Nocete, Nicolás - Galván, Agustín |
| **Alumno** | Trod, Mariano |

## Integrantes

- Mariano Trod

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

- **Salto de altura fija:** solo con apoyo (suelo o bloque), sin doble salto.
- **Avance automático:** el cubo avanza a la velocidad del nivel y la cámara lo sigue; la velocidad aumenta en cada nivel (300, 350 y 400 px/s).
- **Obstáculos progresivos:**
  - Nivel 1: pinchos
  - Nivel 2: se suman los pozos
  - Nivel 3: se suman los bloques (se puede caminar encima; chocarlos de costado mata)
- **Progreso:** barra con el % recorrido del nivel, contador de intentos totales e indicador "Nivel X/3".
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
- *Problema:* en cada nivel aparecen y desaparecen muchos obstáculos, y el nivel se reinicia muchas veces.
- *Solución:* hay un pool por tipo de obstáculo, con una capacidad fija menor que la cantidad de obstáculos del nivel, para que el reciclado ocurra durante la partida: **8 pinchos, 3 pozos y 3 bloques**. El `LevelManager` pide un obstáculo cuando su posición entra por la derecha de la pantalla y lo devuelve cuando sale por la izquierda. Si el pool no tiene objetos libres, la aparición se reintenta en el frame siguiente: nunca se crean objetos nuevos.
- *En el reinicio:* al morir, `LevelManager.reset()` devuelve todos los obstáculos activos al pool y el nivel vuelve a empezar sin `scene.restart()`. Cada nivel crea sus pools una sola vez y todas las muertes reutilizan los mismos objetos.

**Observer (`src/patterns/EventBus.js`)**
- *Problema:* el HUD, el contador de intentos y el flujo entre niveles dependen de lo que pasa en el juego, pero no deberían conocerse entre sí.
- *Solución:* un bus de eventos (`player:died`, `level:progress`, `level:completed`, `attempts:changed`). Cada sistema se suscribe a lo que le interesa y se desuscribe en el evento `shutdown` de la escena, para que los listeners no se dupliquen en cada reinicio.

### Diferencias con el GDD

- **Hitbox de los pinchos:** el GDD describe un triángulo de 40×40, pero Arcade Physics no tiene cuerpos triangulares: el cuerpo de colisión es un rectángulo de 40×40.
- **Opcionales no implementados:** la rotación del cubo durante el salto y el destello al morir (el GDD los marca como opcionales).

## Desarrollo con OpenCode

### Agentes de OpenCode utilizados

- **Plan:** análisis del GDD y del proyecto, y planificación de cada funcionalidad sin modificar archivos.
- **Build:** implementación de un paso concreto del plan por vez.
- **Modelo:** Big Pickle (gratuito, vía OpenCode Zen), en la versión de terminal de OpenCode 1.19.5.
- **Contexto del agente:** `AGENTS.md` (stack, arquitectura, patrones obligatorios y reglas), generado con `/init` y completado con la plantilla de la cátedra.

### Flujo de trabajo

1. Con **Plan** se generó un plan general de 11 pasos a partir del GDD. Se revisó y se corrigió antes de implementar (por ejemplo, la capacidad del pool).
2. Antes de los pasos más riesgosos (5: Object Pool, 6: muerte y reinicio, 8: pozos, 10: bloques) se pidió un **mini-plan** con Plan, que se revisó y se ajustó.
3. Cada paso se implementó con **Build**, de a uno por vez.
4. Se probó con `npm run dev`, se verificó con `npm run build`, se corrigieron los errores encontrados y se hizo commit. El historial de commits refleja un commit por paso.

### Uso de Claude Code

A partir del Paso 2 se usó Claude Code (Anthropic) como asistente de revisión y testing: revisó el código generado por OpenCode contra cada prompt, ejecutó pruebas automatizadas en Chrome headless (bots que recorren los niveles, mediciones de salto y colisiones) y realizó los commits. Toda la implementación del juego se hizo con OpenCode (Plan/Build). Los commits desde el Paso 2 incluyen la línea Co-Authored-By de Claude por ese motivo.

### Principales prompts empleados

Todos los prompts siguen la plantilla Contexto / Objetivo / Comportamiento esperado / Restricciones / Criterio de finalización / Verificación.

**Plan general (Plan):**
> Analizá docs/GDD.md, AGENTS.md y la estructura actual del proyecto. Necesito un plan de implementación completo del juego. Para cada paso indicá qué se desarrolla, archivos afectados, comportamiento esperado, cómo se prueba, dependencias y qué queda fuera. [...] Detectá posibles problemas con el reinicio de nivel. No modifiques ningún archivo todavía.

**Mini-plan antes de un paso riesgoso (Plan):**
> Analizá el Paso N del plan aprobado y el estado actual del código. Indicá archivos a crear/modificar, cómo se implementa, cómo probarlo y qué riesgos ves. No modifiques ningún archivo todavía.

**Paso 6: muerte, intentos y reinicio (Build), con un ajuste al plan revisado:**
> **Contexto:** SALTARÍN, Pasos 1-5 terminados y commiteados. El plan del Paso 6 que presentaste está aprobado con un ajuste.
> **Objetivo:** Implementar SOLO el Paso 6 según tu plan: colisión letal con pinchos, intentos y reinicio del nivel en el lugar.
> **Comportamiento esperado:** LevelManager con spikeGroup estático y reset() (releaseAll(), índice de aparición, progreso y lastProgressPercent). Player.reset(x, y). En GameScene, el overlap jugador-pincho emite player:died; handlePlayerDied suma exactamente 1 intento en el registry y emite attempts:changed (guard isDying); el reinicio real se hace en update(), no dentro del callback de colisión; EventBus.off(PLAYER_DIED) en shutdown.
> **Ajuste obligatorio:** agregar un processCallback al overlap que solo acepte pinchos activos. Motivo: agregar al staticGroup objetos ya desactivados por el pool puede volver a habilitar su cuerpo, y quedarían pinchos invisibles letales.
> **Restricciones:** No usar scene.restart(). No crear archivos nuevos. Sin pozos, bloques ni flujo entre niveles.
> **Criterio de finalización:** Morir 3 veces muestra Intentos 1, 2 y 3; morir en un grupo de 2 o 3 pinchos suma solo 1; los pinchos reaparecen sin duplicarse; se puede saltar inmediatamente después del reinicio.
> **Verificación:** npm.cmd run build. Explicá cómo verificar que no hay doble conteo de intentos.

**Paso 8: pozos (Build), respondiendo las preguntas del mini-plan:**
> **Respuestas:** Sí, el Paso 8 es solo pozos (nivel 2) + pool de pozos. Elijo el enfoque recomendado: suelo partido + Pit sensor pooled.
> **Comportamiento esperado:** LevelManager arma los segmentos de suelo a partir de los pozos (un cuerpo estático por segmento, huecos reales); createGround() solo en el constructor. La línea y las marcas del suelo se dibujan solo sobre los segmentos. Pit.js: sensor reciclable con PIT_POOL_CAPACITY = 3, 8 px por debajo del suelo. Collider del suelo antes del overlap de pozos. Kill line de respaldo. Caer emite player:died con la misma muerte y reinicio que los pinchos.
> **Criterio de finalización:** se pueden saltar los pozos; aterrizar en el borde lejano no mata; caer mata, suma 1 intento y reinicia; sin pozos duplicados ni suelo superpuesto tras el reinicio.

**Paso 10: corrección de un error encontrado en las pruebas (Build):**
> **Problema:** la tolerancia de aterrizaje en la esquina delantera no funciona. Si el jugador llega bajando a la cara frontal con la parte inferior 5–8 px por debajo del techo del bloque, isLandingOnBlock devuelve true, pero Arcade ya resolvió la colisión empujándolo en X: queda pegado al costado, sigue cayendo y en el frame siguiente muere.
> **Objetivo:** cuando el contacto se clasifica como aterrizaje pero el jugador quedó por debajo del techo, reubicarlo sobre el bloque manteniendo el avance normal.
> **Restricciones:** no cambiar BLOCK_LANDING_TOLERANCE ni la detección del frame anterior.
> **Criterio de finalización:** con la base 5 u 8 px bajo el techo aterriza arriba; con 10 px o más muere de costado.

### Problemas encontrados y soluciones aplicadas

| Problema | Solución |
|---|---|
| `npm` no se reconocía como comando: Node.js no estaba instalado. | Se instaló Node.js. |
| `/init` se ejecutó antes de crear el proyecto Phaser y generó un `AGENTS.md` que indicaba que no había código. | Se creó el scaffold con `npx @phaserjs/create-game@latest` y se completó `AGENTS.md` con la plantilla de la cátedra y las reglas del GDD. |
| La app de escritorio y la versión de terminal de OpenCode compartían la base de datos de sesiones y fallaban con "Database is not empty and has no session table". | Se configuró una base de datos separada para la terminal con la variable `OPENCODE_DB`. |
| La carpeta `Docs` quedó con mayúscula; GitHub distingue mayúsculas y el GDD debía estar en `docs/`. | Se renombró con `git mv` en dos pasos (Windows no detecta cambios que son solo de mayúsculas). |
| El agente Plan detectó que el template oficial instala Phaser 4 y la documentación decía Phaser 3. | Se mantuvo Phaser 4 (lo instala el template que pide la cátedra) y se actualizaron el GDD y `AGENTS.md`. |
| En la revisión del plan general se detectó que un pool dimensionado según el total de obstáculos del nivel nunca reciclaría: el patrón quedaría decorativo. | Capacidad fija menor que la cantidad del nivel (8 pinchos, 3 pozos, 3 bloques) y un log temporal para verificar el reciclado, quitado en el Paso 11. |
| PowerShell bloqueaba `npm` dentro del agente por la política de ejecución. | El agente usó `npm.cmd`. |
| Paso 5: los pinchos no aparecían en `npm run dev` aunque el código estaba bien. El servidor de Vite seguía sirviendo una versión vieja de `levels.js`. | Se reinició `npm run dev`. |
| Paso 6: en la revisión del mini-plan se detectó que agregar pinchos ya desactivados a un `staticGroup` podía volver a habilitar su cuerpo y dejar pinchos invisibles letales. | Se agregó un `processCallback` que solo acepta obstáculos activos. |
| Paso 10: al caer sobre la esquina delantera de un bloque con la base 5–8 px bajo el techo, el jugador moría aunque la tolerancia era de 8 px, porque Arcade resolvía la colisión empujándolo en X. | Se detectó con una prueba automatizada píxel a píxel y se pidió una corrección a OpenCode: si el contacto es un aterrizaje, el jugador se reubica sobre el bloque. |

### Evidencias

Capturas del trabajo con OpenCode en [`docs/evidencias/`](docs/evidencias/):

- Plan general: [análisis del proyecto](docs/evidencias/plan-general-01-analisis.png), [discrepancia Phaser 3/4](docs/evidencias/plan-general-02-discrepancia-phaser4.png), [problemas de reinicio](docs/evidencias/plan-general-03-problemas-reinicio.png), [decisiones base](docs/evidencias/plan-general-04-decisiones-base.png)
- Paso 1: [prueba en el navegador](docs/evidencias/paso01-prueba-consola.png)
- Paso 5: [mini-plan](docs/evidencias/paso05-plan-opencode.png)
- Paso 6: [mini-plan](docs/evidencias/paso06-plan-opencode.png)
- Paso 7: [build](docs/evidencias/paso07-build-opencode.png)
- Paso 8: [mini-plan](docs/evidencias/paso08-plan-opencode.png), [build](docs/evidencias/paso08-build-opencode.png)
- Paso 9: [build](docs/evidencias/paso09-build-opencode.png)
- Paso 10: [mini-plan](docs/evidencias/paso10-plan-opencode.png), [build](docs/evidencias/paso10-build-opencode.png), [corrección de la esquina](docs/evidencias/paso10-correccion-esquina.png)
- Paso 11: [limpieza final y diferencias con el GDD](docs/evidencias/paso11-build-opencode.png)

## Documentación

- GDD: [`docs/GDD.pdf`](docs/GDD.pdf)
- Reglas del agente: [`AGENTS.md`](AGENTS.md)

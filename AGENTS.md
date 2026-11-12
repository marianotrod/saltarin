# AGENTS.md — SALTARÍN

## Proyecto
Videojuego runner de un botón desarrollado para el TP Módulo 7 de Desarrollo Tecnológico 2 (UNRaf).
`docs/GDD.md` es la especificación autoritativa: leelo antes de tocar código. Esta guía resume lo obligatorio o fácil de romper.

## Stack
- JavaScript (vanilla, ES modules)
- Node.js
- Vite
- Phaser 3

## Objetivo
Desarrollar un videojuego pequeño pero completo aplicando:
- Buenas prácticas de organización de código.
- Patrones de diseño (Object Pool y Observer).
- Desarrollo asistido por agentes de programación (OpenCode, modos Plan y Build).

## Arquitectura
```
src/
├── scenes/    MenuScene, GameScene, LevelCompleteScene, VictoryScene
├── entities/  Player, Spike, Pit, Block
├── systems/   LevelManager (lee levels.js y spawnea), HUD (barra %, intentos, nivel)
├── patterns/  ObstaclePool (Object Pool), EventBus (Observer)
├── data/      levels.js
├── assets/    (vacío: todo se dibuja con formas de Phaser)
└── main.js
```

## Patrones obligatorios
- **Object Pool (`ObstaclePool`)**: un pool por tipo de obstáculo. El LevelManager pide un obstáculo cuando su X entra por la derecha y lo devuelve cuando sale por la izquierda. Al reiniciar el nivel, todos los activos vuelven al pool. Nunca crear ni destruir obstáculos durante la partida.
- **Observer (`EventBus`)**: HUD, intentos y flujo de niveles se comunican por eventos (`player:died`, `level:progress`, `level:completed`, `attempts:changed`). **Todo suscriptor debe desuscribirse en el evento `shutdown` de su escena**; si no, los listeners se duplican en cada reinicio.

## Reglas del juego (GDD)
- **Los niveles son datos**: `src/data/levels.js` define velocidad, largo y obstáculos con su X. Balancear = editar datos, nunca código. No crear lógica específica por nivel.
- **Física base**: gravedad 2000 px/s², salto −750 px/s. Salto de altura fija, solo con apoyo; sin doble salto ni salto variable.
- El jugador está fijo en X (~25% del ancho); el mundo se desplaza a la izquierda a la velocidad del nivel.
- **Muerte** → reinicia el nivel actual y suma 1 intento. El contador no vuelve a 0 entre niveles; solo `R` en la pantalla final reinicia todo.
- Escenas: `MenuScene → GameScene (nivel N) → LevelCompleteScene → GameScene (N+1)`; tras el nivel 3 → `VictoryScene —R→ nivel 1`.

## Reglas para el agente
- Utilizar JavaScript. No agregar TypeScript.
- Utilizar Phaser (Arcade Physics).
- Mantener las clases pequeñas y con responsabilidades claras.
- Evitar concentrar toda la lógica en GameScene.
- Evitar lógica duplicada y variables globales innecesarias.
- No agregar dependencias externas.
- No agregar assets externos: todo se dibuja con formas (paleta neón del GDD §10: fondo `#0d0221`, jugador `#00f0ff`, pinchos `#ff2a6d`, suelo `#05d9e8`, bloques `#7b2cbf`, UI `#d1f7ff`).
- Textos e interfaz en español.
- No agregar nada fuera de alcance (GDD §12): sonido, más de 3 niveles, editor, récords, touch, selector de niveles, power-ups.
- Priorizar soluciones comprensibles y respetar la arquitectura existente.
- Modificar únicamente los archivos necesarios para la tarea pedida.

## Flujo de trabajo
Antes de realizar cambios importantes:
1. Analizar el código existente.
2. Explicar brevemente el cambio propuesto.
3. Identificar las clases y archivos afectados.
4. Implementar el cambio, verificar con `npm run build` y explicar cómo probarlo manualmente.

## Comandos
- Instalar dependencias: `npm install`
- Ejecutar: `npm run dev`
- Build: `npm run build`

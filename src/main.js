import { AUTO, Game, Scale } from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { VictoryScene } from './scenes/VictoryScene';

const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#0d0221',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 2000 },
            debug: false
        }
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        MenuScene,
        GameScene,
        LevelCompleteScene,
        VictoryScene
    ]
};

const startGame = () => {
    new Game({ ...config, parent: 'game-container' });
};

document.addEventListener('DOMContentLoaded', startGame);

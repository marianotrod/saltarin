import { AUTO, Game, Scale } from 'phaser';
import { GameScene } from './scenes/GameScene';

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
        GameScene
    ]
};

const startGame = () => {
    new Game({ ...config, parent: 'game-container' });
};

document.addEventListener('DOMContentLoaded', startGame);

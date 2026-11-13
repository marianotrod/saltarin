import { Scene } from 'phaser';

export class LevelCompleteScene extends Scene
{
    constructor ()
    {
        super('LevelCompleteScene');
    }

    init (data)
    {
        this.levelNumber = data?.levelNumber ?? 1;
        this.nextLevelIndex = data?.nextLevelIndex ?? this.levelNumber;
    }

    create ()
    {
        const width = this.scale.width;
        const height = this.scale.height;
        const attempts = this.registry.get('attempts') ?? 0;

        this.started = false;

        this.add.text(width / 2, height * 0.32, `Nivel ${this.levelNumber} completo`, {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: '#00f0ff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.52, `Intentos acumulados: ${attempts}`, {
            fontFamily: 'Arial',
            fontSize: '30px',
            color: '#d1f7ff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.68, 'Espacio o click para continuar', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#d1f7ff'
        }).setOrigin(0.5);

        this.handleContinueKey = () => this.continueGame();
        this.handleContinuePointer = () => this.continueGame();

        this.input.keyboard.on('keyup-SPACE', this.handleContinueKey);
        this.input.on('pointerup', this.handleContinuePointer);

        this.events.once('shutdown', () => this.removeInputListeners());
    }

    continueGame ()
    {
        if (this.started)
        {
            return;
        }

        this.started = true;

        this.removeInputListeners();

        this.scene.start('GameScene', { levelIndex: this.nextLevelIndex });
    }

    removeInputListeners ()
    {
        this.input.keyboard.off('keyup-SPACE', this.handleContinueKey);
        this.input.off('pointerup', this.handleContinuePointer);
    }
}

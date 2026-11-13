import { Scene } from 'phaser';

export class VictoryScene extends Scene
{
    constructor ()
    {
        super('VictoryScene');
    }

    create ()
    {
        const width = this.scale.width;
        const height = this.scale.height;
        const attempts = this.registry.get('attempts') ?? 0;

        this.started = false;

        this.add.text(width / 2, height * 0.32, '¡Ganaste!', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#00f0ff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.52, `Intentos totales: ${attempts}`, {
            fontFamily: 'Arial',
            fontSize: '30px',
            color: '#d1f7ff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.68, 'R para reiniciar', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#d1f7ff'
        }).setOrigin(0.5);

        this.handleRestartKey = () => this.restartGame();

        this.input.keyboard.on('keyup-R', this.handleRestartKey);

        this.events.once('shutdown', () => this.removeInputListeners());
    }

    restartGame ()
    {
        if (this.started)
        {
            return;
        }

        this.started = true;

        this.removeInputListeners();

        this.registry.set('attempts', 0);
        this.scene.start('GameScene', { levelIndex: 0 });
    }

    removeInputListeners ()
    {
        this.input.keyboard.off('keyup-R', this.handleRestartKey);
    }
}

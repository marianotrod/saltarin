import { Scene } from 'phaser';

export class MenuScene extends Scene
{
    constructor ()
    {
        super('MenuScene');
    }

    create ()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        this.started = false;

        this.add.text(width / 2, height * 0.32, 'SALTARÍN', {
            fontFamily: 'Arial Black',
            fontSize: '72px',
            color: '#00f0ff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.55, 'Espacio o click para jugar', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#d1f7ff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.68, 'Espacio / click = saltar', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#d1f7ff'
        }).setOrigin(0.5);

        this.handleStartKey = () => this.startGame();
        this.handleStartPointer = () => this.startGame();

        this.input.keyboard.on('keyup-SPACE', this.handleStartKey);
        this.input.on('pointerup', this.handleStartPointer);
    }

    startGame ()
    {
        if (this.started)
        {
            return;
        }

        this.started = true;

        this.input.keyboard.off('keyup-SPACE', this.handleStartKey);
        this.input.off('pointerup', this.handleStartPointer);

        this.registry.set('attempts', 0);

        this.scene.start('GameScene');
    }
}

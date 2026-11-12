import { Input, Scene } from 'phaser';
import { Player, PLAYER_SIZE } from '../entities/Player';
import { GROUND_Y, LEVEL_START_X, LevelManager, PLAYER_SCREEN_X } from '../systems/LevelManager';

export class GameScene extends Scene
{
    constructor ()
    {
        super('GameScene');
    }

    create ()
    {
        this.levelManager = new LevelManager(this, 0);

        this.player = new Player(
            this,
            LEVEL_START_X,
            GROUND_Y - PLAYER_SIZE / 2
        );

        this.physics.add.collider(this.player, this.levelManager.ground);

        this.cameras.main.startFollow(this.player, true, 1, 0, -PLAYER_SCREEN_X, 0);
        this.cameras.main.scrollY = 0;

        this.jumpKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
        this.handlePointerDown = () => this.tryJump();

        this.input.on('pointerdown', this.handlePointerDown);

        this.player.run(this.levelManager.speed);
        this.completionText = null;

        this.events.once('shutdown', () => {
            this.input.off('pointerdown', this.handlePointerDown);
        });
    }

    update ()
    {
        if (this.levelManager.update(this.player.x))
        {
            this.player.stopRunning();
            this.showCompletion();
            return;
        }

        this.player.run(this.levelManager.speed);

        if (Input.Keyboard.JustDown(this.jumpKey))
        {
            this.tryJump();
        }
    }

    tryJump ()
    {
        if (!this.levelManager.completed)
        {
            this.player.jump();
        }
    }

    showCompletion ()
    {
        if (this.completionText)
        {
            return;
        }

        const camera = this.cameras.main;

        this.completionText = this.add.text(
            camera.width / 2,
            camera.height / 2,
            'Nivel completo',
            {
                fontFamily: 'Arial',
                fontSize: '36px',
                color: '#d1f7ff'
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(100);
    }
}

import { Input, Scene } from 'phaser';
import { Player, PLAYER_SIZE } from '../entities/Player';
import { HUD } from '../systems/HUD';
import { GROUND_Y, LEVEL_START_X, LevelManager, PLAYER_SCREEN_X } from '../systems/LevelManager';
import { EventBus, EVENTS } from '../patterns/EventBus';

export class GameScene extends Scene
{
    constructor ()
    {
        super('GameScene');
    }

    create ()
    {
        this.levelManager = new LevelManager(this, 0);

        this.isDying = false;
        this.handlePlayerDied = () => this.onPlayerDied();

        EventBus.on(EVENTS.PLAYER_DIED, this.handlePlayerDied);

        this.hud = new HUD(
            this,
            this.levelManager.level.number,
            this.levelManager.totalLevels
        );

        this.player = new Player(
            this,
            LEVEL_START_X,
            GROUND_Y - PLAYER_SIZE / 2
        );

        this.physics.add.collider(this.player, this.levelManager.ground);
        this.physics.add.overlap(
            this.player,
            this.levelManager.spikeGroup,
            this.handleSpikeOverlap,
            this.canHitSpike,
            this
        );

        this.cameras.main.startFollow(this.player, true, 1, 0, -PLAYER_SCREEN_X, 0);
        this.cameras.main.scrollY = 0;

        this.jumpKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
        this.handlePointerDown = () => this.tryJump();

        this.input.on('pointerdown', this.handlePointerDown);

        this.player.run(this.levelManager.speed);
        this.completionText = null;

        this.events.once('shutdown', () => {
            this.input.off('pointerdown', this.handlePointerDown);
            EventBus.off(EVENTS.PLAYER_DIED, this.handlePlayerDied);
            this.hud.destroy();
        });
    }

    update ()
    {
        if (this.isDying)
        {
            this.restartLevel();
            this.isDying = false;
            return;
        }

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
        if (!this.levelManager.completed && !this.isDying)
        {
            this.player.jump();
        }
    }

    canHitSpike (player, spike)
    {
        return spike.active === true && !this.isDying && !this.levelManager.completed;
    }

    handleSpikeOverlap ()
    {
        if (this.isDying || this.levelManager.completed)
        {
            return;
        }

        EventBus.emit(EVENTS.PLAYER_DIED);
    }

    onPlayerDied ()
    {
        if (this.isDying || this.levelManager.completed)
        {
            return;
        }

        this.isDying = true;

        const attempts = (this.registry.get('attempts') ?? 0) + 1;

        this.registry.set('attempts', attempts);
        EventBus.emit(EVENTS.ATTEMPTS_CHANGED, attempts);
    }

    restartLevel ()
    {
        this.levelManager.reset();

        this.player.reset(LEVEL_START_X, GROUND_Y - PLAYER_SIZE / 2);

        this.cameras.main.scrollX = LEVEL_START_X - PLAYER_SCREEN_X;
        this.cameras.main.scrollY = 0;

        if (this.completionText)
        {
            this.completionText.destroy();
            this.completionText = null;
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

import { Input, Scene } from 'phaser';
import { Player, PLAYER_SIZE } from '../entities/Player';
import { HUD } from '../systems/HUD';
import { GROUND_Y, LEVEL_START_X, LevelManager, PLAYER_SCREEN_X } from '../systems/LevelManager';
import { EventBus, EVENTS } from '../patterns/EventBus';

const FALL_DEATH_DEPTH = 120;
const BLOCK_LANDING_TOLERANCE = 8;
const BLOCK_SNAP_SUPPORT = 2;
const BLOCK_SNAP_EPSILON = 0.5;

export class GameScene extends Scene
{
    constructor ()
    {
        super('GameScene');
    }

    init (data)
    {
        this.levelIndex = data?.levelIndex ?? 0;
    }

    create ()
    {
        this.levelManager = new LevelManager(this, this.levelIndex);

        this.isDying = false;
        this.levelActive = true;
        this.transitioning = false;
        this.transitionStarted = false;

        this.handlePlayerDied = () => this.onPlayerDied();
        this.handleLevelCompleted = (levelNumber) => this.onLevelCompleted(levelNumber);

        EventBus.on(EVENTS.PLAYER_DIED, this.handlePlayerDied);
        EventBus.on(EVENTS.LEVEL_COMPLETED, this.handleLevelCompleted);

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
        this.physics.add.collider(
            this.player,
            this.levelManager.blockGroup,
            this.handleBlockCollision,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.levelManager.spikeGroup,
            this.handleObstacleOverlap,
            this.canHitObstacle,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.levelManager.pitGroup,
            this.handleObstacleOverlap,
            this.canHitObstacle,
            this
        );

        this.cameras.main.startFollow(this.player, true, 1, 0, -PLAYER_SCREEN_X, 0);
        this.cameras.main.scrollY = 0;

        this.jumpKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
        this.handlePointerDown = () => this.tryJump();

        this.input.on('pointerdown', this.handlePointerDown);

        this.player.run(this.levelManager.speed);

        this.events.once('shutdown', () => {
            this.input.off('pointerdown', this.handlePointerDown);
            EventBus.off(EVENTS.PLAYER_DIED, this.handlePlayerDied);
            EventBus.off(EVENTS.LEVEL_COMPLETED, this.handleLevelCompleted);
            this.hud.destroy();
        });
    }

    update ()
    {
        if (this.transitioning)
        {
            return;
        }

        if (this.isDying)
        {
            this.restartLevel();
            return;
        }

        if (!this.levelActive)
        {
            return;
        }

        if (this.player.y - PLAYER_SIZE / 2 > GROUND_Y + FALL_DEATH_DEPTH)
        {
            EventBus.emit(EVENTS.PLAYER_DIED);
            return;
        }

        if (this.levelManager.update(this.player.x))
        {
            this.finishLevel();
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
        if (this.levelActive && !this.isDying && !this.transitioning && !this.levelManager.completed)
        {
            this.player.jump();
        }
    }

    canHitObstacle (player, obstacle)
    {
        return obstacle.active === true &&
            this.levelActive &&
            !this.isDying &&
            !this.transitioning &&
            !this.levelManager.completed;
    }

    handleObstacleOverlap ()
    {
        if (!this.levelActive || this.isDying || this.transitioning || this.levelManager.completed)
        {
            return;
        }

        EventBus.emit(EVENTS.PLAYER_DIED);
    }

    handleBlockCollision (player, block)
    {
        if (!this.canHitObstacle(player, block))
        {
            return;
        }

        if (this.isLandingOnBlock(player, block))
        {
            this.snapPlayerOnBlock(player, block);

            return;
        }

        EventBus.emit(EVENTS.PLAYER_DIED);
    }

    snapPlayerOnBlock (player, block)
    {
        if (player.body.bottom <= block.body.top + BLOCK_SNAP_EPSILON)
        {
            return;
        }

        const half = PLAYER_SIZE / 2;
        const onLeft = player.body.right <= block.body.left + BLOCK_SNAP_SUPPORT;
        const onRight = player.body.left >= block.body.right - BLOCK_SNAP_SUPPORT;

        if (onLeft)
        {
            player.snapOnTop(
                block.body.left + BLOCK_SNAP_SUPPORT - half,
                block.body.top - half,
                this.levelManager.speed
            );

            return;
        }

        if (onRight)
        {
            player.snapOnTop(
                block.body.right - BLOCK_SNAP_SUPPORT + half,
                block.body.top - half,
                this.levelManager.speed
            );
        }
    }

    isLandingOnBlock (player, block)
    {
        const previousBottom = player.body.prev.y + player.body.height;

        return previousBottom <= block.body.top + BLOCK_LANDING_TOLERANCE;
    }

    onPlayerDied ()
    {
        if (!this.levelActive || this.isDying || this.transitioning || this.levelManager.completed)
        {
            return;
        }

        this.isDying = true;
        this.levelActive = false;

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

        this.isDying = false;
        this.levelActive = true;
    }

    finishLevel ()
    {
        if (!this.levelActive || this.transitioning)
        {
            return;
        }

        this.transitioning = true;
        this.levelActive = false;
        this.player.stopRunning();

        EventBus.emit(EVENTS.LEVEL_COMPLETED, this.levelManager.level.number);
    }

    onLevelCompleted (levelNumber)
    {
        if (!this.transitioning || this.transitionStarted)
        {
            return;
        }

        this.transitionStarted = true;

        if (levelNumber < this.levelManager.totalLevels)
        {
            this.scene.start('LevelCompleteScene', {
                levelNumber,
                nextLevelIndex: this.levelIndex + 1
            });

            return;
        }

        this.scene.start('VictoryScene');
    }
}

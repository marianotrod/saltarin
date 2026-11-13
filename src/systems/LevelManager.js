import { LEVELS } from '../data/levels';
import { Spike, SPIKE_SIZE } from '../entities/Spike';
import { Pit } from '../entities/Pit';
import { EventBus, EVENTS } from '../patterns/EventBus';
import { ObstaclePool } from '../patterns/ObstaclePool';

export const GROUND_Y = 620;
export const PLAYER_SCREEN_X = 256;
export const LEVEL_START_X = 0;
export const POOL_CAPACITY = 8;
export const PIT_POOL_CAPACITY = 3;

const SPAWN_MARGIN = 64;
const CULL_MARGIN = 64;

const GROUND_HEIGHT = 148;
const GROUND_START_PADDING = 512;
const GROUND_END_PADDING = 1024;
const MARK_SPACING = 160;

export class LevelManager
{
    constructor (scene, levelIndex = 0)
    {
        this.scene = scene;
        this.level = LEVELS[levelIndex];
        this.totalLevels = LEVELS.length;
        this.speed = this.level.speed;
        this.progress = 0;
        this.completed = false;
        this.lastProgressPercent = -1;

        this.createGround();
        this.createObstaclePools();

        this.obstacleQueue = this.buildObstacleQueue();
        this.nextObstacleIndex = 0;
    }

    createObstaclePools ()
    {
        this.spikeGroup = this.scene.physics.add.staticGroup();
        this.pitGroup = this.scene.physics.add.staticGroup();

        this.pools = new Map();
        this.pools.set(
            'spike',
            new ObstaclePool('spike', () => {
                const spike = new Spike(this.scene);

                this.spikeGroup.add(spike);

                return spike;
            }, POOL_CAPACITY)
        );

        this.pools.set(
            'pit',
            new ObstaclePool('pit', () => {
                const pit = new Pit(this.scene);

                this.pitGroup.add(pit);

                return pit;
            }, PIT_POOL_CAPACITY)
        );
    }

    reset ()
    {
        for (const pool of this.pools.values())
        {
            pool.releaseAll();
        }

        this.nextObstacleIndex = 0;
        this.progress = 0;
        this.completed = false;
        this.lastProgressPercent = -1;
    }

    buildObstacleQueue ()
    {
        const queue = [];

        for (const obstacle of this.level.obstacles)
        {
            if (obstacle.type === 'spike')
            {
                const count = obstacle.count ?? 1;

                for (let i = 0; i < count; i++)
                {
                    queue.push({
                        type: 'spike',
                        x: obstacle.x + i * SPIKE_SIZE
                    });
                }

                continue;
            }

            queue.push({
                type: obstacle.type,
                x: obstacle.x,
                width: obstacle.width
            });
        }

        return queue.sort((a, b) => a.x - b.x);
    }

    createGround ()
    {
        const startX = LEVEL_START_X - GROUND_START_PADDING;
        const endX = LEVEL_START_X + this.level.length + GROUND_END_PADDING;

        this.ground = this.scene.physics.add.staticGroup();

        const marks = this.scene.add.graphics();

        marks.setDepth(1);

        const pits = this.level.obstacles
            .filter((obstacle) => obstacle.type === 'pit')
            .sort((a, b) => a.x - b.x);

        let segmentStart = startX;

        for (const pit of pits)
        {
            this.addGroundSegment(segmentStart, pit.x, marks);
            segmentStart = pit.x + pit.width;
        }

        this.addGroundSegment(segmentStart, endX, marks);
    }

    addGroundSegment (startX, endX, marks)
    {
        const width = endX - startX;

        if (width <= 0)
        {
            return;
        }

        const centerX = startX + width / 2;

        const floor = this.scene.add.rectangle(
            centerX,
            GROUND_Y + GROUND_HEIGHT / 2,
            width,
            GROUND_HEIGHT,
            0x05d9e8,
            0.18
        );

        this.ground.add(floor);

        marks.lineStyle(3, 0x05d9e8, 1);
        marks.lineBetween(startX, GROUND_Y, endX, GROUND_Y);

        marks.lineStyle(1, 0x05d9e8, 0.35);

        for (let x = startX; x <= endX; x += MARK_SPACING)
        {
            marks.lineBetween(x, GROUND_Y, x, this.scene.scale.height);
        }
    }

    update (playerX)
    {
        this.updateObstacles(playerX);

        this.progress = Math.min(Math.max(playerX - LEVEL_START_X, 0) / this.level.length, 1);

        const percent = Math.floor(this.progress * 100);

        if (percent !== this.lastProgressPercent)
        {
            this.lastProgressPercent = percent;
            EventBus.emit(EVENTS.LEVEL_PROGRESS, percent);
        }

        if (!this.completed && this.progress >= 1)
        {
            this.completed = true;
        }

        return this.completed;
    }

    updateObstacles (playerX)
    {
        const viewLeft = playerX - PLAYER_SCREEN_X;
        const viewRight = playerX + this.scene.scale.width - PLAYER_SCREEN_X;

        this.releaseOffscreenObstacles(viewLeft);
        this.spawnObstacles(viewRight);
    }

    spawnObstacles (viewRight)
    {
        while (this.nextObstacleIndex < this.obstacleQueue.length)
        {
            const next = this.obstacleQueue[this.nextObstacleIndex];

            if (next.x > viewRight + SPAWN_MARGIN)
            {
                break;
            }

            const pool = this.pools.get(next.type);

            if (!pool)
            {
                this.nextObstacleIndex++;
                continue;
            }

            const obstacle = pool.get();

            if (!obstacle)
            {
                break;
            }

            obstacle.activate(next.x, GROUND_Y, next.width);
            this.nextObstacleIndex++;
        }
    }

    releaseOffscreenObstacles (viewLeft)
    {
        for (const pool of this.pools.values())
        {
            for (let i = pool.active.length - 1; i >= 0; i--)
            {
                const obstacle = pool.active[i];
                const halfWidth = obstacle.displayWidth / 2;

                if (obstacle.x + halfWidth < viewLeft - CULL_MARGIN)
                {
                    pool.release(obstacle);
                }
            }
        }
    }
}

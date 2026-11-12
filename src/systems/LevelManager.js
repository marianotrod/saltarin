import { LEVELS } from '../data/levels';
import { EventBus, EVENTS } from '../patterns/EventBus';

export const GROUND_Y = 620;
export const PLAYER_SCREEN_X = 256;
export const LEVEL_START_X = 0;

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
    }

    createGround ()
    {
        const startX = LEVEL_START_X - GROUND_START_PADDING;
        const endX = LEVEL_START_X + this.level.length + GROUND_END_PADDING;
        const width = endX - startX;
        const centerX = startX + width / 2;

        this.ground = this.scene.physics.add.staticGroup();

        const floor = this.scene.add.rectangle(
            centerX,
            GROUND_Y + GROUND_HEIGHT / 2,
            width,
            GROUND_HEIGHT,
            0x05d9e8,
            0.18
        );

        this.ground.add(floor);

        const marks = this.scene.add.graphics();

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
}

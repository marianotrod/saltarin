import { GameObjects } from 'phaser';

export const PIT_HEIGHT = 148;

const PIT_DEFAULT_WIDTH = 100;
const PIT_SENSOR_HEIGHT = 40;
const PIT_SENSOR_OFFSET = 8;
const PIT_COLOR = 0x000000;
const PIT_ALPHA = 0.45;

export class Pit extends GameObjects.Rectangle
{
    constructor (scene)
    {
        super(
            scene,
            -PIT_DEFAULT_WIDTH,
            -PIT_HEIGHT,
            PIT_DEFAULT_WIDTH,
            PIT_HEIGHT,
            PIT_COLOR,
            PIT_ALPHA
        );

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setDepth(-1);
    }

    activate (worldX, groundY, width)
    {
        const centerX = worldX + width / 2;
        const centerY = groundY + PIT_HEIGHT / 2;

        this.setSize(width, PIT_HEIGHT);
        this.setPosition(centerX, centerY);
        this.setActive(true);
        this.setVisible(true);

        this.body.enable = true;
        this.body.setSize(width, PIT_SENSOR_HEIGHT);
        this.body.setOffset(0, PIT_SENSOR_OFFSET);
        this.body.reset(centerX, centerY);
    }

    deactivate ()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
    }
}

import { GameObjects } from 'phaser';

export const BLOCK_HEIGHT = 60;

const BLOCK_DEFAULT_WIDTH = 120;
const BLOCK_COLOR = 0x7b2cbf;
const BLOCK_BORDER_COLOR = 0xd1f7ff;
const BLOCK_BORDER_WIDTH = 2;
const BLOCK_DEPTH = 4;

export class Block extends GameObjects.Rectangle
{
    constructor (scene)
    {
        super(
            scene,
            -BLOCK_DEFAULT_WIDTH,
            -BLOCK_HEIGHT,
            BLOCK_DEFAULT_WIDTH,
            BLOCK_HEIGHT,
            BLOCK_COLOR
        );

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setStrokeStyle(BLOCK_BORDER_WIDTH, BLOCK_BORDER_COLOR);
        this.setDepth(BLOCK_DEPTH);
    }

    activate (worldX, groundY, width)
    {
        const centerX = worldX + width / 2;
        const centerY = groundY - BLOCK_HEIGHT / 2;

        this.setSize(width, BLOCK_HEIGHT);
        this.setPosition(centerX, centerY);
        this.setActive(true);
        this.setVisible(true);

        this.body.enable = true;
        this.body.setSize(width, BLOCK_HEIGHT);
        this.body.reset(centerX, centerY);
    }

    deactivate ()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
    }
}

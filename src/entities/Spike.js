import { GameObjects } from 'phaser';

export const SPIKE_SIZE = 40;

const SPIKE_COLOR = 0xff2a6d;

export class Spike extends GameObjects.Triangle
{
    constructor (scene)
    {
        super(
            scene,
            -SPIKE_SIZE,
            -SPIKE_SIZE,
            0,
            SPIKE_SIZE,
            SPIKE_SIZE / 2,
            0,
            SPIKE_SIZE,
            SPIKE_SIZE,
            SPIKE_COLOR
        );

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setDepth(5);
    }

    activate (worldX, groundY)
    {
        const centerX = worldX + SPIKE_SIZE / 2;
        const centerY = groundY - SPIKE_SIZE / 2;

        this.setPosition(centerX, centerY);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.body.reset(centerX, centerY);
    }

    deactivate ()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
    }
}

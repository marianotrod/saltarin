import { GameObjects } from 'phaser';

export const PLAYER_SIZE = 40;

const JUMP_VELOCITY = -750;

export class Player extends GameObjects.Rectangle
{
    constructor (scene, x, y)
    {
        super(scene, x, y, PLAYER_SIZE, PLAYER_SIZE, 0x00f0ff);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(PLAYER_SIZE, PLAYER_SIZE);
        this.setDepth(10);
    }

    run (speed)
    {
        this.body.setVelocityX(speed);
    }

    jump ()
    {
        if (!this.body.blocked.down)
        {
            return false;
        }

        this.body.setVelocityY(JUMP_VELOCITY);

        return true;
    }

    reset (x, y)
    {
        this.body.reset(x, y);
        this.body.setVelocity(0, 0);
    }

    snapOnTop (x, y, speed)
    {
        this.body.reset(x, y);
        this.run(speed);
    }

    stopRunning ()
    {
        this.body.setVelocityX(0);
    }
}

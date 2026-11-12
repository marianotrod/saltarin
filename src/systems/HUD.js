import { EventBus, EVENTS } from '../patterns/EventBus';

const DEPTH = 1000;
const MARGIN = 24;
const BAR_Y = 58;
const BAR_HEIGHT = 16;

export class HUD
{
    constructor (scene, levelNumber, totalLevels)
    {
        this.scene = scene;
        this.destroyed = false;
        this.barWidth = scene.scale.width - MARGIN * 2;

        const attempts = scene.registry.get('attempts') ?? 0;

        this.levelText = scene.add.text(MARGIN, 20, `Nivel ${levelNumber}/${totalLevels}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#d1f7ff'
        })
            .setScrollFactor(0)
            .setDepth(DEPTH);

        this.attemptsText = scene.add.text(scene.scale.width - MARGIN, 20, `Intentos: ${attempts}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#d1f7ff'
        })
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(DEPTH);

        this.progressBackground = scene.add.rectangle(
            MARGIN,
            BAR_Y,
            this.barWidth,
            BAR_HEIGHT,
            0x7b2cbf,
            0.5
        )
            .setOrigin(0, 0.5)
            .setStrokeStyle(2, 0xd1f7ff, 0.6)
            .setScrollFactor(0)
            .setDepth(DEPTH);

        this.progressFill = scene.add.rectangle(
            MARGIN,
            BAR_Y,
            this.barWidth,
            BAR_HEIGHT,
            0x05d9e8
        )
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH)
            .setScale(0, 1);

        this.handleProgress = (percent) => this.setProgress(percent);
        this.handleAttempts = (attempts) => this.setAttempts(attempts);

        EventBus.on(EVENTS.LEVEL_PROGRESS, this.handleProgress);
        EventBus.on(EVENTS.ATTEMPTS_CHANGED, this.handleAttempts);
    }

    setProgress (percent)
    {
        this.progressFill.setScale(Math.min(Math.max(percent, 0), 100) / 100, 1);
    }

    setAttempts (attempts)
    {
        this.attemptsText.setText(`Intentos: ${attempts}`);
    }

    destroy ()
    {
        if (this.destroyed)
        {
            return;
        }

        this.destroyed = true;

        EventBus.off(EVENTS.LEVEL_PROGRESS, this.handleProgress);
        EventBus.off(EVENTS.ATTEMPTS_CHANGED, this.handleAttempts);

        this.levelText.destroy();
        this.attemptsText.destroy();
        this.progressBackground.destroy();
        this.progressFill.destroy();
    }
}

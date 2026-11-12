import { Events } from 'phaser';

export const PLAYER_DIED = 'player:died';
export const LEVEL_PROGRESS = 'level:progress';
export const LEVEL_COMPLETED = 'level:completed';
export const ATTEMPTS_CHANGED = 'attempts:changed';

export const EVENTS = Object.freeze({
    PLAYER_DIED,
    LEVEL_PROGRESS,
    LEVEL_COMPLETED,
    ATTEMPTS_CHANGED
});

export const EventBus = new Events.EventEmitter();

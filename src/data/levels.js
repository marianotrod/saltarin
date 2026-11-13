export const LEVELS = [
    {
        number: 1,
        speed: 300,
        length: 4000,
        obstacles: [
            { type: 'spike', x: 600, count: 1 },
            { type: 'spike', x: 1000, count: 1 },
            { type: 'spike', x: 1400, count: 2 },
            { type: 'spike', x: 1900, count: 1 },
            { type: 'spike', x: 2150, count: 1 },
            { type: 'spike', x: 2700, count: 3 },
            { type: 'spike', x: 3200, count: 2 },
            { type: 'spike', x: 3500, count: 1 }
        ]
    },
    {
        number: 2,
        speed: 350,
        length: 5000,
        obstacles: [
            { type: 'spike', x: 600, count: 1 },
            { type: 'pit', x: 1000, width: 120 },
            { type: 'spike', x: 1500, count: 2 },
            { type: 'pit', x: 1900, width: 160 },
            { type: 'spike', x: 2400, count: 1 },
            { type: 'pit', x: 2850, width: 100 },
            { type: 'spike', x: 3300, count: 3 },
            { type: 'pit', x: 3800, width: 140 },
            { type: 'spike', x: 4150, count: 1 },
            { type: 'pit', x: 4500, width: 160 }
        ]
    },
    {
        number: 3,
        speed: 400,
        length: 6300,
        obstacles: []
    }
];

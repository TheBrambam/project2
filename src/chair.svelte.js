export const chair = $state({
    recline: 18,
    leg: 10,
    pressureReadings: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
    zoneHeights: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
    maxAdjust: 10,
    minAdjust: -10,
    timer: null,
    activePositionTime: 0,
    postureAlert: false,
    presets: [
        {
            name: "Default",
            recline: 18,
            leg: 10,
        },
        {
            name: "Relaxed",
            recline: 25,
            leg: 15,
        },
        {
            name: "Person 1",
            recline: 10,
            leg: 5,
        },
        {
            name: "Person 2",
            recline: 20,
            leg: 0,
        },
    ]
});
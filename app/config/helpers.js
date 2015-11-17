module.exports.shuffle = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i+1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

// For some reason Nick thought it would be a
// good idea to have missions defined for
// player counts that are illegal in the
// Resistance rules. So that's what the first five are.

module.exports.game_reference = [
    {
        role_count: {good: 0, evil: 0},
        missions: [{capacity: 1, fails_needed: 1}]
    },
    {
        role_count: {good: 1, evil: 0},
        missions: [{capacity: 1, fails_needed: 1}]
    },
    {
        role_count: {good: 2, evil: 0},
        missions: [{capacity: 1, fails_needed: 1}]
    },
    {
        role_count: {good: 2, evil: 1},
        missions: [
            {capacity: 1, fails_needed: 1},
            {capacity: 2, fails_needed: 1}
        ]
    },
    {
        role_count: {good: 3, evil: 1},
        missions: [
            {capacity: 2, fails_needed: 1},
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1}
        ]
    },
    {
        role_count: {good: 3, evil: 2},
        missions: [
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 3, fails_needed: 1}
        ]
    },
    {
        role_count: {good: 4, evil: 2},
        missions: [
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1}
        ]
    },
    {
        role_count: {good: 4, evil: 3},
        missions: [
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 2},
            {capacity: 4, fails_needed: 1}
        ]
    },
    {
        role_count: {good: 5, evil: 3},
        missions: [
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 5, fails_needed: 2},
            {capacity: 5, fails_needed: 1}
        ]
    },
    {
        role_count: {good: 6, evil: 3},
        missions: [
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 5, fails_needed: 2},
            {capacity: 5, fails_needed: 1}
        ]
    },
    {
        role_count: {good: 6, evil: 4},
        missions: [
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 5, fails_needed: 2},
            {capacity: 5, fails_needed: 1}
        ]
    }
];

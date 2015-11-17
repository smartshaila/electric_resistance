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
        factions: [
            {faction: 'good', count: 0},
            {faction: 'evil', count: 0}
        ],
        missions: [{capacity: 1, fails_needed: 1}]
    },
    {
        factions: [
            {faction: 'good', count: 1},
            {faction: 'evil', count: 0}
        ],
        missions: [{capacity: 1, fails_needed: 1}]
    },
    {
        factions: [
            {faction: 'good', count: 2},
            {faction: 'evil', count: 0}
        ],
        missions: [{capacity: 1, fails_needed: 1}]
    },
    {
        factions: [
            {faction: 'good', count: 2},
            {faction: 'evil', count: 1}
        ],
        missions: [
            {capacity: 1, fails_needed: 1},
            {capacity: 2, fails_needed: 1}
        ]
    },
    {
        factions: [
            {faction: 'good', count: 3},
            {faction: 'evil', count: 1}
        ],
        missions: [
            {capacity: 2, fails_needed: 1},
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1}
        ]
    },
    {
        factions: [
            {faction: 'good', count: 3},
            {faction: 'evil', count: 2}
        ],
        missions: [
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 3, fails_needed: 1}
        ]
    },
    {
        factions: [
            {faction: 'good', count: 4},
            {faction: 'evil', count: 2}
        ],
        missions: [
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1}
        ]
    },
    {
        factions: [
            {faction: 'good', count: 4},
            {faction: 'evil', count: 3}
        ],
        missions: [
            {capacity: 2, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 2},
            {capacity: 4, fails_needed: 1}
        ]
    },
    {
        factions: [
            {faction: 'good', count: 5},
            {faction: 'evil', count: 3}
        ],
        missions: [
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 5, fails_needed: 2},
            {capacity: 5, fails_needed: 1}
        ]
    },
    {
        factions: [
            {faction: 'good', count: 6},
            {faction: 'evil', count: 3}
        ],
        missions: [
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 5, fails_needed: 2},
            {capacity: 5, fails_needed: 1}
        ]
    },
    {
        factions: [
            {faction: 'good', count: 6},
            {faction: 'evil', count: 4}
        ],
        missions: [
            {capacity: 3, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 4, fails_needed: 1},
            {capacity: 5, fails_needed: 2},
            {capacity: 5, fails_needed: 1}
        ]
    }
];

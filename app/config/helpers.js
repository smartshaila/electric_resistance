var Role = require('../models/role');

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

var game_reference = [
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
            {capacity: 2, fails_needed: 1},
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
module.exports.game_reference = game_reference;

var role_list = [];
var default_roles = {};
Role.find({}, function(err, roles) {
    if (err) throw err;
    role_list = roles;
    module.exports.role_list = role_list;
    populate_default_roles();
});

function populate_default_roles() {
    role_list.forEach(function(r) {
        if (r.default) {
            default_roles[r.faction] = r._id;
        }
    });
    module.exports.default_roles = default_roles;
}

var faction_counts = function(selected_role_ids) {
    return role_list.filter(function(r) {
        return selected_role_ids.indexOf(r._id.toString()) > -1;
    }).reduce(function(res, obj){
        res[obj.faction] = ((res[obj.faction]) ? res[obj.faction] + 1 : 1);
        return res;
    }, {});
};
module.exports.faction_counts = faction_counts;

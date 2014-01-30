// This magic number has been decided by thorough research and ruthless testing
var PRICE_INCREASE_RATE = 1.218;

var SAVE_COOKIE = 'saveGame';

// How often the main game logic function is run, in msec
var INTERVAL = 50;

var mushrooms = 0;

var clickers = new Array();

var mps = 0;

// Initialize to an impossible(?) event id
var clicker_event_id = -1;

$(document).ready(function() {
    initGame();
});

function initGame () {
    $('#picker').click(function() {
        pick(true);
    });

    $('#reset').click(function() {
        reset();
    });

    $('#save').click(function() {
        save();
    });

    $('.box').equalHeights();

    $.cookie.json = true;

    initClickers();

    load();

    for(var id in clickers) {
        var button_id = '#';
        button_id += id;
        
        $(button_id).click(function() {
            addClicker(id);
        });
    }

    updateMushrooms();
    updateClickerPrices();
    updateStatistics();

    startAutoSaver();
    startGameLogic();
}

function initClickers() {
    var phantom_hand = new Clicker();
    phantom_hand.orig_price = 10;
    phantom_hand.cur_price = 10;
    phantom_hand.added_mps = 1;
    phantom_hand.count = 0;

    // We stray a bit from our variable_name_convention here
    // This is so that the keys in this array can be used for DOM ids
    clickers = {
        'phantom-hand': phantom_hand
    };
}

function updateMushrooms() {
    $('#mushrooms').text(Math.floor(mushrooms));
}

function updateClickerPrices() {
    for(var id in clickers) {
        var price_id = '#';
        price_id += id;
        price_id += '-price';
        
        $(price_id).text(Math.round(clickers[id].cur_price));
    }
}

function updateStatistics() {
    calculateMps();
    updateMps();
    updateClickerStatistics();
}

function updateMps() {
    $('#mps').text(mps.toFixed(2));
}

function updateClickerStatistics() {
    for(var id in clickers) {
        var count_id = '#';
        count_id += id;
        count_id += '-count';

        var mps_id = '#';
        mps_id += id;
        mps_id += '-mps';

        $(count_id).text(parseInt(clickers[id].count));
        $(mps_id).text((clickers[id].total_mps()).toFixed(2));
    }
}

function calculateMps() {
    var new_mps = 0;
    for(var id in clickers) {
        new_mps += clickers[id].count * clickers[id].added_mps;
    }
    mps = new_mps;
}

function startAutoSaver() {
    window.setInterval(function() { save(); }, 60000);
}

function pick (isClick) {
    if (!isClick) {
        mushrooms += mps * (INTERVAL / 1000) ;
    }
    else {
        mushrooms++
    }

    updateMushrooms();
}

function addClicker(id) {
    var price = clickers[id].cur_price;

    if ( mushrooms >= price ) {
        clickers[id].count++;
        mushrooms = mushrooms - price;
        clickers[id].cur_price *= PRICE_INCREASE_RATE;
        updateMushrooms();
        updateClickerPrices();
        updateStatistics();
    }
}

function startGameLogic() {
    clicker_event_id = window.setInterval(function() { pick(false); }, INTERVAL);
}

function resetGameLogic() {
    if (clicker_event_id != -1) {
        window.clearInterval(clicker_event_id);
        clicker_event_id = -1;
    }
}

function reset() {
    mushrooms = 0;
    initClickers();
    calculateMps();
    updateMushrooms();
    updateClickerPrices();
}

function save() {
    var jsonState = jsonifyState();
    $.cookie(SAVE_COOKIE, jsonState,{ expires: 3650 });
}

function load() {
    if ($.cookie(SAVE_COOKIE)) {
        var jsonState = $.cookie(SAVE_COOKIE);
        mushrooms = jsonState['mushrooms'];

        if (typeof jsonState['clickers'] != 'undefined') {
            var new_clickers = jsonState['clickers'];

            for (var id in new_clickers) {
                clickers[id].count = new_clickers[id].count;
                clickers[id].cur_price = new_clickers[id].cur_price;
            }
        }
    }
}

function jsonifyState() {
    var result = {
        'mushrooms': mushrooms,
        'clickers': clickers,
       };
    return result;
}

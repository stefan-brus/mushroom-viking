var AUTO_CLICKS_PER_SECOND = 10;

// This magic number has been decided by thorough research and ruthless testing
var PRICE_INCREASE_RATE = 1.218;

var ORIG_CLICKER_PRICE = 10;

var SAVE_COOKIE = 'saveGame';

var mushrooms = 0;

var clicker_price = ORIG_CLICKER_PRICE;

var no_clickers = 0;

var auto_click_factor = 0;

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

    $('li').click(function() {
        addClicker();
    });

    $.cookie.json = true;

    load();

    updateMushrooms();
    updateClickerPrices();
    
    startAutoSaver();
}

function updateMushrooms() {
    $('#mushrooms').text(parseInt(mushrooms));
}

function updateClickerPrices() {
    $('#clickerPrice').text(Math.round(clicker_price));
}

function startAutoSaver() {
    window.setInterval(function() { save(); }, 60000);
}

function pick (isClick) {
    mushrooms++;

    if (!isClick) {
        mushrooms = mushrooms + auto_click_factor;
    }

    updateMushrooms();
}

function addClicker() {
    if ( mushrooms >= clicker_price ) {
        if (no_clickers < AUTO_CLICKS_PER_SECOND) {
            no_clickers++;
            resetClickerEvent();
            startAutoClicker();
        }
        else {
            auto_click_factor = auto_click_factor + (1 / AUTO_CLICKS_PER_SECOND);
        }

        mushrooms = mushrooms - clicker_price;
        increasePrice();
        updateMushrooms();
        updateClickerPrices();
    }
}

function increasePrice() {
    clicker_price = clicker_price * PRICE_INCREASE_RATE;
}

function startAutoClicker() {
    clicker_event_id = window.setInterval(function() { pick(false); }, 1000 / no_clickers);
}

function resetClickerEvent() {
    if (clicker_event_id != -1) {
        window.clearInterval(clicker_event_id);
        clicker_event_id = -1;
    }
}

function reset() {
    mushrooms = 0;
    no_clickers = 0;
    clicker_price = ORIG_CLICKER_PRICE;
    auto_click_factor = 0;
    resetClickerEvent();
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
        no_clickers = jsonState['no_clickers'];
        clicker_price = jsonState['clicker_price'];
        auto_click_factor = jsonState['auto_click_factor'];
        clicker_event_id = jsonState['clicker_event_id'];

        if (no_clickers > 0) {
            resetClickerEvent();
            startAutoClicker();
        }
    }
}

function jsonifyState() {
    var result = {
        'mushrooms': mushrooms,
        'no_clickers': no_clickers,
        'clicker_price': clicker_price,
        'auto_click_factor': auto_click_factor,
        'clicker_event_id': clicker_event_id
       };
    return result;
}

var AUTO_CLICKS_PER_SECOND = 10;

var CLICKER_PRICE = 10;

var SAVE_COOKIE = 'saveGame';

var mushrooms = 0;

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
}

function updateMushrooms() {
    $('#mushrooms').text(parseInt(mushrooms));
}

function updateClickerPrices() {
    $('#clickerPrice').text(CLICKER_PRICE);
}

function pick (isClick) {
    mushrooms++;

    if (!isClick) {
        mushrooms = mushrooms + auto_click_factor;
    }

    updateMushrooms();
}

function addClicker() {
    if ( mushrooms >= CLICKER_PRICE ) {
        if (no_clickers < AUTO_CLICKS_PER_SECOND) {
            no_clickers++;
            resetClickerEvent();
            clicker_event_id = window.setInterval(function() { pick(false); }, 1000 / no_clickers);
        }
        else {
            auto_click_factor = auto_click_factor + (1 / AUTO_CLICKS_PER_SECOND);
        }

        mushrooms = mushrooms - CLICKER_PRICE;
        updateMushrooms();
    }
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
    auto_click_factor = 0;
    resetClickerEvent();
    updateMushrooms();
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
        auto_click_factor = jsonState['auto_click_factor'];
        clicker_event_id = jsonState['clicker_event_id'];

        if (no_clickers > 0) {
            resetClickerEvent();
            clicker_event_id = window.setInterval(function() { pick(false) }, 1000 / no_clickers);
        }
    }
}

function jsonifyState() {
    var result = {
        'mushrooms': mushrooms,
        'no_clickers': no_clickers,
        'auto_click_factor': auto_click_factor,
        'clicker_event_id': clicker_event_id
       };
    return result;
}

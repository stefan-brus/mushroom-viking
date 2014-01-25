var AUTO_CLICKS_PER_SECOND = 10;

var CLICKER_PRICE = 10;

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
    
    $('li').click(function() {
        addClicker();
    });

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

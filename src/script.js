var AUTO_CLICKS_PER_SECOND = 10;

var CLICKER_PRICE = 10;

var mushrooms = 0;

var no_clickers = 0;

var auto_click_factor = 0;

var clicker_event_ids = new Array();

window.onload = initGame;

function initGame () {
    updateMushrooms();
    updateClickerPrices();
}

function updateMushrooms() {
    document.getElementById('mushrooms').innerHTML = parseInt(mushrooms);
}

function updateClickerPrices() {
    document.getElementById('clickerPrice').innerHTML = CLICKER_PRICE;
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
            clicker_event_ids.push(window.setInterval(function() { pick(false); }, 1000 / no_clickers));
        }
        else {
            auto_click_factor = auto_click_factor + (1 / AUTO_CLICKS_PER_SECOND);
        }

        mushrooms = mushrooms - CLICKER_PRICE;
        updateMushrooms();
    }
}

function reset() {
    mushrooms = 0;
    no_clickers = 0;
    auto_click_factor = 0;
	clicker_event_ids.forEach(function(entry) {
		window.clearInterval(entry);
	});
	clicker_event_ids.length = 0;
    updateMushrooms();
}

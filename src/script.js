var CLICKER_PRICE = 10;

var mushrooms = 0;

window.onload = initGame;

function initGame () {
    updateMushrooms();
    updateClickerPrices();
}

function updateMushrooms() {
    document.getElementById('mushrooms').innerHTML = mushrooms;
}

function updateClickerPrices() {
    document.getElementById('clickerPrice').innerHTML = CLICKER_PRICE;
}

function pick () {
    mushrooms++;
    updateMushrooms();
}

function addClicker() {
    if ( mushrooms >= CLICKER_PRICE ) {
        window.setInterval(pick, 1000);
        mushrooms = mushrooms - CLICKER_PRICE;
        updateMushrooms();
    }
}

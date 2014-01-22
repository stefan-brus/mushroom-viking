var mushrooms = 0;

window.onload = initGame;

function initGame () {
    updateMushrooms();
}

function updateMushrooms() {
    document.getElementById('mushrooms').innerHTML = mushrooms;
}

function pick () {
    mushrooms++;
    updateMushrooms();
}

function addClicker() {
    window.setInterval(pick, 1000);
}

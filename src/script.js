var mushrooms = 0;

function pick () {
    mushrooms++;
    document.getElementById('mushrooms').innerHTML = mushrooms;
}

function addClicker() {
    window.setInterval(pick, 1000);
}

var game = new Game();

$(document).ready(function() {
    $('#display-menu').click(function () {
        $('#menu').toggle();
    });

    // Set up game tabs
    $('#tab-pickers').css('display', 'block');
    $('#tab-upgrades').css('display', 'none');
    $('#nav-pickers').click(function() {
        $('#tab-pickers').css('display', 'block');
        $('#tab-upgrades').css('display', 'none');
    });
    $('#nav-upgrades').click(function() {
        $('#tab-pickers').css('display', 'none');
        $('#tab-upgrades').css('display', 'block');
    });

    game.initGame();
});
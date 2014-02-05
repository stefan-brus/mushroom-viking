var game = new Game();

$(document).ready(function() {
    $('#display-menu').click(function () {
        $('#menu').toggle();
    });

    // Set up game tabs
    $('#tab-pickers').css('display', 'block');
    $('#tab-upgrades').css('display', 'none');
    $('#tab-stats-game').css('display', 'block');
    $('#tab-stats-achievements').css('display', 'none');
    $('#nav-pickers').click(function() {
        $('#tab-pickers').css('display', 'block');
        $('#tab-upgrades').css('display', 'none');
    });
    $('#nav-upgrades').click(function() {
        $('#tab-pickers').css('display', 'none');
        $('#tab-upgrades').css('display', 'block');
    });
    $('#nav-stats-game').click(function() {
        $('#tab-stats-game').css('display', 'block');
        $('#tab-stats-achievements').css('display', 'none');
    });
    $('#nav-stats-achievements').click(function() {
        $('#tab-stats-game').css('display', 'none');
        $('#tab-stats-achievements').css('display', 'block');
    });

    game.initGame();
});
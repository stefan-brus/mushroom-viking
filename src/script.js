var game = new Game();

$(document).ready(function() {
    $('#display-menu').click(function () {
        $('#menu').toggle();
    });

    game.initGame();
});
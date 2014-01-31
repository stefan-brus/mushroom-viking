var Game = function() {
    ///////////////
    // CONSTANTS //
    ///////////////

    // This magic number has been decided by thorough research and ruthless testing
    var PRICE_INCREASE_RATE = 1.218;

    var SAVE_COOKIE = 'saveGame';

    // How often the main game logic function is run, in msec
    var INTERVAL = 50;
    
    /////////////////////
    // GAME PROPERTIES //
    /////////////////////

    this.mushrooms = 0;

    this.clickers = new Array();

    this.mps = 0;

    // Initialize to an impossible(?) event id
    this.clicker_event_id = -1;
    
    /////////////
    // METHODS //
    /////////////

    this.initGame = function() {
        var game = this;
        $('#picker').click(function() {
            game.pick(true, game);
        });

        $('#reset').click(function() {
            game.reset();
        });

        $('#save').click(function() {
            game.save();
        });

        $('#delete-save').click(function() {
            game.deleteSave();
        });

        $('.box').equalHeights();

        $.cookie.json = true;

        this.initClickers();

        this.load();

        for(var id in this.clickers) {
            var button_id = '#';
            button_id += id;
            
            $(button_id).click(function() {
                game.addClicker(id);
            });
        }

        this.updateMushrooms();
        this.updateClickerPrices();
        this.updateStatistics();

        this.startAutoSaver();
        this.startGameLogic();
    }

    this.initClickers = function() {
        var phantom_hand = new Clicker();
        phantom_hand.orig_price = 10;
        phantom_hand.cur_price = 10;
        phantom_hand.added_mps = 1;
        phantom_hand.count = 0;

        // We stray a bit from our variable_name_convention here
        // This is so that the keys in this array can be used for DOM ids
        this.clickers = {
            'phantom-hand': phantom_hand
        };
    }

    this.updateMushrooms = function() {
        $('#mushrooms').text($.number(this.mushrooms));
    }

    this.updateClickerPrices = function() {
        for(var id in this.clickers) {
            var price_id = '#';
            price_id += id;
            price_id += '-price';
            
            $(price_id).text($.number(this.clickers[id].cur_price));
        }
    }

    this.updateStatistics = function() {
        this.calculateMps();
        this.updateMps();
        this.updateClickerStatistics();
    }

    this.updateMps = function() {
        $('#mps').text($.number(this.mps, 2));
    }

    this.updateClickerStatistics = function() {
        for(var id in this.clickers) {
            var count_id = '#';
            count_id += id;
            count_id += '-count';

            var mps_id = '#';
            mps_id += id;
            mps_id += '-mps';

            $(count_id).text($.number(this.clickers[id].count));
            $(mps_id).text($.number(this.clickers[id].total_mps(), 2));
        }
    }

    this.calculateMps = function() {
        var new_mps = 0;
        for(var id in this.clickers) {
            new_mps += this.clickers[id].count * this.clickers[id].added_mps;
        }
        this.mps = new_mps;
    }

    this.startAutoSaver = function() {
        var game = this;
        window.setInterval(function() { game.save(); }, 60000);
    }

    // This instance needs to be passed to this method, because it is passed to a setInterval call
    this.pick = function(isClick, game) {
        if (!isClick) {
            game.mushrooms += game.mps * (INTERVAL / 1000) ;
        }
        else {
            game.mushrooms++
        }

        game.updateMushrooms();
    }

    this.addClicker = function(id) {
        var price = this.clickers[id].cur_price;

        if ( this.mushrooms >= price ) {
            this.clickers[id].count++;
            this.mushrooms = this.mushrooms - price;
            this.clickers[id].cur_price *= PRICE_INCREASE_RATE;
            this.updateMushrooms();
            this.updateClickerPrices();
            this.updateStatistics();
        }
    }

    this.startGameLogic = function() {
        var fn = this.pick;
        var game = this;
        this.clicker_event_id = window.setInterval(function() { fn(false, game); }, INTERVAL);
    }

    this.resetGameLogic = function() {
        if (this.clicker_event_id != -1) {
            window.clearInterval(this.clicker_event_id);
            this.clicker_event_id = -1;
        }
    }

    this.reset = function() {
        this.mushrooms = 0;
        this.initClickers();
        this.calculateMps();
        this.updateMushrooms();
        this.updateClickerPrices();
        this.updateStatistics();
    }

    this.save = function() {
        var jsonState = this.jsonifyState();
        $.cookie(SAVE_COOKIE, jsonState,{ expires: 3650 });
    }

    this.deleteSave = function() {
        $.removeCookie(SAVE_COOKIE);
    }

    this.load = function() {
        if ($.cookie(SAVE_COOKIE)) {
            var jsonState = $.cookie(SAVE_COOKIE);
            this.mushrooms = jsonState['mushrooms'];

            if (typeof jsonState['clickers'] != 'undefined') {
                var new_clickers = jsonState['clickers'];

                for (var id in new_clickers) {
                    this.clickers[id].count = new_clickers[id].count;
                    this.clickers[id].cur_price = new_clickers[id].cur_price;
                }
            }
        }
    }

    this.jsonifyState = function() {
        var result = {
            'mushrooms': this.mushrooms,
            'clickers': this.clickers,
           };
        return result;
    }
}

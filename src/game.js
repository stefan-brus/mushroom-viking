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

    // This is an associative array used to enable gradual display of game features
    // The key is the DOM-query for the object that should initially be hidden
    // The value is a function that returns true if the feature should be displayed, false otherwise
    this.display_features = {};

    this.mps = 0;

    // Initialize to an impossible(?) event id
    this.game_event_id = -1;
    
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

        this.initDisplayFeatures(this);

        this.load();

        var clicker_ids = new Array();

        for(var id in this.clickers) {
            clicker_ids.push(id);
        }

        $('.button').each(function(index) {
            $(this).click(function() {
                game.addClicker(clicker_ids[index]);
            });
        });

        this.updateMushrooms();
        this.updateClickerPrices();
        this.updateStatistics();

        this.startAutoSaver();
        this.startGameLogic();
        this.hideFeatures();
    }

    this.initClickers = function() {
        var phantom_hand = new Clicker();
        phantom_hand.orig_price = 10;
        phantom_hand.cur_price = 10;
        phantom_hand.added_mps = 1;
        phantom_hand.count = 0;

        var living_basket = new Clicker();
        living_basket.orig_price = 50;
        living_basket.cur_price = 50;
        living_basket.added_mps = 3;
        living_basket.count = 0;

        var truffle_boar = new Clicker();
        truffle_boar.orig_price = 200;
        truffle_boar.cur_price = 200;
        truffle_boar.added_mps = 8;
        truffle_boar.count = 0;

        var hirdman = new Clicker();
        hirdman.orig_price = 793;
        hirdman.cur_price = 793;
        hirdman.added_mps = 15;
        hirdman.count = 0;

        var berserker = new Clicker();
        berserker.orig_price = 2666;
        berserker.cur_price = 2666;
        berserker.added_mps = 66;
        berserker.count = 0;

        // We stray a bit from our variable_name_convention here
        // This is so that the keys in this array can be used for DOM ids
        this.clickers = {
            'phantom-hand': phantom_hand,
            'living-basket': living_basket,
            'truffle-boar': truffle_boar,
            'hirdman': hirdman,
            'berserker': berserker
        };
    }

    // This instance needs to be passed to this method, because it is passed to a function object
    this.initDisplayFeatures = function(game) {
        game.display_features['.hide-auto-pickers'] = function() {
            return game.mushrooms >= game.clickers['phantom-hand'].orig_price;
        }

        game.display_features['.phantom-hand'] = function() {
            return game.clickers['phantom-hand'].count > 0 || game.mushrooms >= game.clickers['phantom-hand'].orig_price;
        }

        game.display_features['.living-basket'] = function() {
            return game.clickers['living-basket'].count > 0 || game.mushrooms >= game.clickers['living-basket'].orig_price;
        }

        game.display_features['.truffle-boar'] = function() {
            return game.clickers['truffle-boar'].count > 0 || game.mushrooms >= game.clickers['truffle-boar'].orig_price;
        }

        game.display_features['.hirdman'] = function() {
            return game.clickers['hirdman'].count > 0 || game.mushrooms >= game.clickers['hirdman'].orig_price;
        }

        game.display_features['.berserker'] = function() {
            return game.clickers['berserker'].count > 0 || game.mushrooms >= game.clickers['berserker'].orig_price;
        }

        game.display_features['#delete-save'] = function() {
            return $.cookie(SAVE_COOKIE) != null;
        }
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

    this.hideFeatures = function() {
        for(var dom_id in this.display_features) {
            if(this.display_features[dom_id]()) {
                $(dom_id).show();
                delete this.display_features[dom_id];
            }
            else {
                $(dom_id).hide();
            }
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
        game.hideFeatures();
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
        this.game_event_id = window.setInterval(function() { fn(false, game); }, INTERVAL);
    }

    this.resetGameLogic = function() {
        if (this.game_event_id != -1) {
            window.clearInterval(this.game_event_id);
            this.game_event_id = -1;
        }
    }

    // if force is true, no confirmation will be displayed
    this.reset = function(force) {
        var proceed = force || window.confirm('Are you sure you want to reset the game?');
        if(proceed) {
            this.mushrooms = 0;
            this.initClickers();
            this.calculateMps();
            this.updateMushrooms();
            this.updateClickerPrices();
            this.updateStatistics();
        }
    }

    this.save = function() {
        var jsonState = this.jsonifyState();
        $.cookie(SAVE_COOKIE, jsonState,{ expires: 3650 });
    }

    this.deleteSave = function() {
        var proceed = window.confirm('Are you sure you want to delete your save and restart?');
        if(proceed) {
            $.removeCookie(SAVE_COOKIE);
            this.reset(true);
        }
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

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

    this.mushrooms_picked = 0;

    this.mushrooms_per_pick = 1;

    this.clickers = new Array();

    this.upgrades = new Array();

    this.achievements = new Array();

    // This is an associative array used to enable gradual display of game features
    // The key is the DOM-query for the object that should initially be hidden
    // The value is a function that returns true if the feature should be displayed, false otherwise
    this.display_features = new Array();

    this.mps = 0.00;

    this.mps_factor = 0.00;

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

        this.initUpgrades();

        this.initAchievements(this);

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

        var upgrade_ids = new Array();

        for(var id in this.upgrades) {
            upgrade_ids.push(id);
        }

        $('.upgrade').each(function(index) {
            $(this).click(function() {
                game.upgrade(upgrade_ids[index]);
            });
        });

        this.updateMushrooms();
        this.updateClickerPrices();
        this.updateUpgradePrices();
        this.updateStatistics();
        this.updateAchievements();

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
    this.initUpgrades = function(game) {
        var dexterity = new Upgrade();
        dexterity.orig_price = 60;
        dexterity.cur_price = 60;
        dexterity.level = 0;
        dexterity.available = function() {
            return true;
        }
        dexterity.apply = function(game) {
            game.mushrooms_per_pick *= 2;
        }
        dexterity.increasePrice = function() {
            this.cur_price *= 2;
        }

        var strength = new Upgrade();
        strength.orig_price = 84;
        strength.cur_price = 84;
        strength.level = 0;
        strength.available = function() {
            return true;
        }
        strength.apply = function(game) {
            game.mps_factor += 0.01;
            game.mushrooms_per_pick *= 1 + 0.01;
        }
        strength.increasePrice = function() {
            this.cur_price *= 2;
        }

        var phantom_hand = new Upgrade();
        phantom_hand.orig_price = 100;
        phantom_hand.cur_price = 100;
        phantom_hand.level = 0;
        phantom_hand.available = function() {
            return game.clickers['phantom-hand'].count > 0;
        }
        phantom_hand.apply = function(game) {
            game.clickers['phantom-hand'].added_mps++;
        }
        phantom_hand.increasePrice = function() {
            this.cur_price *= 2;
        }

        var living_basket = new Upgrade();
        living_basket.orig_price = 2000;
        living_basket.cur_price = 2000;
        living_basket.level = 0;
        living_basket.available = function() {
            return game.clickers['living-basket'].count > 0;
        }
        living_basket.apply = function(game) {
            game.clickers['living-basket'].added_mps += 2;
        }
        living_basket.increasePrice = function() {
            this.cur_price *= 2;
        }

        var truffle_boar = new Upgrade();
        truffle_boar.orig_price = 7500;
        truffle_boar.cur_price = 7500;
        truffle_boar.level = 0;
        truffle_boar.available = function() {
            return game.clickers['truffle-boar'].count > 0;
        }
        truffle_boar.apply = function(game) {
            game.clickers['truffle-boar'].added_mps += 5;
        }
        truffle_boar.increasePrice = function() {
            this.cur_price *= 2;
        }

        var hirdman = new Upgrade();
        hirdman.orig_price = 16000;
        hirdman.cur_price = 16000;
        hirdman.level = 0;
        hirdman.available = function() {
            return game.clickers['hirdman'].count > 0;
        }
        hirdman.apply = function(game) {
            game.clickers['hirdman'].added_mps += 12;
        }
        hirdman.increasePrice = function() {
            this.cur_price *= 2;
        }

        var berserker = new Upgrade;
        berserker.orig_price = 36666;
        berserker.cur_price = 36666;
        berserker.level = 0;
        berserker.available = function() {
            return game.clickers['berserker'].count > 0;
        }
        berserker.apply = function(game) {
            game.clickers['berserker'].added_mps += 40;
        }
        berserker.increasePrice = function() {
            this.cur_price *= 2;
        }

        this.upgrades = {
            'dexterity': dexterity,
            'strength': strength,

            'phantom-hand': phantom_hand,
            'living-basket': living_basket,
            'truffle-boar': truffle_boar,
            'hirdman': hirdman,
            'berserker': berserker
        };
    }

    // This instance needs to be passed to this method, because it is passed to a function object
    this.initAchievements = function(game) {
        game.achievements['#ach-mushroom-picker'] = function() {
            return game.mushrooms >= 1;
        }
    }

    // This instance needs to be passed to this method, because it is passed to a function object
    this.initDisplayFeatures = function(game) {
        game.display_features['.hide-auto-pickers'] = function() {
            return game.mushrooms >= game.clickers['phantom-hand'].orig_price;
        }

        game.display_features['.hide-upgrades'] = function() {
            return game.mushrooms >= game.upgrades['dexterity'].orig_price;
        }

        game.display_features['#mps-stats'] = function() {
            for(var id in game.clickers) {
                if(game.clickers[id].count > 0) {
                    return true;
                }
            }
            return false;
        }

        game.display_features['.phantom-hand'] = function() {
            return game.clickers['phantom-hand'].count > 0 || game.mushrooms >= game.clickers['phantom-hand'].orig_price;
        }

        game.display_features['.phantom-hand-upgrade'] = function() {
            return game.upgrades['phantom-hand'].level > 0 || game.mushrooms >= game.upgrades['phantom-hand'].orig_price;
        }

        game.display_features['.living-basket'] = function() {
            return game.clickers['living-basket'].count > 0 || game.mushrooms >= game.clickers['living-basket'].orig_price;
        }

        game.display_features['.living-basket-upgrade'] = function() {
            return game.upgrades['living-basket'].level > 0 || game.mushrooms >= game.upgrades['living-basket'].orig_price;
        }

        game.display_features['.truffle-boar'] = function() {
            return game.clickers['truffle-boar'].count > 0 || game.mushrooms >= game.clickers['truffle-boar'].orig_price;
        }

        game.display_features['.truffle-boar-upgrade'] = function() {
            return game.upgrades['truffle-boar'].level > 0 || game.mushrooms >= game.upgrades['truffle-boar'].orig_price;
        }

        game.display_features['.hirdman'] = function() {
            return game.clickers['hirdman'].count > 0 || game.mushrooms >= game.clickers['hirdman'].orig_price;
        }

        game.display_features['.hirdman-upgrade'] = function() {
            return game.upgrades['hirdman'].level > 0 || game.mushrooms >= game.upgrades['hirdman'].orig_price;
        }

        game.display_features['.berserker'] = function() {
            return game.clickers['berserker'].count > 0 || game.mushrooms >= game.clickers['berserker'].orig_price;
        }

        game.display_features['.berserker-upgrade'] = function() {
            return game.upgrades['berserker'].level > 0 || game.mushrooms >= game.upgrades['berserker'].orig_price;
        }

        game.display_features['#delete-save'] = function() {
            return $.cookie(SAVE_COOKIE) != null;
        }
    }

    this.updateMushrooms = function() {
        $('#mushrooms').text($.number(this.mushrooms));
        $('#mushrooms-picked').text($.number(this.mushrooms_picked));
    }

    this.updateClickerPrices = function() {
        for(var id in this.clickers) {
            var price_id = '#';
            price_id += id;
            price_id += '-price';

            $(price_id).text($.number(this.clickers[id].cur_price));
        }
    }

    this.updateUpgradePrices = function(){
        for(var id in this.upgrades) {
            var price_id = '#';
            price_id += id;
            price_id += '-upgrade-price';

            $(price_id).text($.number(this.upgrades[id].cur_price));
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

    this.updateAchievements = function() {
        for(var id in this.achievements) {
            if (this.achievements[id]()) {
                $(id).css('display', 'block');
                delete this.achievements[id];
                this.save();
            }
            else {
                $(id).css('display', 'none');
            }
        }
    };

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
        this.mps = new_mps * (1 + this.mps_factor);
    }

    this.startAutoSaver = function() {
        var game = this;
        window.setInterval(function() { game.save(); }, 60000);
    }

    // This instance needs to be passed to this method, because it is passed to a setInterval call
    this.pick = function(isClick, game) {
        if (!isClick) {
            var incr = game.mps * (INTERVAL / 1000);
            game.mushrooms += incr;
            game.mushrooms_picked += incr;
        }
        else {
            game.mushrooms += game.mushrooms_per_pick;
            game.mushrooms_picked += game.mushrooms_per_pick;
        }

        game.updateMushrooms();
        game.updateAchievements();
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

    this.upgrade = function(id) {
        var price = this.upgrades[id].cur_price;

        if(this.mushrooms >= price) {
            var up = this.upgrades[id];
            up.apply(this);
            up.level++;
            up.increasePrice();
            this.mushrooms = this.mushrooms - price;
            this.updateMushrooms();
            this.updateUpgradePrices();
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
            this.mushrooms_picked = 0;
            this.initClickers();
            this.calculateMps();
            this.updateMushrooms();
            this.updateClickerPrices();
            this.updateUpgradePrices();
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
            this.mushrooms_picked = jsonState['mushrooms_picked'];
            this.mps_factor = jsonState['mps_factor'];

            if (typeof jsonState['clickers'] != 'undefined') {
                var new_clickers = jsonState['clickers'];

                for (var id in new_clickers) {
                    this.clickers[id].count = new_clickers[id].count;
                    this.clickers[id].cur_price = new_clickers[id].cur_price;
                }
            }

            if (typeof jsonState['upgrades'] != 'undefined') {
                var new_upgrades = jsonState['upgrades'];

                for (var id in new_upgrades) {
                    if(this.upgrades[id].level != new_upgrades[id].level) {
                        this.upgrades[id].level = new_upgrades[id].level;
                        this.upgrades[id].cur_price = new_upgrades[id].cur_price;
                        for(var i = 0; i < this.upgrades[id].level; i++)
                        {
                            this.upgrades[id].apply(this);
                        }
                    }
                }
            }

            if(typeof jsonState['achievements'] != 'undefined') {
                var new_achievements = jsonState['achievements'];

                for(var id in this.achievements) {
                    if(typeof new_achievements[id] == 'undefined') {
                        $(id).css('display', 'block');
                        delete this.achievements[id];
                    }
                }
            }
        }
    }

    this.jsonifyState = function() {
        var result = {
            'mushrooms': this.mushrooms,
            'mushrooms_picked': this.mushrooms_picked,
            'mps_factor': this.mps_factor,
            'clickers': this.clickers,
            'upgrades': this.upgrades,
            'achievements': this.achievements
           };
        return result;
    }
}

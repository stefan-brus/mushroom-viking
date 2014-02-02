var Upgrade = function() {
    // The original price of this upgrade
    this.orig_price = 0;

    // The current price of this upgrade
    this.cur_price = 0;

    // The level of this upgrade
    this.level = 0;

    // Returns true if this upgrade is available, false otherwise
    this.available = function() {
        return true;
    }

    // Applies this upgrade's function
    this.apply = function(game) {
    
    }

    // Each upgrade should decide its own price increase rate
    this.increasePrice = function() {
        this.cur_price = 0;
    }
}
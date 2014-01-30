var Clicker = function() {
    // The original price of this clicker
    this.orig_price = 0;
    
    // The current price of this clicker
    this.cur_price = 0;

    // The amount of this clicker the player has
    this.count = 0;

    // The mps this clicker adds
    this.added_mps = 0;

    // The current total mps of all clickers of this type
    this.total_mps = function() {
        return this.count * this.added_mps;
    }
}
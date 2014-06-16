macro history {
    rule {
        (((typeof $quantity:ident !== 'undefined') ? $quantity:ident : this.$quantity:ident()), $time:expr)
    } => {
        (function() {
            var time = $time;
            if (time < 1) {
                throw new Error('For delayed quantities, the value must be at least 1');
            }
            var historyValue = this.$quantity.hist[this.time - time];
            if (historyValue === undefined) {
                return 0;
            } else {
                return historyValue;
            }
        }).call(this)
    }
}

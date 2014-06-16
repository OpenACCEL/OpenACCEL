macro func {
    // Normal variable definitions.
    rule {
        ($x = $expr:expr)
    } => {
        this.$x = function() {
            // If a quantity is time dependant, look up if there exists a previous version.
            if (this.report && this.report.$x.isTimeDependent) {
                if (this.$x.hist[this.time] === undefined) {
                    this.$x.hist[this.time] = this.$x.expr();
                }
                return this.$x.hist[this.time];
            } else {
                if (this.$x.hist[0] === undefined || this.$x.hasChanged) {
                    // initialize the values for user input
                    if (this.report && this.report.$x.category === 1) {
                        this.$x.hist[0] = parseFloat(this.report.$x.input.parameters[0]);
                    } else {
                         this.$x.hist[0] = this.$x.expr();
                    }            
                    this.$x.hasChanged = false;
                }
                return this.$x.hist[0];
            }
        };
        this.$x.expr = (function() { return $expr; }).bind(this);
        this.$x.hist = [];
    }
    rule {
        ($x = $expr:expr ; $dim)
    } => {
        func($x = $expr)
        this.$x.dim = $dim;
    }

    // Function declarations.
    rule {
        ($x($xs (,) ...) = $expr:expr)
    } => {
        this.$x = function($xs (,) ...) {
            return this.$x.expr($xs (,) ...);
        };
        this.$x.expr = (function($xs (,) ...) { return $expr; }).bind(this);
    }
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        func($x($xs (,) ...) = $expr)
        this.$x.dim = $dim;
    }
}

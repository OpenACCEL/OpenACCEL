/**
 * Macro for quantity definitons.
 *
 * Adds a method to the Executable object that evaluates the expression
 * given in the definition of this quantity and stores it in history if nessecary.
 * Also initializes history datastructures and sets initial values of quantities.
 */

macro func {
    // Normal variable definitions.
    rule {
        ($x = $expr:expr)
    } => {
        // Add method to Executable (this) object that returns the value for this quantity
        this.$x = function() {
            // If a quantity is time dependant, look up if there exists a previous version.
            if (this.report && this.report.$x.isTimeDependent) {
                if (this.$x.hist[this.time] === undefined) {
                    // Store current value of evaluated expression in history and return this value
                    this.$x.hist[this.time] = this.$x.expr();
                }

                return this.$x.hist[this.time];
            } else {
                // Quantity value does not change with time: check if it has been evaluated already
                // and hasn't changed (applicable to user input). Else evaluate it now and store result
                if (this.$x.hist[0] === undefined || this.$x.hasChanged) {
                    // Initialize the values for user input
                    if (this.report && this.report.$x.category === 1) {
                        // Initialise button values to false (Boolean) and other inputs to their given
                        // default value as floats
                        if (this.report.$x.input.type == 'button') {
                            this.$x.hist[0] = false;
                        } else {
                            this.$x.hist[0] = parseFloat(this.report.$x.input.parameters[0]);
                        }
                    } else {
                         this.$x.hist[0] = this.$x.expr();
                    }
                    this.$x.hasChanged = false;
                }

                return this.$x.hist[0];
            }
        };

        // Function that evaluates the given expression in the context of 'this'
        this.$x.expr = (function() { return $expr; }).bind(this);
        this.$x.hist = [];
    }

    // Quantity definitions including units
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

    // Function declarations including units
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        func($x($xs (,) ...) = $expr)
        this.$x.dim = $dim;
    }
}

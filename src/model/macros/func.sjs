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
            // If a quantity is time dependant and is not an input quantity, check if it already has been evaluated and if yes
            // return the evaluated value. Else evaluate it now. This is a form of memoization/caching.
            // Input quantities are time dependent but do not have an executable library function: their
            // value is set by the controller when the corresponding input element is changed by the user in the UI.
            var quantity = this.$x;
            var history = quantity.hist;

            if (this.report && this.report.$x.isTimeDependent) {
                var report = this.report.$x;
                
                // If the current time-step value has not been evaluated yet, do it now
                if (history[0] === undefined) {
                    // For non-input quantities, evaluate the expression of this quantity and store it
                    // in the history datastructure
                    if (report.category !== 1) {
                        history[0] = quantity.expr();
                    } else {
                        // For input quantities, which do not have executable library functions,
                        // retrieve the current value from the report and store it in the history
                        history[0] = report.value;
                    }
                }
            } else {
                // Quantity value does not change with time: check if it has been evaluated already
                // and hasn't changed (applicable to user input). Else evaluate it now and store result
                if (history[0] === undefined || quantity.hasChanged) {
                    history[0] = quantity.expr();
                    quantity.hasChanged = false;
                }
            }

            return history[0];
        };

        // Function that evaluates the given expression in the context of 'this'
        this.$x.expr = (function() { return $expr; }).bind(this);

        // Initialise history array
        this.$x.hist = [];

        /**
         * The maximum size of the history array for this quantity.
         * @type {Number}
         */
        this.$x.timespan = 1;

        // Initialize the values for user input
        if (this.report && this.report.$x.category === 1) {
            // Initialise initial values of user input quantities
            if (this.report.$x.input.type == 'button') {
                this.$x.hist[0] = false;
            } else {
                this.$x.hist[0] = this.report.$x.input.parameters[0];
            }
        }
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
            var quantity = this.$x;

            // Support memoization only for 'primitive types', not objects
            var args = Array.prototype.slice.call(arguments);
            var obj = false;
            for (var i=args.length; i>=0; i--) {
                if (args[i] instanceof Object) {
                    obj = true;
                    break;
                }
            }

            if (!obj) {
                hash = JSON.stringify(args);
                return (hash in quantity.cache) ? quantity.cache[hash] : quantity.cache[hash] = quantity.expr($xs (,) ...);
            } else {
                return quantity.expr($xs (,) ...);
            }
        };

        this.$x.expr = (function($xs (,) ...) { return $expr; }).bind(this);

        // Memoization datastructure
        this.$x.cache = {};
    }

    // Function declarations including units
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        func($x($xs (,) ...) = $expr)
        this.$x.dim = $dim;
    }
}

/**
 * Macro for quantity definitons.
 *
 * Adds a method to the Executable object that evaluates the expression
 * given in the definition of this quantity and stores it in history if nessecary.
 * Also initializes history datastructures and sets initial values of quantities.
 */

macro func {
    /**
     * Normal quantity definitions.
     */
    rule {
        ($x = $expr:expr)
    } => {
        /**
         * Code to expand the matched expression into. This code adds a method to the Executable (=this) object that returns
         * the current value for the quantity being defined in the matched expression.
         */
        this.$x = function() {
            // If a quantity is time dependant and is not an input quantity, check if it already has been evaluated and if yes
            // return the evaluated value. Else evaluate it now. This is a form of memoization/caching.
            // Input quantities are time dependent but do not have an executable library function: their
            // value is set by the controller when the corresponding input element is changed by the user in the UI.
            var quantity = this.$x;
            var history = quantity.hist;

            if (this.report && this.report.$x.isTimeDependent) {
                var report = this.report.$x;

                // If the current time-step value has not been evaluated yet, do it now.
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

        /**
         * Function that evaluates the matched expression in the context of 'this'.
         * This is without unit checking or other extensions. This is pure code.
         */
        this.$x.stdexpr = (function() { return $expr; }).bind(this);

        /**
         * Function that evaluates the matched expression in the context of 'this',
         * and returns both the resulting value and corresponding unit.
         * This takes into account that all quantities should return objects, and all
         * library functions also return objects.
         */
        this.$x.unitexpr = (function() {
            /**
             * If the quantity has category 1 or 3, and a unit, this unit should be the unit
             * of the final expression answer. Otherwise, the unit of the final expressions should
             * 'overwrite' the unit of the quantity.
             */
            var ans = $expr;

            if (this.report) {
                var category = this.report.$x.category;
                var quantity = this.$x;

                if (quantity.unit && (category === 1 || category === 3 ||
                    (this.report.$x.dependencies.length == 0 && this.report.$x.reverseDeps.length == 0))) {
                    /**
                     * Perform an automapping over the answer.
                     * This will turn each scalar element into a UnitObject with the unit
                     * as determined by the user.
                     */
                    ans = UnitObject.prototype.create(ans, quantity.unit);

                    // Check whether the signature of the unit matches that of it's value.
                    UnitObject.prototype.verifySignature(ans);
                } else {
                    // This value is guaranteed to have some unit. The quantity will take this unit.
                    // (It is an intermediate or output quantity, category 2 or 4).
                    quantity.unit = zip([ans], function(x) {
                        return x.unit;
                    });
                }
            }

            // Store any textual description of errors that might have occured during the checking of
            // this unit in the Executable so they can be retrieved later (after all units have been checked).
            if (ans.error != null && ans.errorString != '') {
                this.unitErrors.push(ans.errorString);
            }

            return ans;
        }).bind(this);

        /**
         * Function that evaluates the matched expression in the context of 'this'.
         * This expression should be a reference to the expressions that you want to use for the run-time.
         *
         * For example, if you want units, you should refer this to the 'unitexpr', and if you just want
         * to calculate normal expressions without extension, you'd let it refer to 'stdexpr'.
         */
        this.$x.expr = this.$x.stdexpr;

        /**
         * The array of historic values of this quantity. The first element always
         * contains the current (most recent) value of this quantity.
         *
         * Other indices will exist only when historic values of the quantity are used within the script.
         * The array will be just long enough to store the earliest value used in the script.
         *
         * @type {Array}
         */
        this.$x.hist = [];

        /**
         * The unit of this quantity. No unit is given, so assign
         * unit identity to this quantity.
         *
         * @type {Object}
         */
        this.$x.unit = {};

        /**
         * The maximum size of the history array for this quantity.
         *
         * @type {Number}
         */
        this.$x.timespan = 0;

        /**
         * Initialize the value in case it's a user input quantity
         */
        if (this.report && this.report.$x.category === 1) {
            // Initialise initial values of user input quantities
            if (this.report.$x.input.type == 'button') {
                this.$x.hist[0] = false;
            } else {
                this.$x.hist[0] = this.report.$x.input.parameters[0];
            }
        }
    }

    /**
     * Function declarations
     */
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

    /**
     * Function declarations including units
     */
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        func($x($xs (,) ...) = $expr)
    }
}

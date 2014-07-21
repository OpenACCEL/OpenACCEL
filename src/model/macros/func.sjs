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
        this.$x = function() { return this.expr(this.$x, this.report.$x); }

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
        this.$x.unitexpr = (function() { return this.unitexpr(this.$x, this.report.$x, $expr); }).bind(this);

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
}

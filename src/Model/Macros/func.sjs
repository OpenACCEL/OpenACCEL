/**
 * Macro for quantity definitons.
 *
 * Adds a method to the Executable object that evaluates the expression
 * given in the definition of this quantity and stores it in history if nessecary.
 * Also initializes history datastructures and sets initial values of quantities.
 */

macro func {
    /**
     * Function declarations
     */
    rule {
        ($x($xs (,) ...) = $expr:expr)
    } => {
        this.$x = function($xs (,) ...) { return this.memoization(this.$x, [$xs (,) ...]); };

        this.$x.stdexpr = (function($xs (,) ...) { return $expr; }).bind(this);
        this.$x.unitexpr = (function($xs (,) ...) { return this.unitexpr(this.$x, this.report.$x, this.$x.stdexpr($xs (,) ...)); } ).bind(this);
        this.$x.expr = this.$x.stdexpr;

        // Memoization datastructure
        this.$x.cache = {};
    }
}

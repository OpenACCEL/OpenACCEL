/**
 * A quantity (or symbol, or variable) is represented by one or more letters on the left
 * hand side of a line in an ACCEL script. The right hand side of that line contains the
 * definition of the quantity and optionally the units. We treat a quantity as a function
 * with no parameters, so this class is also used for functions.
 *
 * @author Jacco Snoeren
 */
/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define([], /**@lends Quantity*/ function() {
    /**
     * @class
     * @classdesc Abstract Pass that is part of compiling the script.
     */

    function Quantity() {

        /**
         * The name of the quantity as defined in the left hand side of a line.
         * In case of a function f(x), the name will be f.
         * @type {String}
         */
        this.name = '';

        /**
         * The definition of this quantity in a String format. This is simply the right
         * hand side of the equation.
         * @type {String}
         */
        this.definition = '';

        /**
         * An array containing all quantities on which this quantity is dependent.
         * Example: If the script contains a line 'a = b + c,'
         * then a, b, and c are quantities and quantity a is dependent on b and c.
         * @type {String[]}
         */
        this.dependencies = [];

        /**
         * The category of this quantity. The category is I if the quantity is variable(input
         * is given by the user), II if the quantity is an output variable, III if the
         * quantity is a constant and the category is IV if it is neither of the preceding.
         * @type {Category}
         */
        this.category = null;

        /**
         * The unit of this quantity in a String format. If no unit is defined, the unit is
         * the empty string ''. Example: If the script contains a line 'a = 4 ; kg.m/s2'
         * then the unit of quantity a is 'kg.m/s2'.
         * @type {String}
         */
        this.unit = '';

        /**
         * The parameters of this quantity. If the quantity is not a function, this will be
         * the empty array []. Example: If the script contains a line 'f(x,y) = x + y'
         * then the parameters of quantity f are [x,y].
         * @type {String[]}
         */
        this.parameters = [];

        /**
         * An optional comment explaining the quantity.
         * @type {String}
         */
        this.comment = '';
        
        /**
         * Whether this quantity has an empty definition. If true, it should be displayed
         * in the todo list.
         *
         * @type {Boolean}
         */
        this.todo = true;

		/**
         * The current value of the quantity, as evaluated in the executable.
         * Default value is zero.
         *
         * @type {Number}
         */
		this.currentValue = 0;
    }


    /**
     * Returns a String representation of the line corresponding to this quantity
     * as provided by the user in the ACCEL script.
     * @return {String} the line corresponding to this quantity
     */
    Quantity.prototype.toString = function() {

    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Quantity;
});
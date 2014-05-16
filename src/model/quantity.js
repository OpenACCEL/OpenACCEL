/**
 * A quantity (or symbol, or variable) is represented by one or more letters on the left
 * hand side of a line in an ACCEL script. The right hand side of that line contains the
 * definition of the quantity and optionally the units. We treat a quantity as a function
 * with no parameters, so this class is also used for functions.
 *
 * @author Jacco Snoeren
 */
var Quantity = {

    /**
     * The name of the quantity as defined in the left hand side of a line.
     * In case of a function f(x), the name will be f.
     * @type {String}
     */
    name: '',

    /**
     * The definition of this quantity in a String format. This is simply the right
     * hand side of the equation.
     * @type {String}
     */
    definition: '',

    /**
     * An array containing all quantities on which this quantity is dependent.
     * Example: If the script contains a line 'a = b + c,'
     * then a, b, and c are quantities and quantity a is dependent on b and c.
     * @type {Quantity[]}
     */
    dependencies: [],

    /**
     * The unit of this quantity in a String format. If no unit is defined, the unit is
     * the empty string ''. Example: If the script contains a line 'a = 4 ; kg.m/s2'
     * then the unit of quantity a is 'kg.m/s2'.
     * @type {String}
     */
    unit: '',

    /**
     * The parameters of this quantity. If the quantity is not a function, this will be
     * the empty array []. Example: If the script contains a line 'f(x,y) = x + y'
     * then the parameters of quantity f are [x,y].
     * @type {Quantity[]}
     */
    parameters: [],

    /**
     * An optional comment explaining the quantity.
     * @type {String}
     */
    comment: '',

    /**
     * Returns a String representation of the line corresponding to this quantity
     * as provided by the user in the ACCEL script.
     * @return {String} the line corresponding to this quantity
     */
    toString: function() {

    }
};
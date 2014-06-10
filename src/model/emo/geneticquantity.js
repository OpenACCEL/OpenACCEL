/*
 * File containing the Genetic Quantity class
 *
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

define([], /**@lends Model.EMO*/ function() {

    /**
     * @class
     * @classdesc Class for a Genetic Quantity.
     * A genetic quantity contains a quantity's value and range.
     */
    function GeneticQuantity(value, min, max) {

        /**
         * The value of the quantity.
         *
         * @type {Number}
         */
        this.value = value;

        /**
         * The minimum value of the quantity.
         *
         * @type {Number}
         */
        this.min = min;

        /**
         * The maximum value of the quantity.
         *
         * @type {Number}
         */
        this.max = max;
    }

    return GeneticQuantity;
});

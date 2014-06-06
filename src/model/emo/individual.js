/*
 * File containing the Individual class
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

define([], /**@lends Model.emo*/ function() {

    /**
     * @class
     * @classdesc Class for an individual.
     */
    function Individual(vector) {

        /**
         * The vector containing the dimensions of an individual.
         *
         * @type {Array}
         */
        this.vector = vector;

        /**
         * Denotes whether an invidivual is in the Pareto Set.
         *
         * @type {Boolean}
         */
        this.inParetoSet = undefined;

        /**
         * Denotes whether an invidivual is in the Pareto Front.
         *
         * @type {Boolean}
         */
        this.inParetoFront = undefined;

        /**
         * Returns the vector of an individual.
         *
         * @return {Array} the vector containing the dimensions of an individual
         */
        Individual.prototype.getVector = function() {
            return vector;
        };

        /**
         * Returns whether an individual is in the Pareto Set.
         *
         * @return {Boolean} whether an individual is in the Pareto Set
         */
        Individual.prototype.inParetoSet = function() {
            return inParetoSet;
        };

        /**
         * Returns whether an individual is in the Pareto Front.
         *
         * @return {Boolean} whether an individual is in the Pareto Front
         */
        Individual.prototype.inParetoFront = function() {
            return inParetoFront;
        };
    }
});

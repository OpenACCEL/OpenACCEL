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

define([], /**@lends Model.EMO*/ function() {

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
    }

    /**
     * Returns whether an individual dominates another individual.
     *
     * An individual dominates another individual if:
     * - for every dimension individual is better than or equal to another individual
     * - for at least one dimension individual is better than another individual
     *
     * @param  {Individual} individual2 another individual
     * @pre individual2 != null
     * @pre individual2 != undefined
     * @return {Boolean}    whether an individual dominates another individual.
     */
    Individual.prototype.dominates = function(individual2) {
        if (!individual2) {
            throw new Error("Individual.dominates.pre is violated: individual2 is null or undefined.");
        }
        var vector1 = this.vector;
        var vector2 = individual2.vector;
        if (vector1.length !== vector2.length) {
            throw new Error("Cannot compare individuals of unequal dimensions.");
        }
        var worse = false;
        var equal = true;
        for (var i = vector1.length - 1; i >= 0 && !worse; i--) {
            worse = vector1[i] < vector2[i];
            equal = (vector1[i] === vector2[i]) && equal;
        }
        return (!equal && !worse);
    };

    return Individual;
});

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
    function Individual(inputvector, outputvector) {

        /**
         * The vector containing the dimensions of an individual.
         *
         * @type {Array}
         */
        this.inputvector = inputvector;

        /**
         * The vector containing the output elements used in the SPEA algorithm, corresponding
         * to the input elements in vector.
         *
         * @type {Array}
         */
        this.outputvector = outputvector;

        /**
         * Denotes whether an invidivual is in the Pareto Front, i.e. it is non-dominated.
         *
         * @type {Boolean}
         */
        this.inParetoFront = false;

        /**
         * Denotes the strength value of an individual.
         *
         * @type {Number}
         */
        this.strength = 0;

        /**
         * Denotes the fitness value of an individual.
         *
         * @type {Number}
         */
        this.fitness = 0;
    }

    /**
     * Returns whether an individual dominates another individual.
     *
     * An individual dominates another individual if:
     * - for every dimension individual is better than or equal to another individual
     * - for at least one dimension individual is better than another individual
     *
     * @param {Individual}  individual2 another individual
     * @pre individual2 != null
     * @pre individual2 != undefined
     * @return {Boolean}    whether an individual dominates another individual.
     */
    Individual.prototype.dominates = function(individual2) {
        if (!individual2) {
            throw new Error("Individual.dominates.pre is violated: individual2 is null or undefined.");
        }

        var outputvector1 = this.outputvector;
        var outputvector2 = individual2.outputvector;

        if (outputvector1.length !== outputvector2.length) {
            throw new Error("Cannot compare individuals of unequal dimensions.");
        }

        var worse = false;
        var equal = true;
        // loop over all dimensions of the output vector
        // unless individual is already worse than the other
        for (var i = outputvector1.length - 1; i >= 0 && !worse; i--) {
            // if the current dimension is to be maximized the individual is worse
            // when it has a lower value than the other
            if (outputvector1[i].maximize) {
                worse = outputvector1[i].value < outputvector2[i].value;
            }
            // if the current dimension is to be minimized the individual is worse
            // when it has a higher value than the other
            else {
                worse = outputvector1[i].value > outputvector2[i].value;
            }
            // update equal if both values are equal and ensure previous dimensions
            // are taken into consideration
            equal = (outputvector1[i].value === outputvector2[i].value) && equal;
        }
        // return whether the individual dominates another individual
        return (!equal && !worse);
    };

    return Individual;
});

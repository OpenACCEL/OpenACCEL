/*
 * The close mutation takes as input one individual.
 * It mutates one arbitrary category I quantity and gives it
 * a value close to the original value in the domain of that category.
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

define([], /**@lends Model.EMO.Mutation*/ function() {
    /**
     * @class CloseMutation
     * @classdesc The close mutation mutates one arbitrary category I quantity
     * and gives it a value close to the original value in the domain
     * of that category.
     */
    function CloseMutation() {

        CloseMutation.prototype = new Mutation();

        /**
         * The percentage that determines the closeness of the new value
         * @type {Number}
         */
        var PERCENTAGE = 0.05;

        /**
         * Mutates one arbitrary category I quantity and gives it
         * a value close to the original value in the domain of that category.
         *
         * @param {Individual} individual   the individual to mutate
         * @pre individual != null or undefined
         * @return {Individual}             the mutated individual
         */
        CloseMutation.prototype.mutate = function(individual) {
            Mutation.prototype.mutate.call(individual);
            var vector = individual.vector;

            // obtain the quantity to be mutated
            var quantityIndex = Random.getRandomInt(0, vector.length - 1);
            var quantity = vector[quantityIndex];

            // obtain the new value for the quantity
            var range = quantity.max - quantity.min;
            var newMin = quantity.value - PERCENTAGE * range;
            var newMax = quantity.value + PERCENTAGE * range;
            var newValue = Random.getRandomDouble(newMin, newMax);
            individual.vector[quantityIndex].value = newValue;
            return individual;
        };

        return CloseMutation;
    }
});

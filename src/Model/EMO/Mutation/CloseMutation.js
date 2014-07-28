/*
 * The close mutation takes as input one individual.
 * It mutates one arbitrary category I quantity and gives it
 * a value close to the original value in the domain of that category.
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

define(["Model/EMO/Mutation/Mutation", "Model/EMO/Random"], /**@lends Model.EMO.Mutation*/ function(Mutation, Random) {

    /**
     * @class
     * @classdesc The close mutation mutates one arbitrary category I quantity
     * and gives it a value close to the original value in the domain
     * of that category.
     */
    function CloseMutation() {}

    CloseMutation.prototype = new Mutation();

    /**
     * The percentage that determines the closeness of the new value
     *
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
        Mutation.prototype.mutate.call(this, individual);
        var inputvector = individual.inputvector;
        // obtain the quantity to be mutated
        var quantity = Random.prototype.getRandomElement(inputvector);
        // determine range
        var minRange = quantity.minimum;
        var maxRange = quantity.maximum;
        var range = maxRange - minRange;
        // determine min value that is still in range for the new quantity
        var minValue = Math.max(minRange, quantity.value - PERCENTAGE * range);
        // determine max value that is still in range for the new quantity
        var maxValue = Math.min(quantity.value + PERCENTAGE * range, maxRange);
        // if max value lies on the border, shift the min value
        if (maxValue === maxRange) {
            minValue = maxValue - PERCENTAGE * 2 * range;
        }
        // if min value lies on the border, shift the max value
        if (minValue === minRange) {
            maxValue = minValue + PERCENTAGE * 2 * range;
        }
        var oldValue = quantity.value;
        var newValue = Random.prototype.getRandomDouble(minValue, maxValue, quantity.precision);
        // if new value equals old value, check if, when 1 is added to it,
        // new value still lies within the range.
        if (newValue === oldValue) {
            if (newValue === maxRange) {
                newValue--;
            } else {
                newValue++;
            }
        }
        quantity.value = newValue;
        return individual;
    };

    return CloseMutation;
});

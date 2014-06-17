/*
 * The random mutation takes as input one individual.
 * It mutates all category I quantities and gives them
 * a random value in the domain of their category.
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
     * @class RandomMutation
     * @classdesc The random mutation mutates all category I quantities
     * and gives them a random value in the domain of their category.
     */
    function RandomMutation() {}

    RandomMutation.prototype = new Mutation();

    /**
     * Mutates all category I quantities and gives them
     * a random value in the domain of their category.
     *
     * @param {Individual} individual   the individual to mutate
     * @pre individual != null or undefined
     * @return {Individual}             the mutated individual
     */
    RandomMutation.prototype.mutate = function(individual) {
        Mutation.prototype.mutate.call(this, individual);
        var inputvector = individual.inputvector;
        var quantity;
        for (var i = inputvector.length - 1; i >= 0; i--) {
            // obtain the quantity to be mutated
            quantity = inputvector[i];
            // the new value for the quantity
            quantity.value = Random.prototype.getRandomDouble(quantity.minimum, quantity.maximum, quantity.precision);
        }
        return individual;
    };
});

/*
 * The arbitrary mutation takes as input one individual.
 * It mutates one arbitrary category I quantity and gives it
 * a random value in the domain of that category.
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

define(["model/emo/mutation/mutation", "model/emo/random"], /**@lends Model.EMO.Mutation*/ function(Mutation, Random) {

    /**
     * @class ArbitraryMutation
     * @classdesc The arbitrary mutation mutates one arbitrary
     * category I quantity and gives it a random value in the domain
     * of that category.
     */
    function ArbitraryMutation() {}

    ArbitraryMutation.prototype = new Mutation();

    /**
     * Mutates one arbitrary category I quantity and gives it
     * a random value in the domain of that category.
     *
     * @param {Individual} individual   the individual to mutate
     * @pre individual != null or undefined
     * @return {Individual}             the mutated individual
     */
    ArbitraryMutation.prototype.mutate = function(individual) {
        Mutation.prototype.mutate.call(this, individual);
        var inputvector = individual.inputvector;
        // obtain the quantity to be mutated
        var quantity = Random.prototype.getRandomElement(inputvector);
        // the new value for the quantity
        quantity.value = Random.prototype.getRandomDouble(quantity.minimum, quantity.maximum, quantity.precision);
        return individual;
    };

    return ArbitraryMutation;
});

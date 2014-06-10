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

define([], /**@lends Model.EMO.Mutation*/ function() {
    /**
     * @class ArbitraryMutation
     * @classdesc The arbitrary mutation mutates one arbitrary
     * category I quantity and gives it a random value in the domain
     * of that category.
     */
    function ArbitraryMutation() {

        ArbitraryMutation.prototype = new Mutation();

        /**
         * Mutates one arbitrary category I quantity and gives it
         * a random value in the domain of that category.
         *
         * @param {Individual} individual   the individual to mutate
         * @pre individual != null or undefined
         * @return {Individual}             the mutated individual
         */
        ArbitraryMutation.prototype.mutate = function() {
            Mutation.prototype.mutate.call(individual);
        };

        return ArbitraryMutation;
    }
});

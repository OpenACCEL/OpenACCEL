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
         * Mutates one arbitrary category I quantity and gives it
         * a value close to the original value in the domain of that category.
         *
         * @param {Individual} individual   the individual to mutate
         * @pre individual != null or undefined
         * @return {Individual}             the mutated individual
         */
        CloseMutation.prototype.mutate = function(individual) {
            Mutation.prototype.mutate.call(individual);
        };

        return CloseMutation;
    }
});

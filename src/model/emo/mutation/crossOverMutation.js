/*
 * The CrossOverMutation takes no individuals as input. It takes two individuals from the Pareto
 * front. For each category I quantity, a random one is selected from the two individuals chosen
 * before.
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
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define([], /**@lends Mutation*/ function() {
    /**
     * @class CrossOverMutation
     * @classdesc The CrossOverMutation takes no individuals as input. It takes two individuals from the Pareto
     * front. For each category I quantity, a random one is selected from the two individuals chosen
     * before.
     */
    function CrossOverMutation() {

        CrossOverMutation.prototype = new Mutation();

        /**
         * Returns a cross over mutant based on two individuals on the Pareto front. That is,
         * for each category I quantity a choice is made between the two values for these
         * category I quantities that the two individuals on the Pareto front have.
         * @param {Individual[]} input two individuals on the Pareto front
         * @pre input != null && input != undefined && input.length == 2 &&
         * input[0] is on the Pareto front && input[1] is on the Pareto front
         * @return {Individual} the mutated individual
         */
        CrossOverMutation.prototype.mutate = function(input) {
            if (!input) {
                throw new Error('CrossOverMutation.mutate().pre violated:' +
                    'input individual is null or undefined');
            }
            if (input.length != 2) {
                throw new Error('CrossOverMutation.mutate().pre violated:' +
                    'instead of providing 2 individuals, you provided ' + input.length);
            }
            if (false) { // TODO add that input[0] and input[1] are both on the Pareto front.
                throw new Error(); //TODO
            }
        };

        return CrossOverMutation;
    }
});
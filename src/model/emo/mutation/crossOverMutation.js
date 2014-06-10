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
         * input[0] != null && input[1] != null && input[0] != undefined && input[1] != undefined
         * input[0].inParetoFront() && input[1].inParetoFront()
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
            if (!input[0] || !input[1]) {
                throw new Error('CrossOverMutation.mutate().pre violated:' +
                    'one of your provided individuals is null or undefined');
            }
            if (!(input[0].onParetoFront() && input[1].onParetoFront())) {
                throw new Error('CrossOverMutation.mutate().pre violated:' +
                    'one of the provided individuals is not on the Pareto front');
            }
        };

        return CrossOverMutation;
    }
});
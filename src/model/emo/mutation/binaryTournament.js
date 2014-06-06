/*
 * The BinaryTournamentMutation takes two input individuals that are not on the Pareto front.
 * It calculates the strength of each of these two individuals and chooses the strongest one.
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
     * @class BinaryTournamentMutation
     * @classdesc The BinaryTournamentMutation takes two input individuals that are not on the Pareto front.
     * It calculates the strength of each of these two individuals and chooses the strongest one.
     */
    function BinaryTournamentMutation() {

        BinaryTournamentMutation.prototype = new Mutation();

        /**
         * Takes two input individuals that are not on the Pareto front.
         * It calculates the strength of each of these two individuals and chooses the strongest one.
         * @param {Individual[]} input the two individuals that we would like to compare
         * @pre input != null && input != undefined && input.length == 2 &&
         * input[0] is not on the Pareto front && input[1] is not on the Pareto front
         * @return {Individual} the mutated individual
         */
        BinaryTournamentMutation.prototype.mutate = function(input) {
            if (!input) {
                throw new Error('BinaryTournamentMutation.mutate().pre violated:' +
                    'input individual is null or undefined');
            }
            if (input.length != 2) {
                throw new Error('BinaryTournamentMutation.mutate().pre violated:' +
                    'instead of 2 individuals, you provided ' + input.length + ' individuals');
            }
            if (false) { //TODO input[0] is not on pareto front or input[1] is not on pareto front
                throw new Error(); //TODO
            }
        };

        return BinaryTournamentMutation;
    }
});
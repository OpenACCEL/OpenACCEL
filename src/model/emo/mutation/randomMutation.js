/*
 * The random mutation does not use the input individual at all and simply generates a new
 * random individual, by selecting the category I variables in a random way. Boolean values
 * are randomly set to true or false.
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
     * @class RandomMutation
     * @classdesc The random mutation simply returns a mutation with random category I variables
     * and random boolean values.
     */
    function RandomMutation() {

        RandomMutation.prototype = new Mutation();

        /**
         * Takes one individual as input and returns a random individual. That is, an individual
         * with random category I variables and random boolean values.
         * @param {Individual} input the individual provided as input
         * @pre input != null && input != undefined &&
         * !input.inParetoFront()
         * @return {Individual} a random individual
         */
        RandomMutation.prototype.mutate = function(input) {
            if (!input) {
                throw new Error('RandomMutation.mutate().pre violated:' +
                    'your input individual is null or undefined');
            }
            if (input.inParetoFront()) {
                throw new Error('RandomMutation.mutate().pre violated:' +
                    'your input individual is on the Pareto front');
            }
        };

        return RandomMutation;
    }
});
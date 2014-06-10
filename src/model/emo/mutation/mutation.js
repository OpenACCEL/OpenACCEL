/*
 * Abstract class that represents a mutation in the Genetic Optimization algorithm.
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
     * @class Mutation
     * @classdesc A mutation mutates one of the individuals not in the Pareto front.
     */
    function Mutation() {

        /**
         * Takes one or two individuals as input and returns one individual which
         * is a mutant based on the this or these individuals. Should be overridden by
         * other classes.
         * @param {Individual[]} arguments the individuals provided as input
         * (In Javascript arguments gives an array of all arguments provided to this function)
         * @pre arguements != null or undefined
         * @return {Individual} the mutated individual
         */
        Mutation.prototype.mutate = function() {
            if (!arguments) {
                throw new Error('RandomMutation.mutate().pre violated:' +
                    'your input individual(s) is/are null or undefined');
            }
        };

        return Mutation;
    }
});
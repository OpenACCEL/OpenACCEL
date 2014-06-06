/*
 * The closeMutation returns a mutant which is close to the input individual.
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
     * @class CloseMutation
     * @classdesc The closeMutation returns a mutant which is close to the input individual.
     */
    function CloseMutation() {

        CloseMutation.prototype = new Mutation();

        /**
         * Takes one individual as input and mutates one of the category I quantities,
         * by choosing a value which is close to the value of the input.
         * @param {Individual} input the individual provided as input
         * @pre input != null && input != undefined
         * @return {Individual} the mutated individual
         */
        CloseMutation.prototype.mutate = function(input) {
            if (!input) {
                throw new Error('CloseMutation.mutate().pre violated:' +
                    'input individual is null or undefined');
            }
        };

        return CloseMutation;
    }
});
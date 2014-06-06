/*
 * The arbitrary mutation takes as input one other individual. It mutates one random category I
 * quantity and returns the resulting individual.
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
     * @class ArbitraryMutation
     * @classdesc The arbitrary mutation mutates one random category I quantity
     * and returns the mutated individual.
     */
    function ArbitraryMutation() {

        ArbitraryMutation.prototype = new Mutation();
        
        /**
         * Takes one individual as input and mutates one of the category I quantities, randomly
         * chosen.
         * @param {Individual} input the individual provided as input
         * @pre input != null && input != undefined
         * @return {Individual} the mutated individual
         */
        ArbitraryMutation.prototype.mutate = function(input) {
            if (!input) {
                throw new Error('ArbitraryMutation.mutate().pre violated:' +
                    'input individual is null or undefined');
            }
        };

        return ArbitraryMutation;
    }
});
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
         * Takes no individual as input and returns a random individual. That is, an individual
         * with random category I variables and random boolean values.
         * @return {Individual} a random individual
         */
        RandomMutation.prototype.mutate = function() {

        };

        return RandomMutation;
    }
});
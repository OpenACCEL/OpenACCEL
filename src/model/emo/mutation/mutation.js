/*
 * Abstract class that represents a mutation in a Genetic Optimization algorithm.
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
     * @class Mutation
     * @classdesc A mutation mutates one of the individuals.
     */
    function Mutation() {}

    /**
     * Mutates the individual.
     *
     * Should be overridden by other classes.
     *
     * @param {Individual} individual   the individual to mutate
     * @pre individual != null or undefined
     * @return {Individual} the mutated individual
     */
    Mutation.prototype.mutate = function(individual) {
        if (!individual) {
            throw new Error('Mutation.mutate().pre violated:' +
                'individual is null or undefined');
        }
    };

    return Mutation;
});

/*
 * Abstract class that represents a cross-over in a Genetic Optimization algorithm.
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

define([], /**@lends Model.EMO.CrossOver*/ function() {

    /**
     * @class
     * @classdesc A cross-over takes two parents and produces two children.
     */
    function CrossOver() {}

    /**
     * Takes two parents and produces two children,
     * based on a cross-over principle.
     *
     * @param {Individual} parent1  the first parent
     * @param {Individual} parent2  the second parent
     * @pre parent1 != null or undefined
     * @pre parent2 != null or undefined
     * @pre parent1.inputvector.length == parent2.inputvector.length
     * @return {Individual[]} the offspring, the result of the cross-over
     */
    CrossOver.prototype.produce = function(parent1, parent2) {
        if (!parent1) {
            throw new Error('CrossOver.produce().pre violated:' +
                'parent1 is null or undefined');
        }
        if (!parent2) {
            throw new Error('CrossOver.produce().pre violated:' +
                'parent2 is null or undefined');
        }
        if (parent1.inputvector.length != parent2.inputvector.length) {
            throw new Error('CrossOver.produce().pre violated:' +
                'individual 1 and parent2 have vectors of unequal length');
        }
    };

    return CrossOver;
});

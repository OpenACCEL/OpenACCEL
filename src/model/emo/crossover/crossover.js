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
     * @class CrossOver
     * @classdesc A cross-over takes two parents and creates two children.
     */
    function CrossOver() {

        /**
         * Takes two individuals and generates two children,
         * based on the cross-over principle.
         *
         * @param {Individual} individual1  the first individual
         * @param {Individual} individual2  the second individual
         * @pre individual1 != null or undefined
         * @pre individual2 != null or undefined
         * @return {Individual[]} two individuals, the result of the cross-over
         */
        CrossOver.prototype.cross = function(individual1, individual2) {
            if (!individual1) {
                throw new Error('CrossOver.cross().pre violated:' +
                    'individual1 is null or undefined');
            }
            if (!individual2) {
                throw new Error('CrossOver.cross().pre violated:' +
                    'individual2 is null or undefined');
            }
        };

        return CrossOver;
    }
});

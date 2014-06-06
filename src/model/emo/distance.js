/*
 * File containing the Distance class
 *
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

define([], /**@lends Model.emo*/ function() {

    /**
     * @class
     * @classdesc Class for distance metric(s).
     */
    function Distance() {

        /**
         * Returns the Euclidean distance between two individuals.
         *
         * @param  {Individual} individual1 the first individual
         * @param  {Individual} individual2 the second invididual
         * @return {Number}     the Euclidian distance between individual1 and individual2
         */
        Distance.prototype.euclidean = function(individual1, individual2) {
            var sum = 0;
            vector1 = individual1.getVector();
            vector2 = individual2.getVector();
            for (var i = vector1.length - 1; i >= 0; i--) {
                sum += Math.pow(vector1[i] - vector2[i], 2);
            }
            return Math.sqrt(sum);
        };
    }
});

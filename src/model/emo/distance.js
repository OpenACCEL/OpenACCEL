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
    function Distance() {}

    /**
     * Returns the Euclidean distance between two vectors.
     *
     * Vectors are an array of objects containing a value field.
     *
     * @param  {vector} vector1 the first vector
     * @param  {vector} vector2 the second vector
     * @return {Number} the Euclidian distance between vector1 and vector2
     */
    Distance.prototype.euclidean = function(vector1, vector2) {
        var sum = 0;
        for (var i = vector1.length - 1; i >= 0; i--) {
            sum += Math.pow(vector1[i].value - vector2[i].value, 2);
        }
        return Math.sqrt(sum);
    };

    return Distance;
});

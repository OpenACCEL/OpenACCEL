/*
 * File containing the Random class
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

define([], /**@lends Model.EMO*/ function() {

    /**
     * @class
     * @classdesc Class for generating a random number.
     */
    function Random() {}

    /**
     * Returns a random integer between min and max
     *
     * @param  {Number} min the lower bound
     * @param  {Number} max the upper bound
     * @return {Number}     a random integer between min and max
     */
    Random.prototype.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Returns a random double between min and max
     *
     * @param  {Number} min the lower bound
     * @param  {Number} max the upper bound
     * @return {Number}     a random double between min and max
     */
    Random.prototype.getRandomDouble = function(min, max) {
        return (Math.random() * (max - min)) + min;
    };

    return Random();
});

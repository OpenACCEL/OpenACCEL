/*
 * File containing the SPEA class
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
     * @classdesc Class for the Strength Pareto Evolutionary Algorithm.
     */
    function SPEA() {}

    SPEA.prototype.initialise = function() {};

    SPEA.prototype.mergeOffspring = function() {};

    SPEA.prototype.calculateFitness = function() {};

    SPEA.prototype.environmentalSelection = function() {};

    SPEA.prototype.matingSelection = function() {};

    return SPEA;
});

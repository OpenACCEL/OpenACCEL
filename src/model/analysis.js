/*
 * File containing the Analysis class.
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define([], /** @lends Model */ function() {

    /**
     * @class
     * @classdesc Main class for the analysis of a script.
     */
    function Analysis () {}

    /**
     * Analyses the script.
     *
     * @param {Script} script The script that needs to be analysed.
     */
    Analysis.prototype.analyse = function(script) {};

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Analysis;
});

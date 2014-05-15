/*
 * File containing the AnalyserPass class
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

define(['model/passes/pass'], /**@lends ExePass*/ function(Pass) {
    /**
     * @class
     * @classdesc Abstract Pass that is part of compiling the script.
     */
    function AnalyserPass() {}

    AnalyserPass.prototype = new Pass();


    // Exports are needed, such that other modules may invoke methods from this module file.
    return AnalyserPass;
});
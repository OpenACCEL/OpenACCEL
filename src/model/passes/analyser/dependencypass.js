/*
 * File containing the DependencyPass class
 *
 * @author
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

define(['model/passes/analyser/analyserpass'], /**@lends ExePass*/ function(AnalyserPass) {
    /**
     * @class
     * @classdesc Abstract Pass that is part of compiling the script.
     */
    function DependencyPass() {}

    DependencyPass.prototype = new AnalyserPass();


    // Exports are needed, such that other modules may invoke methods from this module file.
    return DependencyPass;
});
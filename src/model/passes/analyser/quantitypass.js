/*
 * File containing the QuantityPass class
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

define(['model/passes/analyser/analyserpass'], /**@lends ExePass*/ function(AnalyserPass) {
    /**
     * @class
     * @classdesc Abstract Pass that is part of compiling the script.
     */
    function QuantityPass() {}

    QuantityPass.prototype = new AnalyserPass();

    /**
     * @Override
     * Determines the quantities that are present in the script
     */
    QuantityPass.prototype.parse = function(scriptLines) {

    }


    // Exports are needed, such that other modules may invoke methods from this module file.
    return QuantityPass;
});
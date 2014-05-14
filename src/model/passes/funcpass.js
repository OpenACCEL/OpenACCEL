/**
 * File containing the FuncPass class
 *
 * @author Roel Jacobs
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    sweetModule = 'sweet.js';
} else {
    sweetModule = 'sweet';

    require.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(['model/passes/pass'], function(Pass) {
    /**
     * @class
     * @classdesc Pass that wraps each line of script in a 'func(...)' statement.
     */
    function FuncPass() {}

    // Inheritance
    FuncPass.prototype = new Pass();

    /**
     * Wraps each line of script in a 'func(...)' statement.
     * @param  {String[]} scriptLines Array of script lines
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @return {String[]}             Array in which each line of the input is wrapped in a 'func(...)' statement.
     */
    FuncPass.prototype.parse = function(scriptLines) {
        // Precondition check
        Pass.prototype.parse.call(this, scriptLines);

        return scriptLines.map(function(line) {
            return 'func(' + line + ')';
        });
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return FuncPass;
});
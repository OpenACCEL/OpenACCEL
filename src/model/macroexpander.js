/*
 * The macro expander takes as input a bunch of defined macros, runs them through the Sweet compiler and returns 
 * a piece of executable javascript code. That is, this is the code that should be eval()'d and return an executable.
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) { 
    require = require('requirejs');
    sweetModule = "sweet.js";
} else {
    sweetModule = "sweet";

    require.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define([sweetModule], /**@lends MacroExpander*/ function(sweet) {
    /**
     * @class
     * @classdesc The macro expander takes as input a bunch of defined macros, runs them through the Sweet compiler
     *            and returns a piece of executable javascript code. That is, this is the code that should be
     *            eval()'d and return an executable.
     */
    function MacroExpander() {

    }

    /**
     * Expands the loaded macros.
     * 
     * @param {String} code Input code that has to be expanded.
     * @return {String}     Expanded code, ready for evaluation.
     */
    MacroExpander.prototype.expand = function(code, macros) {
        code = macros.concat(code);
        var output;

        try {
            // We do not compile with source maps at all. I don't even know for 100% what they are lol.
            output = sweet.compile(code, {
                sourceMap: false,
                readableNames: true
            });

            // We return the code that can be evalled.
            return output.code;
        } catch (err) {
            // TODO: Handle error nicely.
            throw new Error(err);
        }
    }

    // Export the MacroExpander class.
    return MacroExpander;
});

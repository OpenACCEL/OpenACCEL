/**
 *
 * @author Jacco Snoeren
 */

/** Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(["model/compiler"], function(Compiler) {
    function Script() {
        this.compiler = new Compiler();
    }

    Script.prototype = {

        /**
         * The source of the ACCEL script, as provided by the user.
         * @type {String}
         */
        source: '',

        /**
         * Contains the quantities that together make up this script.
         * @type {Quantity[]}
         */
        quantities: [],

        /**
         * Add quantity to quantities and recompiles the script.
         * @param {String} source a line in the script as provided by the user
         * @pre source is in the format x(a) = 'definition', where a can be empty.
         * @modifies quantities
         */
        addQuantity: function(source) {
            // TODO: quantities should be updated.
            this.source = source;
            scriptChanged();
        },

        scriptChanged: function() {
            this.compiler.compile(this.source);
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Script;
});
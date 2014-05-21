/*
 * The analyser extracts information of the script.
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
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

define(["model/passes/analyser/quantitypass",
        "model/passes/analyser/dependencypass"
    ],
    /**@lends Analyser*/
    function(QuantityPass,
             DependencyPass) {
        /**
         * @class
         * @classdesc The analyser analyses a line of script and updates the quantities of the script accordingly.
         */
        function Analyser() {
            /**
             * The 'passes' object is an array of passes and not a dictionary, because the order of pass execution matters.
             */
            this.passes = [];
            this.passes.push(new QuantityPass());
            this.passes.push(new DependencyPass());
        }

            /**
             * Returns a new object with quantities, containing the newly defined one.
             *
             * @param {String} line         A single line of input code.
             * @return {quantities{} }      An object containing all the quantities in the script.
             */
        Analyser.prototype.analyse = function(line, quantities) {
            for (var i = 0; i < this.passes.length; i++) {
                quantities = this.passes[i].analyse(line, quantities);
            }

            return quantities;
        };

        // Exports all macros.
        return Analyser;
    });

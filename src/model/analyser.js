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
         * @classdesc The analyser extracts information of the script.
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
             * Generated a report by invoking analyses passes on intermediate reports.
             *
             * @param {String} code     A single line of input code.
             * @return {Report}         A full report.
             */
        Analyser.prototype.analyse = function(code) {
            var lines = code.split("\n");
            var report = {};

            for (var i = 0; i < this.passes.length; i++) {
                report = this.passes[i].analyse(lines, report);
            }

            return report;
        };

        // Exports all macros.
        return Analyser;
    });

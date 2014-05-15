/*
 * The pre-processor performs passes on some input code.
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

define(["model/passes/unitpass",
        "model/passes/exepass",
        "model/passes/funcpass",
        "model/passes/packagepass"
    ],
    /**@lends PreProcessor*/
    function(UnitPass,
        ExePass,
        FuncPass,
        PackagePass) {
        /**
         * @class
         * @classdesc The pre-processor performs multiple passes over the code for transformation and analysation.
         */
        function PreProcessor() {
            /**
             * The 'passes' object is an array of passes and not a dictionary, because the order of pass execution matters.
             */
            this.passes = [];
            this.passes.push(new UnitPass());
            this.passes.push(new ExePass());
            this.passes.push(new FuncPass());
            this.passes.push(new PackagePass());
        }

        PreProcessor.prototype = {
            /**
             * Transforms a piece of code with the configured order of passes.
             *
             * @param {String} code     A single line of input code.
             * @return {String} A single line of processed code.
             */
            process: function(code) {
                // Perform all passes on the code and return its output.
                var lines = code.split("\n");

                for (var i = 0; i < this.passes.length; i++) {
                    lines = this.passes[i].parse(lines);
                }

                return lines.join("");
            }
        }

        // Exports all macros.
        return PreProcessor;
    });

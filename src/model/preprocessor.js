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

define(["model/stringreplacer",
        "model/passes/preprocessor/historypass",
        "model/passes/preprocessor/unitpass",
        "model/passes/preprocessor/operatorpass",
        "model/passes/preprocessor/exepass",
        "model/passes/preprocessor/funcpass",
        "model/passes/preprocessor/packagepass",
        "model/passes/preprocessor/vectorpass",
        "model/passes/preprocessor/namedvectorpass",
        "model/passes/preprocessor/uipass",
        "model/passes/preprocessor/ifpass",
        "model/passes/preprocessor/quantifierpass",
        "model/passes/preprocessor/commentpass",
        "model/passes/preprocessor/atpass"
    ],
    /**@lends Model*/
    function(
        StringReplacer,
        HistoryPass,
        UnitPass,
        OperatorPass,
        ExePass,
        FuncPass,
        PackagePass,
        VectorPass,
        NamedVectorPass,
        UIPass,
        IfPass,
        QuantifierPass,
        CommentPass,
        AtPass) {

        /**
         * @class
         * @classdesc The pre-processor performs multiple passes over the code for transformation and analysation.
         */
        function PreProcessor() {
            /**
             * The 'passes' object is an array of passes and not a dictionary, because the order of pass execution matters.
             */
            this.passes = [];
            this.passes.push(new HistoryPass());
            this.passes.push(new CommentPass());
            this.passes.push(new QuantifierPass());
            this.passes.push(new NamedVectorPass());
            this.passes.push(new VectorPass());
            this.passes.push(new IfPass());
            this.passes.push(new AtPass());
            this.passes.push(new ExePass());
            this.passes.push(new OperatorPass());
            this.passes.push(new UnitPass());
            this.passes.push(new UIPass());
            this.passes.push(new FuncPass());
            this.passes.push(new PackagePass());

            /**
             * Stringreplacer used to make sure the passes do not
             * edit the content of strings.
             * @type {StringReplacer}
             */
            this.replacer = new StringReplacer();
        }

        /**
         * Transforms a piece of code with the configured order of passes.
         *
         * @param {String} code     A single line of input code.
         * @return {String} A single line of processed code.
         */
        PreProcessor.prototype.process = function(script) {
            // Perform all passes on the code and return its output.
            var report = script.getQuantities();
            var lines = script.getSource().split("\n");

            // replace string definitions for wildcards
            lines = this.replacer.replaceStrings(lines);

            // executing passes
            for (var i = 0; i < this.passes.length; i++) {
                lines = this.passes[i].parse(lines, report);
            }

            // restore all string definitions
            lines = this.replacer.restoreStrings(lines);

            return lines.join("");
        };

        // Exports all macros.
        return PreProcessor;
    });

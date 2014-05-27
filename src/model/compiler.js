/*
 * Central compiling point. Code goes in, executable and report go out.
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

define(["model/fileloader",
        "model/preprocessor",
        "model/macroexpander"
    ], /**@lends Model*/
    function(FileLoader,
        PreProcessor,
        MacroExpander) {
        /**
         * @class
         * @classdesc The compiler takes code as input, and outputs an executable and report when compiling.
         */
        function Compiler() {
            /**
             * The pre-processor performs passes on the code for analysis purposes, as well as making it ready for the macroExpander.
             */
            this.preProcessor = new PreProcessor();

            /**
             * The macro expander will expand all macros, such that the code can be eval()'d.
             */
            this.macroExpander = new MacroExpander();

            /**
             * The file loader is reponsible for loading all files, like macros and library functions.
             */
            this.fileLoader = new FileLoader();
            this.fileLoader.load("func");
            this.fileLoader.load("operators");
            this.fileLoader.load("cond");

            this.fileLoader.load("map", "library");
            this.fileLoader.load("zip", "library");
            this.fileLoader.load("nzip", "library");

            this.fileLoader.load("add", "library");
            this.fileLoader.load("subtract", "library");
            this.fileLoader.load("multiply", "library");
            this.fileLoader.load("divide", "library");

            this.fileLoader.load("sin", "library");
            this.fileLoader.load("cos", "library");
            this.fileLoader.load("tan", "library");
            this.fileLoader.load("pow", "library");
            this.fileLoader.load("sqrt", "library");
            this.fileLoader.load("abs", "library");
            this.fileLoader.load("ceil", "library");
            this.fileLoader.load("floor", "library");
            this.fileLoader.load("round", "library");
            this.fileLoader.load("max", "library");
            this.fileLoader.load("min", "library");
            this.fileLoader.load("acos", "library");
            this.fileLoader.load("asin", "library");
            this.fileLoader.load("atan", "library");
            this.fileLoader.load("atan2", "library");
            this.fileLoader.load("exp", "library");
            this.fileLoader.load("ln", "library");
            this.fileLoader.load("log", "library");
            this.fileLoader.load("modulo", "library");
            this.fileLoader.load("sum", "library");

            this.fileLoader.load("__if__", "library");

            this.fileLoader.load("and", "library");
            this.fileLoader.load("equal", "library");
            this.fileLoader.load("greaterThan", "library");
            this.fileLoader.load("greaterThanEqual", "library");
            this.fileLoader.load("imply", "library");
            this.fileLoader.load("lessThan", "library");
            this.fileLoader.load("lessThanEqual", "library");
            this.fileLoader.load("not", "library");
            this.fileLoader.load("notEqual", "library");
            this.fileLoader.load("or", "library");

        }

        /**
         * Compiles a piece of ACCEL code and outputs an object, containing an executable.
         *
         * @param {Script} script   The ACCEL script to be compiled.
         * @return {Object}         An object, containing an executable and information.
         */
        Compiler.prototype.compile = function(script) {
            // Pre-process and expand.
            var code = this.preProcessor.process(script);
            code = this.fileLoader.getLibrary() + code;
            code = this.macroExpander.expand(code, this.fileLoader.getMacros());

            return {
                report: script.getQuantities(),
                exe: eval(code)
            };
        };

        // Exports all macros.
        return Compiler;
    });

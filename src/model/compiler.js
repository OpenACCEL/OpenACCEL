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

            this.fileLoader.load("cond", "macros");
            this.fileLoader.load("func", "macros");
            this.fileLoader.load("operators", "macros");

            this.fileLoader.load("functions", "library");
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
            
            exe = eval(code);
            exe.__report__ = script.getQuantities();

            return {
                report: script.getQuantities(),
                exe: exe
            };
        };

        // Exports all macros.
        return Compiler;
    });

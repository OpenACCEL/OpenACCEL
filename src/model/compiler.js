/*
 * Central compiling point. Code goes in, executable and report go out.
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) { 
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["model/preprocessor", "model/macroexpander"], /**@lends Compiler*/ function(PreProcessor, MacroExpander) {
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
        this.macroExpander.load("func");
        this.macroExpander.load("cos");
        this.macroExpander.load("sin");
        this.macroExpander.load("tan");
        this.macroExpander.load("pow");
        this.macroExpander.load("sqrt");
        this.macroExpander.load("abs");
        this.macroExpander.load("ceil");
        this.macroExpander.load("floor");
        this.macroExpander.load("max");
        this.macroExpander.load("min");
        this.macroExpander.load("round");
        this.macroExpander.load("acos");
        this.macroExpander.load("asin");
        this.macroExpander.load("atan");
        this.macroExpander.load("atan2");
        this.macroExpander.load("exp");
        this.macroExpander.load("ln");
        this.macroExpander.load("log");
        this.macroExpander.load("modulo");
    }
    
    Compiler.prototype = {
        /**
         * Compiles a piece of ACCEL code and outputs an object, containing an executable.
         *
         * @param {String} code     A string of ACCEL code to be compiled.
         * @return {Object}         An object, containing an executable and information.
         */
        compile: function(code) {
            code = this.preProcessor.process(code);
            code = this.macroExpander.expand(code);
            return {
                exe: eval(code)
            }
        }
    }

    // Exports all macros.
    return Compiler;
});

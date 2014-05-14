/**
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

define(["model/preprocessor", "model/macroexpander"], function(PreProcessor, MacroExpander) {
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
    }
    
    Compiler.prototype = {
        /**
         * Compiles a piece of ACCEL code and outputs an object, containing an executable.
         *
         * @param code A string of ACCEL code to be compiled.
         * @return An object, containing an executable and information.
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
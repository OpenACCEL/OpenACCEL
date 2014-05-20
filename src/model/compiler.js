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

define(["model/fileloader",
        "model/analyser",
        "model/preprocessor",
        "model/macroexpander"], /**@lends Compiler*/
        function(FileLoader,
                 Analyser,
                 PreProcessor,
                 MacroExpander) {
    /**
     * @class
     * @classdesc The compiler takes code as input, and outputs an executable and report when compiling.
     */
    function Compiler() {
        /**
         * The analyser extracts information of the script, which is also needed for the pre-processor.
         */
        this.analyser = new Analyser();

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

        this.fileLoader.load("map", "library");
        this.fileLoader.load("zip", "library");
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

    }
    
    /**
     * Compiles a piece of ACCEL code and outputs an object, containing an executable.
     *
     * @param {String} code     A string of ACCEL code to be compiled.
     * @return {Object}         An object, containing an executable and information.
     */
    Compiler.prototype.compile = function(code) {
        // Cleaning up.
        //code = code.trim();

        // Generate report for pre-processor.
        var report = this.analyser.analyse(code);
        this.preProcessor.report = report;

        // Pre-process and expand.
        code = this.preProcessor.process(code);
        code = this.fileLoader.getLibrary() + code;
        code = this.macroExpander.expand(code, this.fileLoader.getMacros());

        return {
            report: report,
            exe: eval(code)
        }
    };

    // Exports all macros.
    return Compiler;
});

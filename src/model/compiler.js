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
        //this.fileLoader.load("operators");

        this.fileLoader.load("cos");
        this.fileLoader.load("sin");
        this.fileLoader.load("tan");
        this.fileLoader.load("pow");
        this.fileLoader.load("sqrt");
        this.fileLoader.load("abs");
        this.fileLoader.load("ceil");
        this.fileLoader.load("floor");
        this.fileLoader.load("max");
        this.fileLoader.load("min");
        this.fileLoader.load("round");
        this.fileLoader.load("acos");
        this.fileLoader.load("asin");
        this.fileLoader.load("atan");
        this.fileLoader.load("atan2");
        this.fileLoader.load("exp");
        this.fileLoader.load("ln");
        this.fileLoader.load("log");
        this.fileLoader.load("modulo");
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
        //code = this.library.install(code);
        code = "function add(x, y) { return x + y }function subtract(x, y) { return x - y }function multiply(x, y) { return x * y }function divide(x, y) { return x / y }" + code;
        code = this.macroExpander.expand(code, this.fileLoader.getMacros());

        return {
            report: report,
            exe: eval(code)
        }
    };

    // Exports all macros.
    return Compiler;
});

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
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["model/fileloader",
        "model/macroexpander",
        "underscore",
        "model/parser",
        "model/SyntaxError"
        ], /**@lends Model*/
        function(FileLoader,
            MacroExpander,
            _,
            parser,
            SyntaxError) {

    /**
     * The pre-processor performs passes on the code for analysis purposes, as well as making it ready for the macroExpander.
     */
    function Compiler() {
        /**
         * The macro expander will expand all macros, such that the code can be eval()'d.
         */
        this.macroExpander = new MacroExpander();

        /**
         * The parser that will be used to parse inputted ACCEL code
         * and construct the executable from it.
         */
        this.parser = parser;

        /**
         * All the quantities in the script to be compiled.
         *
         * @type {Map<String, Quantity>}
         */
        this.quantities = null;

        /**
         * The file loader is reponsible for loading all files, like macros and library functions.
         */
        this.fileLoader = new FileLoader();

        this.fileLoader.load("cond", "macros");
        this.fileLoader.load("func", "macros");
        this.fileLoader.load("history", "macros");
        this.fileLoader.load("operators", "macros");
        this.fileLoader.load("quantifier", "macros");

        this.fileLoader.load("functions", "library");

        /**
         * Contains the quantities for which the history has been checked
         */
        this.historyChecked = [];

        /**
         * The total number of quantities in the script being compiled.
         */
        this.totalNumQuantities = 0;
    }

    /**
     * Compiles a piece of ACCEL code and outputs an object, containing an executable.
     *
     * @param {Script} script   The ACCEL script to be compiled.
     * @return {Object}         An object, containing an executable and information.
     */
    Compiler.prototype.compile = function(script) {
        this.quantities = script.getQuantities();
        var code;

        // Parse the script and handle any syntax errors
        try {
            code = this.parser.parse(script.getSource());
        } catch (e) {
            var err = new SyntaxError();
                
            err.found = e.hash.text;
            err.expected = e.hash.expected;
            err.firstLine = e.hash.loc.first_line;
            err.lastLine = e.hash.loc.last_line;
            err.startPos = e.hash.loc.first_column;
            err.endPos = e.hash.loc.last_column;

            throw err;
        }

        code = '(function () { exe = {}; exe.__time__ = 0; exe.step = function() { this.__time__++; };' +
            code +
            'return exe; })()';


        // Determine all time-dependent quantities
        this.determineTimeDependencies();


        
        // Expand the macros in the parser-outputted code
        code = this.macroExpander.expand(code, this.fileLoader.getMacros());
        eval(this.fileLoader.getLibrary());
        exe = eval(code);
        exe.report = this.underscorifyKeys(script.getQuantities());
        return {
            report: script.getQuantities(),
            exe: exe
        };
    };  
    
    /**
     * Puts two underscores before and after each key of the fiven object
     * @param  {Object} obj object to conver
     * @return {Object}     converted object.
     */
    Compiler.prototype.underscorifyKeys = function(obj) {
        var obj2 = {};
        for (var key in obj) {
            obj2['__' + key + '__'] = obj[key];
        }
        return obj2;
    }

    /**
     * Flags all time-dependent quantities in this.quantities as such
     *
     * @modifies this.quantities
     */
    Compiler.prototype.determineTimeDependencies = function() {
        this.historyChecked = [];
        this.totalNumQuantities = _.size(this.quantities);

        var historyQuantities = this.getTimeDependentQuantities();
        for (var qty in historyQuantities) {
            this.setTimeDependent(historyQuantities[qty], true);
        }
    };

    /**
     * Recursively sets whether the given quantity, and all quantities depending on it,
     * are time-dependent.
     *
     * @param {Quantity} quantity The quantity to use as starting point. All of it's reverse dependencies, if any, are checked recursively.
     * @param {Boolean} timeDependent Whether to mark quantity and it's reverse dependencies as time dependent or not.
     */
    Compiler.prototype.setTimeDependent = function(quantity, timeDependent) {
        // Base case: if all quantities have been checked
        if (this.historyChecked.indexOf(quantity.name) >= 0) {
            //console.log(quantity.name + " already checked");
            return;
        }

        quantity.isTimeDependent = timeDependent;
        this.historyChecked.push(quantity.name);
        //console.log ("Starting " + quantity.name);
        for (var dep in quantity.reverseDeps) {
            //console.log("Going to dependency " + this.quantities[quantity.reverseDeps[dep]].name);
            this.setTimeDependent(this.quantities[quantity.reverseDeps[dep]], timeDependent);
        }

        //console.log ("Finished " + quantity.name);
        //console.log ("History log: " + this.historyChecked);
    };

    /**
     * Returns all quantities in this.quantities marked as time-dependent by the analyser.
     * First step in determining ALL time-dependent quantities.
     *
     * @return A map of all quantities in this.quantities marked as time-dependent,
     * keyed by quantity name.
     */
    Compiler.prototype.getTimeDependentQuantities = function() {
        var tdquantities = {};

        for (var qtyName in this.quantities) {
            if (this.quantities[qtyName].isTimeDependent) {
                tdquantities[qtyName] = this.quantities[qtyName];
            }
        }

        return tdquantities;
    };

    // Exports all macros.
    return Compiler;
});

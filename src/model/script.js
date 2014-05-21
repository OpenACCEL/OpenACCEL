/**
 *
 * @author Jacco Snoeren
 */

/** Browser vs. Node ***********************************************/
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

// If all requirements are loaded, we may create our 'class'.
define(["model/compiler"], function(Compiler) {
    function Script() {
        this.compiler = new Compiler();
    }

    Script.prototype = {

        /**
         * The source of the ACCEL script, as provided by the user.
         * @type {String}
         */
        source: '',

        /**
         * The executable javascript code representing the ACCEL model
         * as stored in the source attribute.
         * @type {String}
         */
        exe: null,

        /**
         * Contains the quantities that together make up the ACCEL script.
         * @type {Quantity[]}
         */
        quantities: [],

        /**
         * Add quantity to quantities and recompiles the script.
         * @param {String} source a line in the script as provided by the user
         * @pre source is in the format x(a) = 'definition', where a can be empty.
         * @modifies quantities
         */
        addQuantity: function(source) {
            if(this.source){
                this.source += "\n" + source ;  
            } else {
                this.source = source;
            }
            
            // Notify self of script change to update quantities and recompile
            this.scriptChanged();
            
            // Return compiler/analyser report
            return this.report;
        },

        deleteQuantity: function(quantity) {
            
        },

		/**
		 * Compiles the script and updates the quantities array.
		 *
		 * Call this method when the source property has been modified.
		 */
        scriptChanged: function() {
            compileResult = this.compiler.compile(this.source);
            this.updateQuantities(compileResult);
        },
        
        /**
         * Updates the quantities array based on the report in the compiler
         * result.
         *
         * @param compileResult The object returned by compiler.compile(source)
         */
        updateQuantities: function(compileResult) {
        	this.exe = compileResult.exe;
        	this.quantities = compileResult.report;
        },

        getQuantity: function(name) {
            return eval("this.exe." + name + "();");
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Script;
});
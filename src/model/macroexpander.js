/*
 * The macro expander takes as input a bunch of defined macros, runs them through the Sweet compiler and returns 
 * a piece of executable javascript code. That is, this is the code that should be eval()'d and return an executable.
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) { 
	require = require('requirejs');
	sweetModule = "sweet.js";
} else {
	sweetModule = "sweet";

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

define([sweetModule, "model/macroloader"], /**@lends MacroExpander*/ function(sweet, MacroLoader) {
	/**
	 * @class
	 * @classdesc The macro expander takes as input a bunch of defined macros, runs them through the Sweet compiler
	 *            and returns a piece of executable javascript code. That is, this is the code that should be
	 *            eval()'d and return an executable.
	 */
	function MacroExpander() {
		/**
		 * Helper class that loads and stores all macros.
		 */
		this.macroLoader = new MacroLoader();
	}

	MacroExpander.prototype = {
        /**
         * Expands the loaded macros.
         * 
         * @param code Input code that has to be expanded.
         * @return Expanded code, ready for evaluation.
         */
        expand: function(code) {
        	code = this.macroLoader.getMacros().concat(code);
	        var output;

	        try {
	        	// We do not compile with source maps at all. I don't even know for 100% what they are lol.
                output = sweet.compile(code, {
                    sourceMap: false,
                    readableNames: true
                });

                // We return the code that can be evalled.
	            return output.code;
	        } catch (err) {
	        	// TODO: Handle error nicely.
	            throw new Error(err);
        	}
	    },

	    /**
         * Tries to load a macro by its filename.
         *
         * @param file The macro file to load.
         * @return Whether the file has been succesfully loaded or not.
         */
        load: function(file) {
        	this.macroLoader.load(file);
        }
	}

	// Export the MacroExpander class.
	return MacroExpander;
});
/**
 * We have two environments: the browser and Node. If we are in the browser we should use requirejs and call our functions that way.
 * If we are in node, we should not and instead should just export the various modules for testing purpose.
 *
 * @author Roy Stoof
 */

/** Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;
if (inNode) { 
	require = require('requirejs');
	sweetModule = "sweet.js";
} else {
	sweetModule = "sweet";
}

require.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define([sweetModule, "jquery"], function(sweet) {
	/**
	 * @class
	 * @classdesc First pass in compiling. Translates an Accel script to a script that can be expanded by macros.
	 */
	var Preprocessor = {
		/**
		 * parse description
		 * @param  {type} script description
		 * @return {type}        description
		 */
        parse: function(script) {

        },

        /**
         * scriptToLines description
         * @param  {type} script description
         * @return {type}        description
         */
        scriptToLines: function(script) {

        },

        /**
         * translateLine description
         * @param  {type} line description
         * @return {type}      description
         */
        translateLine: function(line) {

        }

	}

	// If we are in the browser, we want to execute the compile function at the start.
	if (inBrowser) {
    	Preprocessor.compile();
	}

	// Exports are needed, such that other modules may invoke methods from this module file.
	return Preprocessor;
});
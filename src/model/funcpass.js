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

// If all requirements are loaded, we may create our 'class'.
define([sweetModule, "model/pass"], function(sweet, Pass) {
	/**
	 * @class
	 * @classdesc Classes can be defined as objects. Indiciate this using the @class param.
	 */
	function FuncPass() {}

	FuncPass.prototype = new Pass();

	FuncPass.prototype.parse = function(scriptLines) {
		Pass.prototype.parse.call(this, scriptLines);
	}
	
	// Exports are needed, such that other modules may invoke methods from this module file.
	return FuncPass;
});
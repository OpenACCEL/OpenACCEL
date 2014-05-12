/**
 * Central point where we load all of our macros.
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

define(function() {
	/**
	 * @class
	 * @classdesc Classes can be defined as objects. Indiciate this using the @class param.
	 */
	var Macros = {
		derp: "test"
	}

	// Exports all macros.
	return Macros;
});
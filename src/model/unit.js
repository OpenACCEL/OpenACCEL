/*
 * A unit of a quantity
 *
 * @author Edward Brinkmann
 */
/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define([], /**@lends Model.Unit */ function() {
    /**
     * @class
     * @classdesc A unit of a quantity
     */
    function Unit() {

    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Unit;
});

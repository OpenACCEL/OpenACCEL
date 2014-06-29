/*
 * File containing the Individual class
 *
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

define([], /**@lends Model.EMO*/ function() {

    /**
     * Deep-clones an object.
     * http://stackoverflow.com/a/13844062/2922392
     *
     * @return {Object} the cloned object
     */
    function CloneObject(obj) {
        var newObj = (obj instanceof Array) ? [] : {};
        for (var i in obj) {
            if (i == 'clone') {
                continue;
            }
            if (obj[i] && typeof obj[i] == "object") {
                newObj[i] = CloneObject(obj[i]);
            } else {
                newObj[i] = obj[i];
            }
        }
        return newObj;
    };

    return CloneObject;
});

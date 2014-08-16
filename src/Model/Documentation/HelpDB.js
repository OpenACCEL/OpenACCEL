/*
 * File containing the help documentation database class.
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

define([], /** @lends Model */ function() {

    /**
     * @class HelpDB
     * @classdesc Contains all help documentation about ACCEL functions
     * and functionality.
     */
    function HelpDB (articles) {
        this.articles = {};

        if (typeof articles !== 'undefined') {
            this.articles = articles;
        }
    }

    /**
     * Analyses the script.
     *
     * @param {Script} script The script that needs to be analysed.
     */
    HelpDB.prototype.setArticles = function(articles) {};

    // Exports are needed, such that other modules may invoke methods from this module file.
    return HelpDB;
});

/*
 * Web Worker used to save the script to the autoSaveStore.
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


require({
        baseUrl: "./"
    },
    ["require", "simple", "anon/blue", "func", "anon/green"],
    function(require, simple, blue, func, green) {
        postMessage(simple.color);
        postMessage(green.name);
        postMessage(func());
        postMessage(blue.name);
    }
);

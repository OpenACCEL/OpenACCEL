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
    fileModule = "fs";
} else {
    sweetModule = "sweet";
    fileModule = "jquery";

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

define(["module", fileModule], function(module, fs) {
    /**
     * @class
     * @classdesc Classes can be defined as objects. Indiciate this using the @class param.
     */
    var MacroLoader = {
        /**
         * List of loaded and available macros.
         */
        macros: {},

        /**
         * Tries to load a macro by its filename.
         *
         * @param file The macro file to load.
         * @return Whether the file has been succesfully loaded or not.
         */
        load: function(file) {
            var content;

            // TODO: Write test cases for the browser. This is now being tested manually.
            if (inBrowser) {
                // Try to read the file synchronously using jQuery's Ajax API.
                fs.ajax({
                    type: "GET",
                    url: "scripts/model/macros/" + file + ".sjs",
                    success: function(result) {
                        if (!result) {
                            console.log("Macro " + file + " was not ok? Help!?");
                            console.log(file + ": " + result);
                            return false;
                        }

                        content = result;
                    },
                    error: function(err) {
                        console.log(err);
                        return false;
                    },
                    fail: function(err) {
                        console.log(err);
                        return false;
                    },
                    async: false
                });
            } else {
                // Variables needed to locate the file.
                var dirname = require("path").dirname(module.uri);
                var filename = dirname + "/macros/" + file + ".sjs";
                
                // We need to *synchronously* load the file.
                try {
                    content = fs.readFileSync(filename);
                } catch (err) {
                    console.log(err);
                    return false;
                }
            }

            // If the contents have been read, we can store them and return true, else we failed and return false.
            if (content) {
                this.macros[file] = content.toString();
                return true;
            } else {
                return false;
            }
        },

        /**
         * Concatenates all loaded macros into a single string for Sweet.
         *
         * @returns A string of all loaded macros.
         */
        getMacros: function() {
            var output = "";

            for (var key in this.macros) {
                output = output.concat(this.macros[key]);
            }

            return output;
        },

        /**
         * Clears, and thus unloads all macros currently loaded.
         */
        clear: function() {
            this.macros = {};
        }
    }

    // Exports all macros.
    return MacroLoader;
});
/*
 * Central point where we load all of our macros and library functions, and possibly more!
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) {
    require = require('requirejs');
    fileModule = "fs";
} else {
    fileModule = "jquery";

    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["module", fileModule], /**@lends FileLoader*/ function(module, fs) {
    /**
     * @class
     * @classdesc Classes can be defined as objects. Indiciate this using the @class param.
     */
    function FileLoader() {
        /**
         * List of loaded and available macros.
         */
        this.macros = {};

        /**
         * List of loaded utility functions. At the moment of writing, this could for exmaple contain the zip function.
         */
        this.library = {};
    }

    /**
     * Tries to load a file by its filename.
     * By default, it will try and load macros.
     *
     * @param {String} file     The macro file to load.
     * @param {FileType} type   The type of the file, wheter it's a macro, or a library function etc.
     * @return {Bool}           Whether the file has been succesfully loaded or not.
     */
    FileLoader.prototype.load = function(file, type) {
        var content;
        var location;
        var extension;

        if (type && type == "library") {
            location = "library";
            extension = ".js";
        } else if (type && type == "test") {
            location = "../../test/model/util";
            extension = ".js";
        } else {
            type = "macros";
            location = "macros";
            extension = ".sjs";
        }

        // TODO: Write test cases for the browser. This is now being tested manually.
        if (inBrowser) {
            // Try to read the file synchronously using jQuery's Ajax API.
            fs.ajax({
                type: "GET",
                url: "scripts/model/" + location + "/" + file + extension,
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
            var filename = dirname + "/" + location + "/" + file + extension;

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
            if (type == "macros") {
                this.macros[file] = content.toString();
            } else {
                this.library[file] = content.toString();
            }
            return true;
        } else {
            return false;
        }
    };

    /**
     * Concatenates all loaded macros into a single string for Sweet.
     *
     * @returns {String} A string of all loaded macros.
     */
    FileLoader.prototype.getMacros = function() {
        var output = "";

        for (var key in this.macros) {
            output += this.macros[key];
        }

        return output;
    };

    /**
     * Concatenates all loaded macros into a single string for Sweet.
     *
     * @returns {String} A string of all loaded macros.
     */
    FileLoader.prototype.getLibrary = function() {
        var output = "";

        for (var key in this.library) {
            output += this.library[key];
        }

        return output;
    };

    /**
     * @returns {String} A string containing both the library functions and macros.
     */
    FileLoader.prototype.getContent = function() {
        return this.getLibrary() + this.getMacros();
    };

    /**
     * @returns {String} A string containing both the library functions and macros.
     */
    FileLoader.prototype.getContent = function() {
        return this.getLibrary() + this.getMacros();
    };

    /**
     * Clears, and thus unloads all macros currently loaded.
     */
    FileLoader.prototype.clear = function() {
        this.macros = {};
        this.library = {};
    };

    // Exports all macros.
    return FileLoader;
});

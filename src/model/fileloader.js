/*
 * Central point where we load all of our macros and library functions, and possibly more!
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

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

define(["module", fileModule], /**@lends Model.Compiler */ function(module, fs) {
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
         * List of loaded utility functions. At the moment of writing, this could for exmaple contain the binaryZip function.
         */
        this.library = {};
        this.library.std = {};
        this.library.unit = {};
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

        switch (type) {
            case "library":
                location = "library";
                extension = ".js";
                break;
            case "unitlibrary":
                location = "library/units";
                extension = ".js";
                break;
            case "macros":
                location = "macros";
                extension = ".sjs";
                break;
            case "test":
                location = "../../test/model/util";
                extension = ".js";
                break;
            case "testmacros":
                location = "../../test/model/macros";
                extension = ".sjs";
                break;
            default:
                type = "library";
                location = "library";
                extension = ".js";
                break;
        }

        // TODO: Write test cases for the browser. This is now being tested manually.
        if (inBrowser) {
            // Try to read the file synchronously using jQuery's Ajax API.
            fs.ajax({
                type: "GET",
                url: "scripts/model/" + location + "/" + file + extension,
                success: function(result) {
                    if (!result) {
                        console.log("File " + file + " was not ok? Help!?");
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
            if (type == "macros" || type == "testmacros") {
                this.macros[file] = content.toString();
            } else {
                if (type == "library") {
                    this.library.std[file] = content.toString();
                } else if (type == "unitlibrary") {
                    this.library.unit[file] = content.toString();
                }
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
     * Concatenates all loaded macros into a single string.
     * When the lib parameter has not been given, the function will default to the standard library.
     * 
     * @param {String} lib The library to return.
     * @returns {String} A string of all loaded macros.
     */
    FileLoader.prototype.getLibrary = function(lib) {
        var output = "";

        if (lib) {
            switch (lib) {
                case "library":
                    lib = "std";
                    break;
                case "unitlibrary":
                    lib = "unit";
                    break;
                default:
                    lib = "std";
                    break;
            }

            for (var key in this.library[lib]) {
                output += this.library[lib][key];
            }
        } else {
            for (var key in this.library.std) {
                output += this.library.std[key];
            }
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
     * Clears, and thus unloads all macros currently loaded.
     */
    FileLoader.prototype.clear = function() {
        this.macros = {};
        this.library = {};
    };

    // Exports all macros.
    return FileLoader;
});

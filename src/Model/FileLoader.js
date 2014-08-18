/*
 * Central point where we load all of our macros and library functions, and possibly more!
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
         * List of loaded utility functions. At the moment of writing, this could for exmaple contain the binaryZip function.
         */
        this.library = {};
        this.library.std = {};
        this.library.unit = {};

        /**
         * The parsed JSON object containing the ACCEL library metadata such as function names, help text etc.
         *
         * @type {Object}
         */
        this.libfiles = {};
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
                location = "Library";
                extension = ".js";
                break;
            case "unitlibrary":
                location = "Library/Units";
                extension = ".js";
                break;
            case "libfile":
                if (inBrowser) {
                    location = "../lang";
                } else {
                    location = "../../lang";
                }
                extension = ".json";
                break;
            case "test":
                location = "../../test/Model/Util";
                extension = ".js";
                break;
            default:
                type = "library";
                location = "Library";
                extension = ".js";
                break;
        }

        // TODO: Write test cases for the browser. This is now being tested manually.
        if (inBrowser) {
            // Try to read the file synchronously using jQuery's Ajax API.
            fs.ajax({
                type: "GET",
                url: "scripts/Model/" + location + "/" + file + extension,
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
                    throw (err);
                    return false;
                },
                fail: function(err) {
                    console.log(err);
                    throw (err);
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
                throw (err);
                return false;
            }
        }

        // If the contents have been read, we can store them and return true, else we failed and return false.
        if (content) {
            if (type === "library") {
                this.library.std[file] = content.toString();
            } else if (type === "unitlibrary") {
                this.library.unit[file] = content.toString();
            } else if (type === "libfile") {
                if (inNode) {
                    content = JSON.parse(content);
                }

                this.libfiles[file] = content;
            }
            return true;
        } else {
            return false;
        }
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
        var key;

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

            for (key in this.library[lib]) {
                output += this.library[lib][key];
            }
        } else {
            for (key in this.library.std) {
                output += this.library.std[key];
            }
        }

        return output;
    };

    /**
     * Returns the contents of the ACCEL library metadata file as a JSON object.
     *
     * @return {Object} The JSON object containing the ACCEL library metadata
     */
    FileLoader.prototype.getLibFile = function(name) {
        if (!this.libfiles[name]) {
            this.load(name, "libfile");
        }

        return this.libfiles[name];
    };

    /**
     * @returns {String} A string the default library functions.
     *
     * This is here for historic purposes only. This used to also contain the macros, which are now gone.
     */
    FileLoader.prototype.getContent = function() {
        return this.getLibrary();
    };

    /**
     * Clears, and thus unloads all macros currently loaded.
     */
    FileLoader.prototype.clear = function() {
        this.library = {};
    };

    // Exports all macros.
    return FileLoader;
});

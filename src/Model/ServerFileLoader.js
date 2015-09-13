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

        /**
         * The message to prepend to ajax errors that occur and
         * are signalled to the Controller.
         *
         * @type {String}
         */
        this.errorMessage = "";

        /**
         * The source code of the last loaded demo script, if any.
         *
         * @type {String}
         */
        this.demoscript = "";
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
            case "demoscript":
                if (inBrowser) {
                    location = "../../DemoScripts";
                } else {
                    location = "../../../DemoScripts";
                }
                extension = ".txt";
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
                context: this,
                success: function(result) {
                    if (!result) {
                        console.log("Error loading file " + file);
                        alert("Error loading file " + file);
                        return false;
                    }

                    content = result;
                },
                error: function(err) {
                    console.log(err);
                    controller.ajaxError(this.errorMessage + err.responseText);
                    this.errorMessage = "";
                    return false;
                },
                fail: function(err) {
                    console.log(err);
                    controller.ajaxError(this.errorMessage + err.responseText);
                    this.errorMessage = "";
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
            } else if (type === 'demoscript') {
                this.demoscript = content;
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
     * Returns a list of all available demo script names
     *
     * @param {String} condition (Optional) A condition string with parameters to send to the server
     *  along with the request.
     * @return {Array} List containing the names of all demo scripts.
     */
    FileLoader.prototype.getDemoScripts = function(condition) {
        demos = {};

        // Try to read the file synchronously using jQuery's Ajax API.
        fs.ajax({
            type: "GET",
            url: "http://openaccel.nl/php/scripts/listDemos.php?" + condition,
            context: this,
            success: function(result) {
                if (!result) {
                    console.log("Error loading list of demos");
                    alert("Error loading list of demos");
                    return false;
                }

                demos = JSON.parse(result);
            },
            error: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            fail: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            async: false
        });

        return demos;
    };

    /**
     * Returns a list of all available help article names
     *
     * @param {String} condition (Optional) A condition string with parameters to send to the server
     *  along with the request.
     * @return {Array} List containing the names of all help articles
     */
    FileLoader.prototype.getHelpArticles = function(condition) {
        articles = {};

        // Try to read the file synchronously using jQuery's Ajax API.
        fs.ajax({
            type: "GET",
            url: "http://openaccel.nl/php/help/getHelpArticles.php?" + condition,
            context: this,
            success: function(result) {
                if (!result) {
                    console.log("Error loading list of help articles");
                    alert("Error loading list of help articless");
                    return false;
                }

                articles = JSON.parse(result);
            },
            error: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            fail: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            async: false
        });

        return articles;
    };

    /**
     * Fetches the requested help article from the server
     *
     * @param {Number} articleID The ID of the article to fetch
     * @return {Object} The requested article
     */
    FileLoader.prototype.getHelpArticle = function(articleID) {
        article = null;

        // Try to read the file synchronously using jQuery's Ajax API.
        fs.ajax({
            type: "GET",
            url: "http://openaccel.nl/php/help/getHelpArticle.php?id=" + articleID,
            context: this,
            success: function(result) {
                if (!result) {
                    console.log("Error loading help article");
                    alert("Error loading help article");
                    return false;
                }

                article = JSON.parse(result);
            },
            error: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            fail: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            async: false
        });

        return article;
    };

    /**
     * Returns a list of all available help categories and their subcategories
     *
     * @return {Array} List containing the names and ids of all help categories and subcategories
     */
    FileLoader.prototype.getHelpCategories = function(condition) {
        categories = {};

        // Try to read the file synchronously using jQuery's Ajax API.
        fs.ajax({
            type: "GET",
            url: "http://openaccel.nl/php/help/getHelpCategories.php",
            context: this,
            success: function(result) {
                if (!result) {
                    console.log("Error loading list of help categories");
                    alert("Error loading list of help categories");
                    return false;
                }

                categories = JSON.parse(result);
            },
            error: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            fail: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            async: false
        });

        return categories;
    };

    /**
     * Returns a list of all available demo script tags
     *
     * @return {Array} List containing the names and counts of all demo script tags.
     */
    FileLoader.prototype.getScriptTags = function() {
        tags = {};

        // Try to read the file synchronously using jQuery's Ajax API.
        fs.ajax({
            type: "GET",
            url: "http://openaccel.nl/php/scripts/listTags.php",
            context: this,
            success: function(result) {
                if (!result) {
                    console.log("Error loading list of script tags");
                    alert("Error loading list of script tags");
                    return false;
                }

                tags = JSON.parse(result);
            },
            error: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            fail: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            async: false
        });

        return tags;
    };

    /**
     * Returns a list of all available demo script names
     *
     * @return {Array} List containing the names of all demo scripts.
     */
    FileLoader.prototype.getDemoScript = function(script) {
        // Try to read the file synchronously using jQuery's Ajax API.
        fs.ajax({
            type: "GET",
            url: "http://openaccel.nl/php/scripts/getDemo.php?name=" + script,
            context: this,
            success: function(result) {
                if (!result) {
                    console.log("Error loading demo script " + script);
                    alert("Error loading demo script " + script);
                    return false;
                }

                this.demoscript = JSON.parse(result);
            },
            error: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            fail: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            async: false
        });

        return this.demoscript;
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

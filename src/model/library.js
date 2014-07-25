/*
 * A complete list of library functions.
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    globalScope = process;
} else {
    globalScope = window;
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define(["model/fileloader"], /**@lends Model.Library */ function(FileLoader) {
    /**
     * @class
     * @classdesc A complete list of library functions.
     */
    function Library(source) {
        /**
         * The object containing all standard library functions.
         */
        this.std = {};

        /**
         * The object containing all unit library functions.
         */
        this.unit = {};

        /**
         * The file loader is reponsible for loading all library functions.
         */
        this.fileLoader = new FileLoader();
        this.fileLoader.load("functions", "library");
        this.fileLoader.load("functions", "unitlibrary");

        eval(this.fileLoader.getLibrary());
        eval(this.fileLoader.getLibrary("unitlibrary"));
    }

    Library.prototype.export = function(exe) {
        // Copy over all all standard functions to the executable.
        // The binding is there, such that 'this' in a library function refers to the executable.
        var exeLib = exe.libraries.std;
        for (var stdFunc in this.std) {
            exeLib[stdFunc] = this.std[stdFunc].bind(exe);

            // Copy over the base case if present.
            if (this.std[stdFunc].base) {
                exeLib[stdFunc].base = this.std[stdFunc].base;
            }

            // Copy over time dependancy is present.
            if (this.std[stdFunc].isTimeDependent) {
                exeLib[stdFunc].isTimeDependent = this.std[stdFunc].isTimeDependent;
            }
        }

        // Copy over all unit functions.
        exeLib = exe.libraries.unit;
        for (var unitFunc in this.unit) {
            exeLib[unitFunc] = this.unit[unitFunc].bind(exe);

            // Copy over the base case if present.
            if (this.unit[unitFunc].base) {
                exeLib[unitFunc].base = this.unit[unitFunc].base;
            }

            // Copy over time dependancy is present.
            if (this.unit[unitFunc].isTimeDependent) {
                exeLib[unitFunc].isTimeDependent = this.unit[stdFunc].isTimeDependent;
            }
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Library;
});

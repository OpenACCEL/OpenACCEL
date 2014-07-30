suite("File Loader", function() {

    var assert;
    var fileLoader;
    var os;

    setup(function (done) {
        requirejs(["assert", "Model/FileLoader", "os"], function(Assert, FileLoader, OS) {
            assert = Assert;
            fileLoader = new FileLoader();
            os = OS;
            done();
        });
    });

    suite("| Macros", function() {
        /**
         * The contents of the loaded macro should match.
         */
        test("| Macro content matching", function() {
            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            fileLoader.load("testAdd", "testmacros");
            assert.equal(content, fileLoader.macros["testAdd"]);
        });
    });

    suite("| Utility", function() {
        /**
         * Clearing should remove all macros from the cache.
         */
        test("| Clear", function() {
            fileLoader.load("testAdd", "testmacros");
            fileLoader.clear();
            assert.equal("", fileLoader.getMacros());
        });

        /**
         * Concatenation should concatenate all macros into a single string.
         */
        test("| Concatenation", function() {
            fileLoader.clear();

            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            fileLoader.load("testAdd", "testmacros");

            var content2 = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 2 }" + os.EOL + "}";
            fileLoader.load("testAdd2", "testmacros");

            assert.equal(content + content2, fileLoader.getMacros());
        });
    });
});

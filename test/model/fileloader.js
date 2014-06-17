suite("File Loader", function() {

    var assert;
    var fileLoader;
    var os;

    setup(function (done) {
        requirejs(["assert", "model/fileloader", "os"], function(Assert, FileLoader, OS) {
            assert = Assert;
            fileLoader = new FileLoader();
            os = OS;
            done();
        });
    });

    suite("| Macros", function() {
        /**
         * Loading of existing macro files should return true.
         *
         * @input: Load func macro.
         * @expected: true.
         */
        test("| Load single 'func' macro", function() {
            assert.equal(true, fileLoader.load("func", "macros"));
        });

        /**
         * The contents of the loaded macro should match.
         */
        test("| Macro content matching", function() {
            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            fileLoader.load("testAdd", "macros");
            assert.equal(content, fileLoader.macros["testAdd"]);
        });
    });

    suite("| Utility", function() {
        /**
         * Clearing should remove all macros from the cache.
         */
        test("| Clear", function() {
            fileLoader.load("testAdd", "macros");
            fileLoader.clear();
            assert.equal("", fileLoader.getMacros());
        });

        /**
         * Concatenation should concatenate all macros into a single string.
         */
        test("| Concatenation", function() {
            fileLoader.clear();

            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            fileLoader.load("testAdd", "macros");

            var content2 = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 2 }" + os.EOL + "}";
            fileLoader.load("testAdd2", "macros");

            assert.equal(content + content2, fileLoader.getMacros());
        });
    });
});

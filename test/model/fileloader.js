suite("File Loader", function() {
    var fileLoader;
    var assert;
    var os;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/fileloader", "os"], function(assertModule, module, osModule) {
            console.log("Loaded 'FileLoader' module.");
            assert = assertModule;
            fileLoader = new module();
            os = osModule;
            done();
        });
    });

    suite("loading of macro files", function() {
        test("should equal true", function() {
            assert.equal(true, fileLoader.load("func"));
        });

        test("should match content of macro file", function() {
            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            fileLoader.load("testAdd");
            assert.equal(content, fileLoader.macros["testAdd"]);
        });
    });

    suite("utility functions", function() {
        test("clear", function() {
            fileLoader.load("testAdd");
            fileLoader.clear();
            assert.equal("", fileLoader.getMacros());
        });

        test("concatenation", function() {
            fileLoader.clear();

            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            fileLoader.load("testAdd");

            var content2 = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 2 }" + os.EOL + "}";
            fileLoader.load("testAdd2");

            assert.equal(content + content2, fileLoader.getMacros());
        });
    });
});

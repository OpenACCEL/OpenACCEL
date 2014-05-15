suite("Macro Loader", function() {
    var macroLoader;
    var assert;
    var os;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroloader", "os"], function(assertModule, module, osModule) {
            console.log("Loaded 'MacroLoader' module.");
            assert = assertModule;
            macroLoader = new module();
            os = osModule;
            done();
        });
    });

    suite("loading of macro files", function() {
        test("should equal true", function() {
            assert.equal(true, macroLoader.load("func"));
        });

        test("should match content of macro file", function() {
            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            macroLoader.load("testAdd");
            assert.equal(content, macroLoader.macros["testAdd"]);
        });
    });

    suite("utility functions", function() {
        test("clear", function() {
            macroLoader.load("testAdd");
            macroLoader.clear();
            assert.equal("", macroLoader.getMacros());
        });

        test("concatenation", function() {
            macroLoader.clear();

            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            macroLoader.load("testAdd");

            var content2 = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 2 }" + os.EOL + "}";
            macroLoader.load("testAdd2");

            assert.equal(content + content2, macroLoader.getMacros());
        });
    });
});
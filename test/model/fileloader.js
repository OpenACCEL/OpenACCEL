suite("File Loader", function() {

    var assert;
    var fileLoader;
    var os;

    setup(function (done) {
        requirejs(["assert", "model/fileloader", "os"], function(Assert, FileLoader, OS) {
            console.log("Loaded 'FileLoader' module.");
            assert = Assert;
            fileLoader = new FileLoader();
            os = OS;
            done();
        });
    });

    suite("loading of macro files", function() {
        test("should equal true", function() {
            assert.equal(true, fileLoader.load("func", "macros"));
        });

        test("should match content of macro file", function() {
            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            fileLoader.load("testAdd", "macros");
            assert.equal(content, fileLoader.macros["testAdd"]);
        });
    });

    suite("utility functions", function() {
        test("clear", function() {
            fileLoader.load("testAdd", "macros");
            fileLoader.clear();
            assert.equal("", fileLoader.getMacros());
        });

        test("concatenation", function() {
            fileLoader.clear();

            var content = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 1 }" + os.EOL + "}";
            fileLoader.load("testAdd", "macros");

            var content2 = "// This macro is for testing purpose only." + os.EOL + "macro add {" + os.EOL + "    rule { ($x) } => { $x + 2 }" + os.EOL + "}";
            fileLoader.load("testAdd2", "macros");

            assert.equal(content + content2, fileLoader.getMacros());
        });
    });
});

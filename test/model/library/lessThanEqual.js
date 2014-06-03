suite("LessThanEqual Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'LessThanEqual' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("lessThanEqual", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("lessThanEqual", function() {

        test("lessThanEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = lessThanEqual(x, y);
            assert.deepEqual(output, true);
        });


        test("lessThanEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 1;
            output = lessThanEqual(x, y);
            assert.deepEqual(output, false);
        });

        test("lessThanEqual function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = lessThanEqual(x, y);
            assert.deepEqual(output, [false, true, true]);
        });

        test("lessThanEqual function with 2 array's", function() {
            eval(fileLoader.getContent());
            true
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = lessThanEqual(x, y);
            assert.deepEqual(output, [true, true, false]);
        });

        test("lessThanEqual function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = lessThanEqual(x, y);
            assert.deepEqual(output, [true, true, [false, true]]);
        });

        test("lessThanEqual function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = lessThanEqual(x, y);
            assert.deepEqual(output, [true, [true, false],
                [false, true]
            ]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = lessThanEqual(x, 4)'", function() {
            var input = "x = 5\ny = lessThanEqual(x, 4)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), false);
        });

        test("should expand for 'x = 5, y = lessThanEqual(x, 5), z = lessThanEqual(x, lessThanEqual(4, y))'", function() {
            var input = "x = 5\ny = lessThanEqual(x, 5) \nz = lessThanEqual(x, lessThanEqual(4, y))";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), true);
            assert.equal(output.exe.z(), false);
        });

    });
});

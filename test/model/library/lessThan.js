suite("LessThan Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'Compiler & FileLoader' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("lessThan", "library");
            fileLoader.load("binaryZip", "library");
            done();
        });
    });

    suite("lessThan", function() {

        test("lessThan function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = lessThan(x, y);
            assert.deepEqual(output, true);
        });


        test("lessThan function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 1;
            output = lessThan(x, y);
            assert.deepEqual(output, false);
        });

        test("lessThan function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = lessThan(x, y);
            assert.deepEqual(output, [false, false, true]);
        });

        test("lessThan function with 2 array's", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = lessThan(x, y);
            assert.deepEqual(output, [true, false, false]);
        });

        test("lessThan function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = lessThan(x, y);
            assert.deepEqual(output, [true, false, [false, true]]);
        });

        test("lessThan function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = lessThan(x, y);
            assert.deepEqual(output, [true, [false, false], [false, true]]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = lessThan(x, 4)'", function() {
            var input = "x = 5\ny = lessThan(x, 4)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), false);
        });

        test("should expand for 'x = 5, y = lessThan(x, 5), z = lessThan(x, lessThan(4, y))'", function() {
            var input = "x = 5\ny = lessThan(x, 5) \nz = lessThan(x, lessThan(4, y))";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), false);
            assert.equal(output.exe.z(), false);
        });

    });
});

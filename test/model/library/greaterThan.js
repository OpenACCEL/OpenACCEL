suite("GreaterThan Library", function() {
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
            fileLoader.load("greaterThan", "library");
            fileLoader.load("binaryZip", "library");
            done();
        });
    });

    suite("greaterThan", function() {

        test("greaterThan function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = greaterThan(x, y);
            assert.deepEqual(output, false);
        });


        test("greaterThan function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 1;
            output = greaterThan(x, y);
            assert.deepEqual(output, true);
        });

        test("greaterThan function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = greaterThan(x, y);
            assert.deepEqual(output, [true, false, false]);
        });

        test("greaterThan function with 2 array's", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = greaterThan(x, y);
            assert.deepEqual(output, [false, false, true]);
        });

        test("greaterThan function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = greaterThan(x, y);
            assert.deepEqual(output, [false, false, [true, false]]);
        });

        test("greaterThan function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = greaterThan(x, y);
            assert.deepEqual(output, [false, [false, true], [true, false]]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = greaterThan(x, 4)'", function() {
            var input = "x = 5\ny = greaterThan(x, 4)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), true);
        });

        test("should expand for 'x = 5, y = greaterThan(x, 5), z = greaterThan(x, greaterThan(4, y)'", function() {
            var input = "x = 5\ny = greaterThan(x, 5) \nz = greaterThan(x, greaterThan(4, y))";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), false);
            assert.equal(output.exe.z(), true);
        });

    });
});

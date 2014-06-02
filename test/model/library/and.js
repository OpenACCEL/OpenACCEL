suite("And Library", function() {
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
            fileLoader.load("and", "library");
            fileLoader.load("binaryZip", "library");
            done();
        });
    });

    suite("and", function() {

        test("and function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = true;
            output = and(x, y);
            assert.deepEqual(output, true);
        });

        test("and function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = false;
            output = and(x, y);
            assert.deepEqual(output, false);
        });

        test("and function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = [true, false];
            output = and(x, y);
            assert.deepEqual(output, [true, false]);
        });

        test("and function with array's", function() {
            eval(fileLoader.getContent());
            var x = [true, true, false, false];
            var y = [true, false, true, false];
            output = and(x, y);
            assert.deepEqual(output, [true, false, false, false]);
        });

        test("and function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            var y = [true, [true, false]];
            output = and(x, y);
            assert.deepEqual(output, [true, [false, false]]);
        });

        test("and function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [[true, false], false];
            var y = [true, [true, false]];
            output = and(x, y);
            assert.deepEqual(output, [[true, false], [false, false]]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = and(x, true)'", function() {
            var input = "x = 5\ny = and(x, true)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), true);
        });

        test("should expand for 'x = 5, y = and(x, true), z = and(y, and(x, false))'", function() {
            var input = "x = 5\ny = and(x, true) \nz = and(y, and(x, false))";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), true);
            assert.equal(output.exe.z(), false);
        });

    });
});

suite("Equal Library", function() {
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
            fileLoader.load("equal", "library");
            fileLoader.load("binaryZip", "library");
            done();
        });
    });

    suite("equal", function() {

        test("equal function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 1;
            output = equal(x, y);
            assert.deepEqual(output, true);
        });


        test("equal function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 0;
            var y = 1;
            output = equal(x, y);
            assert.deepEqual(output, false);
        });

        test("equal function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4, 5];
            output = equal(x, y);
            assert.deepEqual(output, [false, true, false, false]);
        });

        test("equal function with array's", function() {
            eval(fileLoader.getContent());
            var x = [5, 3, 2, 1];
            var y = [2, 3, 4, 5];
            output = equal(x, y);
            assert.deepEqual(output, [false, true, false, false]);
        });

        test("equal function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [3, 4]];
            output = equal(x, y);
            assert.deepEqual(output, [false, true, [true, false]]);
        });

        test("equal function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 4];
            var y = [3, 2, [1, 4]];
            output = equal(x, y);
            assert.deepEqual(output, [false, [true, false], [false, true]]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = equal(x, 4)'", function() {
            var input = "x = 5\ny = equal(x, 4)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), false);
        });

        test("should expand for 'x = 5, y = equal(x, 5), z = equal(x, equal(4, y)'", function() {
            var input = "x = 5\ny = equal(x, 5) \nz = equal(x, equal(4, y))";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), true);
            assert.equal(output.exe.z(), false);
        });

    });
});

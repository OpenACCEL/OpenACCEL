suite("Imply Library", function() {
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
            fileLoader.load("imply", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("imply", function() {

        test("imply function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = true;
            output = imply(x, y);
            assert.deepEqual(output, true);
        });

        test("imply function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = false;
            output = imply(x, y);
            assert.deepEqual(output, false);
        });

        test("imply function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            var y = 1;
            output = imply(x, y);
            assert.deepEqual(output, [1, true]);
        });

        test("imply function with array's", function() {
            eval(fileLoader.getContent());
            var x = [true, true, false, false];
            var y = [true, false, true, false];
            output = imply(x, y);
            assert.deepEqual(output, [true, false, true, true]);
        });

        test("imply function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            var y = [true, [true, false]];
            output = imply(x, y);
            assert.deepEqual(output, [true, [true, true]]);
        });

        test("imply function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [[true, false], false];
            var y = [true, [true, false]];
            output = imply(x, y);
            assert.deepEqual(output, [[true, true], [true, true]]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = imply(x, 4)'", function() {
            var input = "x = 5\ny = imply(x, 4)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), 4);
        });

        test("should expand for 'x = 5, y = imply(x, 5), z = imply(x, imply(4, y))'", function() {
            var input = "x = 5\ny = imply(x, 5) \nz = imply(x, imply(4, y))";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), 5);
            assert.equal(output.exe.z(), 5);
        });

    });
});
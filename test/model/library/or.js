suite("Or Library", function() {
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
            fileLoader.load("or", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("or", function() {

        test("or function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = false;
            output = or(x, y);
            assert.deepEqual(output, true);
        });


        test("or function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = false;
            var y = false;
            output = or(x, y);
            assert.deepEqual(output, false);
        });

        test("or function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = true
            var y = [true, false];
            output = or(x, y);
            assert.deepEqual(output, [true, true]);
        });

        test("or function with 2 array's", function() {
            eval(fileLoader.getContent());
            var x = [true, true, false, false];
            var y = [true, false, true, false];
            output = or(x, y);
            assert.deepEqual(output, [true, true, true, false]);
        });

        test("or function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            var y = [true, [true, false]];
            output = or(x, y);
            assert.deepEqual(output, [true, [true, false]]);
        });

        test("or function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [true, [true, false], false];
            var y = [true, false, [true, false]];
            output = or(x, y);
            assert.deepEqual(output, [true, [true, false], [true, false]]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = true, y = or(x, false)'", function() {
            var input = "x = true\ny = or(x, false)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), true);
        });

        test("should expand for 'x = false, y = or(x, false), z = or(x, or(true, y))'", function() {
            var input = "x = false\ny = or(x, false) \nz = or(x, or(true, y))";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), false);
            assert.equal(output.exe.z(), true);
        });

    });
});
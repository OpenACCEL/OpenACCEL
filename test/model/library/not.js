suite("Not Library", function() {
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
            fileLoader.load("not", "library");
            fileLoader.load("unaryZip", "library");
            done();
        });
    });

    suite("not", function() {

        test("not function with 1 variable", function() {
            eval(fileLoader.getContent());
            var x = true;
            output = not(x);
            assert.deepEqual(output, false);
        });


        test("not function with 1 variable", function() {
            eval(fileLoader.getContent());
            var x = (3 == 4);
            output = not(x);
            assert.deepEqual(output, true);
        });

        test("not function with an array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            output = not(x);
            assert.deepEqual(output, [false, true]);
        });

        test("not function with an", function() {
            eval(fileLoader.getContent());
            var x = [(1 == 2), (3 == 3)];
            output = not(x);
            assert.deepEqual(output, [true, false]);
        });

        test("not function with a nested array", function() {
            eval(fileLoader.getContent());
            var x = [true, [true, false], false];
            output = not(x);
            assert.deepEqual(output, [false, [false, true], true]);
        });

        test("not function with a nested array", function() {
            eval(fileLoader.getContent());
            var x = [(1 == 2), [(2 == 3), (3 == 3)], (4 == 4)];
            output = not(x);
            assert.deepEqual(output, [true, [true, false], false]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = not(x)'", function() {
            var input = "x = 5\ny = not(x)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), false);
        });

        test("should expand for 'x = 5, y = not(x), z = not(y)'", function() {
            var input = "x = 5\ny = not(x) \nz = not(y)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), false);
            assert.equal(output.exe.z(), true);
        });

    });
});

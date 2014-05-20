suite("Dualfunc", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader"], function(assertModule, module, FileLoader) {
            console.log("Loaded 'compiler & FileLoader' module.");
            assert = assertModule;
            compiler = new module();
            var fileLoader = new FileLoader();
            fileLoader.load("func");
            fileLoader.load("sin", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("Calling functions with two arguments", function() {
        test("Add: scalar value", function() {
            var input = "y = 1 + 2";
            var output = compiler.compile(input).exe.y();
            assert.equal(output, 3);
        });

        test("Add: nested function calls", function() {
            var input = "x = 1 + (3 - 2)";
            var output = compiler.compile(input).exe.x();
            assert.equal(output, 2);
        });

        test("Add: simple array", function() {
            var input = "x = [1,2] + [3,4]";
            var output = compiler.compile(input).exe.x();
            var expected = [4,6];
            assert.deepEqual(output, expected);
        });

        test("Add: nested array", function() {
            var input = "x = [1,[2,3],4] + [5,[6,7],8]";
            var output = compiler.compile(input).exe.x();
            var expected = [6,[8,10], 12];
            assert.deepEqual(output, expected);
        });

        test("Add: simple array and scalar reversed", function() {
            var input = "x = 4 + [1,2,3]";
            var output = compiler.compile(input).exe.x();
            var expected = [5,6,7];
            assert.deepEqual(output, expected);
        });

         test("Add: simple array and scalar", function() {
            var input = "x = [1,2,3] + 4";
            var output = compiler.compile(input).exe.x();
            var expected = [5,6,7];
            assert.deepEqual(output, expected);
        });

        test("Add: nested array and scalar", function() {
            var input = "x = [1,[2,3],4] + 5";
            var output = compiler.compile(input).exe.x();
            var expected = [6,[7,8],9];
            assert.deepEqual(output, expected);
        });
    });
});
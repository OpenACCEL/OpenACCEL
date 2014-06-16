suite("Dualfunc", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            console.log("Loaded 'Dualfunc' module.");
            assert = Assert;
            compiler = new Compiler();
            var fileLoader = new FileLoader();
            fileLoader.load("func", "macros");
            fileLoader.load("sin", "library");
            script = Script;
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("Calling functions with two arguments", function() {
        test("Add: scalar value", function() {
            var input = "y = 1 + 2";
            var output = compiler.compile(new script(input)).__y__();
            assert.equal(output, 3);
        });

        test("Add: nested function calls", function() {
            var input = "x = 1 + (3 - 2)";
            var output = compiler.compile(new script(input)).__x__();
            assert.equal(output, 2);
        });

        test("Add: simple array", function() {
            var input = "x = [1,2] + [3,4]";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [4,6];
            assert.deepEqual(output, expected);
        });

        test("Add: nested array", function() {
            var input = "x = [1,[2,3],4] + [5,[6,7],8]";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [6,[8,10], 12];
            assert.deepEqual(output, expected);
        });

        test("Add: simple array and scalar reversed", function() {
            var input = "x = 4 + [1,2,3]";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [5,6,7];
            assert.deepEqual(output, expected);
        });

         test("Add: simple array and scalar", function() {
            var input = "x = [1,2,3] + 4";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [5,6,7];
            assert.deepEqual(output, expected);
        });

        test("Add: nested array and scalar", function() {
            var input = "x = [1,[2,3],4] + 5";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [6,[7,8],9];
            assert.deepEqual(output, expected);
        });

        test("Add: arrays different length", function() {
            var input = "x = [1,2,3] - [4,5]";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [-3,-3];
            assert.deepEqual(output, expected);
        });
    });
});

suite("And Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            console.log("Loaded 'And' module.");
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("and", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
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
            var x = [
                [true, false], false
            ];
            var y = [true, [true, false]];
            output = and(x, y);
            assert.deepEqual(output, [
                [true, false],
                [false, false]
            ]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = and(x, true)'", function() {
            var input = "x = 5\ny = and(x, true)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.y(), true);
        });

        test("should expand for 'x = 5, y = and(x, true), z = and(y, and(x, false))'", function() {
            var input = "x = 5\ny = and(x, true) \nz = and(y, and(x, false))";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.y(), true);
            assert.equal(output.exe.z(), false);
        });

    });
});

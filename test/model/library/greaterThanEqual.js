suite("GreaterThanEqual Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            console.log("Loaded 'GreaterThanEqual' module.");
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("greaterThanEqual", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
            done();
        });
    });

    suite("greaterThanEqual", function() {

        test("greaterThanEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, false);
        });


        test("greaterThanEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 1;
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, true);
        });

        test("greaterThanEqual function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, [true, true, false]);
        });

        test("greaterThanEqual function with 2 array's", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, [false, true, true]);
        });

        test("greaterThanEqual function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, [false, true, [true, false]]);
        });

        test("greaterThanEqual function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, [false, [true, true],
                [true, false]
            ]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = greaterThanEqual(x, 4)'", function() {
            var input = "x = 5\ny = greaterThanEqual(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.y(), true);
        });

        test("should expand for 'x = 5, y = greaterThanEqual(x, 5), z = greaterThanEqual(x, greaterThanEqual(4, y))'", function() {
            var input = "x = 5\ny = greaterThanEqual(x, 5) \nz = greaterThanEqual(x, greaterThanEqual(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.y(), true);
            assert.equal(output.exe.z(), true);
        });

    });
});

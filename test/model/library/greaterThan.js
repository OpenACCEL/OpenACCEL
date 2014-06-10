suite("GreaterThan Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            console.log("Loaded 'GreaterThan' module.");
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("greaterThan", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
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
            assert.deepEqual(output, [false, [false, true],
                [true, false]
            ]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = greaterThan(x, 4)'", function() {
            var input = "x = 5\ny = greaterThan(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.__y__(), true);
        });

        test("should expand for 'x = 5, y = greaterThan(x, 5), z = greaterThan(x, greaterThan(4, y)'", function() {
            var input = "x = 5\ny = greaterThan(x, 5) \nz = greaterThan(x, greaterThan(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.__y__(), false);
            assert.equal(output.exe.__z__(), true);
        });

    });
});

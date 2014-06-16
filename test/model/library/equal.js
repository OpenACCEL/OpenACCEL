suite("Equal Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            console.log("Loaded 'Equal' module.");
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("equal", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
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
            assert.deepEqual(output, [false, [true, false],
                [false, true]
            ]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = equal(x, 4)'", function() {
            var input = "x = 5\ny = equal(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
        });

        test("should expand for 'x = 5, y = equal(x, 5), z = equal(x, equal(4, y)'", function() {
            var input = "x = 5\ny = equal(x, 5) \nz = equal(x, equal(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
            assert.equal(output.__z__(), false);
        });

    });
});

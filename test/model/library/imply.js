suite("Imply Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("imply", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
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
            var x = [
                [true, false], false
            ];
            var y = [true, [true, false]];
            output = imply(x, y);
            assert.deepEqual(output, [
                [true, true],
                [true, true]
            ]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = imply(x, 4)'", function() {
            var input = "x = 5\ny = imply(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), 4);
        });

        test("should expand for 'x = 5, y = imply(x, 5), z = imply(x, imply(4, y))'", function() {
            var input = "x = 5\ny = imply(x, 5) \nz = imply(x, imply(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), 5);
            assert.equal(output.__z__(), 5);
        });

    });
});

suite("NotEqual Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            console.log("Loaded 'NotEqual' module.");
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            script = Script;
            fileLoader.load("notEqual", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("notEqual", function() {

        test("notEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = notEqual(x, y);
            assert.deepEqual(output, true);
        });


        test("notEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 2;
            output = notEqual(x, y);
            assert.deepEqual(output, false);
        });

        test("notEqual function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = notEqual(x, y);
            assert.deepEqual(output, [true, false, true]);
        });

        test("notEqual function with 2 array's", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = notEqual(x, y);
            assert.deepEqual(output, [true, false, true]);
        });

        test("notEqual function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = notEqual(x, y);
            assert.deepEqual(output, [true, false, [true, true]]);
        });

        test("notEqual function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = notEqual(x, y);
            assert.deepEqual(output, [true, [false, true],
                [true, true]
            ]);
        });

    });

    suite("expansion", function() {

        test("should expand for 'x = 5, y = notEqual(x, 4)'", function() {
            var input = "x = 5\ny = notEqual(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.__y__(), true);
        });

        test("should expand for 'x = 5, y = notEqual(x, 5), z = notEqual(x, notEqual(4, y))'", function() {
            var input = "x = 5\ny = notEqual(x, 5) \nz = notEqual(x, notEqual(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.__y__(), false);
            assert.equal(output.exe.__z__(), true);
        });

    });
});

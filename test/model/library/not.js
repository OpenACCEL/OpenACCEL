suite("Not Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            script = Script;
            fileLoader.load("not", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
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
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
        });

        test("should expand for 'x = 5, y = not(x), z = not(y)'", function() {
            var input = "x = 5\ny = not(x) \nz = not(y)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
            assert.equal(output.__z__(), true);
        });

    });
});

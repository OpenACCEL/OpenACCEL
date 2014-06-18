suite("GreaterThan Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
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

    suite("| Function", function() {
        /**
         * Trivial.
         *
         * @input       greaterThan(1, 2)
         * @expected    false
         */
        test("| Two variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = greaterThan(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * Trivial.
         *
         * @input       greaterThan(2, 1)
         * @expected    true
         */
        test("| Two variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 1;
            output = greaterThan(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * Automapping with a scalar and array.
         *
         * @input       x = 3
         *              x = [2, 3, 4]
         *              greaterThan(x, y)
         * @expected    [true, false, false]
         */
        test("| Automapping with scalar and array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = greaterThan(x, y);
            assert.deepEqual(output, [true, false, false]);
        });

        /**
         * Automapping with a scalar and array.
         *
         * @input       x = [1, 2, 3]
         *              x = [2, 3, 4]
         *              greaterThan(x, y)
         * @expected    [false, false, true]
         */
        test("| Automapping with two arrays", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = greaterThan(x, y);
            assert.deepEqual(output, [false, false, true]);
        });

        /**
         * Automapping with one nested array.
         *
         * @input       x = [1, 2, 3]
         *              x = [3, 2, [1, 4]]
         *              greaterThan(x, y)
         * @expected    [false, false, [true, false]]
         */
        test("| Automapping with one nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = greaterThan(x, y);
            assert.deepEqual(output, [false, false, [true, false]]);
        });

        /**
         * Automapping with two nested arrays.
         *
         * @input       x = [1, [2, 3], 3]
         *              x = [3, 2, [1, 4]]
         *              greaterThan(x, y)
         * @expected    [false, [false, true], [true, false]]
         */
        test("| Automapping with two nested arrays", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = greaterThan(x, y);
            assert.deepEqual(output, [false, [false, true],
                [true, false]
            ]);
        });

    });

    suite("| Compiled", function() {
        /**
         * GreaterThan function should work from the executable.
         *
         * @input       x = 5
         *              y = greaterThan(x, 4)
         * @expected    y = true
         */
        test("| Should expand for 'x = 5, y = greaterThan(x, 4)'", function() {
            var input = "x = 5\ny = greaterThan(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
        });

        /**
         * GreaterThan function should work from the executable.
         *
         * @input       x = 5
         *              y = greaterThan(x, 5)
         *              z = greaterThan(x, greaterThan(4, y)
         * @expected    y = false
         *              z = true
         */
        test("| Should expand for 'x = 5, y = greaterThan(x, 5), z = greaterThan(x, greaterThan(4, y)'", function() {
            var input = "x = 5\ny = greaterThan(x, 5) \nz = greaterThan(x, greaterThan(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
            assert.equal(output.__z__(), true);
        });

    });
});

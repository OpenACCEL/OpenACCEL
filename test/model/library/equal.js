suite("Equal Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
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

    suite("| Function", function() {
        /**
         * Trivial, duh.
         *
         * @input       equal(1, 1)
         * @expected    true
         */
        test("| Equal function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 1;
            output = equal(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * Trivial, duh.
         *
         * @input       equal(1, 0)
         * @expected    false
         */
        test("| Equal function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 0;
            var y = 1;
            output = equal(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * Automapping with a constant and array.
         *
         * @input       x = 3
         *              y = [2, 3, 4, 5]
         *              equal(x, y)
         * @expected    [false, true, false, false]
         */
        test("| Equal function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4, 5];
            output = equal(x, y);
            assert.deepEqual(output, [false, true, false, false]);
        });

        /**
         * Automapping with two arrays.
         *
         * @input       x = [5, 3, 2, 1]
         *              y = [2, 3, 4, 5]
         *              equal(x, y)
         * @expected    [false, true, false, false]
         */
        test("| Equal function with array's", function() {
            eval(fileLoader.getContent());
            var x = [5, 3, 2, 1];
            var y = [2, 3, 4, 5];
            output = equal(x, y);
            assert.deepEqual(output, [false, true, false, false]);
        });

        /**
         * Automapping with two arrays, one nested.
         *
         * @input       x = [1, 2, 3]
         *              y = [3, 2, [3, 4]]
         *              equal(x, y)
         * @expected    [false, true, [true, false]]
         */
        test("| Equal function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [3, 4]];
            output = equal(x, y);
            assert.deepEqual(output, [false, true, [true, false]]);
        });

        /**
         * Automapping with two arrays, two nested.
         *
         * @input       x = [1, [2, 3], 3]
         *              y = [3, 2, [3, 4]]
         *              equal(x, y)
         * @expected    [false, [true, false], [false, true]]
         */
        test("| Equal function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 4];
            var y = [3, 2, [1, 4]];
            output = equal(x, y);
            assert.deepEqual(output, [false, [true, false],
                [false, true]
            ]);
        });

    });

    suite("| Compiled", function() {
        /**
         * Equal function should work from the executable.
         *
         * @input       x = 5
         *              y = equal(x, 4)
         * @expected    y = false
         */
        test("| Should expand for 'x = 5, y = equal(x, 4)'", function() {
            var input = "x = 5\ny = equal(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
        });

        /**
         * Equal function should work from the executable.
         *
         * @input       x = 5
         *              y = equal(x, 5)
         *              z = equal(x, equal(4, y))
         * @expected    y = true
         *              z = false
         */
        test("| Should expand for 'x = 5, y = equal(x, 5), z = equal(x, equal(4, y)'", function() {
            var input = "x = 5\ny = equal(x, 5) \nz = equal(x, equal(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
            assert.equal(output.__z__(), false);
        });
    });
});

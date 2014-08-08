suite("GreaterThanEqual Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
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

    suite("| Function", function() {
        /**
         * Trivial.
         *
         * @input       greaterThanEqual(1, 2)
         * @expected    false
         */
        test("| Two variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * Trivial.
         *
         * @input       greaterThanEqual(2, 1)
         * @expected    true
         */
        test("| Two variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 1;
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * Automapping with a scalar and array.
         *
         * @input       x = 3
         *              x = [2, 3, 4]
         *              greaterThan(x, y)
         * @expected    [true, true, false]
         */
        test("| Automapping with scalar and array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, [true, true, false]);
        });

        /**
         * Automapping with a scalar and array.
         *
         * @input       x = [1, 2, 3]
         *              x = [2, 3, 4]
         *              greaterThan(x, y)
         * @expected    [false, true, true]
         */
        test("| Automapping with two arrays", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, [false, true, true]);
        });

        /**
         * Automapping with one nested array.
         *
         * @input       x = [1, 2, 3]
         *              x = [3, 2, [1, 4]]
         *              greaterThan(x, y)
         * @expected    [false, true, [true, false]]
         */
        test("| Automapping with one nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, [false, true, [true, false]]);
        });

        /**
         * Automapping with two nested arrays.
         *
         * @input       x = [1, [2, 3], 3]
         *              x = [3, 2, [1, 4]]
         *              greaterThan(x, y)
         * @expected    [false, [true, true], [true, false]]
         */
        test("| Automapping with two nested arrays", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = greaterThanEqual(x, y);
            assert.deepEqual(output, [false, [true, true],
                [true, false]
            ]);
        });

    });

    suite("| Compiled", function() {
        /**
         * GreaterThanEqual function should work from the executable.
         *
         * @input       x = 5
         *              y = greaterThan(x, 4)
         * @expected    y = true
         */
        test("| Should expand for 'x = 5, y = greaterThanEqual(x, 4)'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = greaterThanEqual(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
        });

        /**
         * GreaterThanEqual function should work from the executable.
         *
         * @input       x = 5
         *              y = greaterThan(x, 5)
         *              z = greaterThan(x, greaterThan(4, y)
         * @expected    y = true
         *              z = true
         */
        test("| Should expand for 'x = 5, y = greaterThanEqual(x, 5), z = greaterThanEqual(x, greaterThanEqual(4, y))'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = greaterThanEqual(x, 5) \nz = greaterThanEqual(x, greaterThanEqual(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
            assert.equal(output.__z__(), true);
        });

    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = 19 ; kg\n" +
            "b = 25 ; kg\n" +
            "c = greaterThanEqual(a,b)\n" +
            "x = 36\n" +
            "y = 36\n" +
            "z = greaterThanEqual(x, y)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().isNormal());
            assert.equal(false, output.__c__().value);
            assert.ifError(output.__c__().error);

            assert.equal(true, output.__z__().isNormal());
            assert.equal(true, output.__z__().value);
            assert.ifError(output.__z__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = 40 ; kg\n" +
            "b = 25 ; m2/p\n" +
            "c = greaterThanEqual(a,b)\n" +
            "x = 36\n" +
            "z = greaterThanEqual(c, x)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().value);
            assert.equal(output.__c__().error, "unitError");

            assert.equal(false, output.__z__().value);
            assert.equal(output.__z__().error, "uncheckedUnit");
            assert.ok(output.__z__().isNormal());
        });
    });
});

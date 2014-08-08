suite("LessThanEqual Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            script = Script;
            fileLoader.load("lessThanEqual", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("| LessThanEqual", function() {

        /**
         * Test case for lessThanEqual.
         *
         * @input lessThanEqual(1,2)
         * @expected true
         */
        test("| LessThanEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = lessThanEqual(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * Test case for lessThanEqual.
         *
         * @input lessThanEqual(2,1)
         * @expected false
         */
        test("| LessThanEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 1;
            output = lessThanEqual(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * Test case for lessThanEqual.
         *
         * @input lessThanEqual(3,[2,3,4])
         * @expected [false, true, true]
         */
        test("| LessThanEqual function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = lessThanEqual(x, y);
            assert.deepEqual(output, [false, true, true]);
        });

        /**
         * Test case for lessThanEqual.
         *
         * @input lessThanEqual([1, 2, 3],[3, 2, 1])
         * @expected [true, true, false]
         */
        test("| LessThanEqual function with 2 array's", function() {
            eval(fileLoader.getContent());
            true
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = lessThanEqual(x, y);
            assert.deepEqual(output, [true, true, false]);
        });

        /**
         * Test case for lessThanEqual.
         *
         * @input lessThanEqual([1, 2, 3],[3, 2, [1, 4]])
         * @expected [true, true, [false, true]]
         */
        test("| LessThanEqual function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = lessThanEqual(x, y);
            assert.deepEqual(output, [true, true, [false, true]]);
        });

        /**
         * Test case for lessThanEqual.
         *
         * @input lessThanEqual([1, [2, 3], 3],[3, 2, [1, 4]])
         * @expected [true, [true, false],[false, true]]
         */
        test("| LessThanEqual function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = lessThanEqual(x, y);
            assert.deepEqual(output, [true, [true, false],
                [false, true]
            ]);
        });

    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of lessThanEqual.
         *
         * @input x = 5
         *        y = lessThanEqual(x, 4)
         * @expected y = false
         */
        test("| Should expand for 'x = 5, y = lessThanEqual(x, 4)'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = lessThanEqual(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
        });

        /**
         * Test case for expansion of lessThanEqual.
         *
         * @input x = 5
         *        y = lessThanEqual(x, 5)
         *        z = lessThanEqual(x, lessThanEqual(4, y))
         * @expected y = true
         *           z = false
         */
        test("| Should expand for 'x = 5, y = lessThanEqual(x, 5), z = lessThanEqual(x, lessThanEqual(4, y))'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = lessThanEqual(x, 5) \nz = lessThanEqual(x, lessThanEqual(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
            assert.equal(output.__z__(), false);
        });

    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = 40 ; kg\n" +
            "b = 25 ; kg\n" +
            "c = lessThanEqual(a,b)\n" +
            "x = 36\n" +
            "y = 36\n" +
            "z = lessThanEqual(x, y)\n";
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
            "c = lessThanEqual(a,b)\n" +
            "x = 36\n" +
            "z = lessThanEqual(c, x)\n";
            var output = compiler.compile(new script(input));

            assert.equal(false, output.__c__().value);
            assert.equal(output.__c__().error, "unitError");

            assert.equal(true, output.__z__().value);
            assert.equal(output.__z__().error, "uncheckedUnit");
            assert.ok(output.__z__().isNormal());
        });
    });
});

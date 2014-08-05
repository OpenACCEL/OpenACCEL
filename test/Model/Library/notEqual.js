suite("NotEqual Library", function() {

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
            fileLoader.load("notEqual", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("| NotEqual", function() {

        /**
         * Test case for notEqual.
         * @input notEqual(1,2)
         * @expected true
         */
        test("| NotEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = notEqual(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * Test case for notEqual.
         * @input notEqual(2,2)
         * @expected false
         */
        test("| NotEqual function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 2;
            output = notEqual(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * Test case for notEqual.
         * @input notEqual(3,[2, 3, 4])
         * @expected [true, false, true]
         */
        test("| NotEqual function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = notEqual(x, y);
            assert.deepEqual(output, [true, false, true]);
        });

        /**
         * Test case for notEqual.
         * @input notEqual([1, 2, 3],[3, 2, 1])
         * @expected [true, false, true]
         */
        test("| NotEqual function with 2 array's", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = notEqual(x, y);
            assert.deepEqual(output, [true, false, true]);
        });

        /**
         * Test case for notEqual.
         * @input notEqual([1, 2, 3],[3, 2, [1, 4]])
         * @expected [true, false, [true, true]]
         */
        test("| NotEqual function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = notEqual(x, y);
            assert.deepEqual(output, [true, false, [true, true]]);
        });

        /**
         * Test case for notEqual.
         * @input notEqual([1, [2, 3], 3],[3, 2, [1, 4]])
         * @expected [true, [false, true], [true, true]]]
         */
        test("| NotEqual function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = notEqual(x, y);
            assert.deepEqual(output, [true, [false, true],
                [true, true]
            ]);
        });

    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of notEqual.
         *
         * @input x = 5
         *        y = notEqual(x, 4)
         * @expected y = true
         */
        test("| Should expand for 'x = 5, y = notEqual(x, 4)'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = notEqual(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
        });

        /**
         * Test case for expansion of notEqual.
         *
         * @input x = 5
         *        y = notEqual(x, 5)
         *        z = notEqual(x, notEqual(4, y))
         * @expected y = false
         *           z = true
         */
        test("| Should expand for 'x = 5, y = notEqual(x, 5), z = notEqual(x, notEqual(4, y))'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = notEqual(x, 5) \nz = notEqual(x, notEqual(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
            assert.equal(output.__z__(), true);
        });

    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = 40 ; kg\n" +
            "b = 25 ; kg\n" +
            "c = notEqual(a,b)\n" +
            "x = 36\n" +
            "y = 36\n" +
            "z = notEqual(x, y)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().equals(new UnitObject(false, {'kg': 1})));
            assert.equal(true, output.__c__().value);
            assert.ifError(output.__c__().error);

            assert.equal(true, output.__z__().isNormal());
            assert.equal(false, output.__z__().value);
            assert.ifError(output.__z__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = 40 ; kg\n" +
            "b = 25 ; m2/p\n" +
            "c = notEqual(a,b)\n" +
            "x = false\n" +
            "z = notEqual(c, x)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().value);
            assert.equal(output.__c__().error, "unitError");

            assert.equal(true, output.__z__().value);
            assert.equal(output.__z__().error, "uncheckedUnit");
            assert.ok(output.__z__().isNormal());
        });
    });
});

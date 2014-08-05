suite("Or Library", function() {

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
            fileLoader.load("or", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("| Or", function() {

        /**
         * Test case for or.
         *
         * @input or(true, false)
         * @expected true
         */
        test("| Or function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = false;
            output = or(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * Test case for or.
         *
         * @input or(false, false)
         * @expected false
         */
        test("| Or function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = false;
            var y = false;
            output = or(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * Test case for or.
         *
         * @input or(true, [true, false])
         * @expected [true, true]
         */
        test("| Or function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = true
            var y = [true, false];
            output = or(x, y);
            assert.deepEqual(output, [true, true]);
        });

        /**
         * Test case for or.
         *
         * @input or([true, true, false, false], [true, false, true, false])
         * @expected [true, true, true, false]
         */
        test("| Or function with 2 array's", function() {
            eval(fileLoader.getContent());
            var x = [true, true, false, false];
            var y = [true, false, true, false];
            output = or(x, y);
            assert.deepEqual(output, [true, true, true, false]);
        });

        /**
         * Test case for or.
         *
         * @input or([true, false], [true, [true, false]])
         * @expected [true, [true, false]]
         */
        test("| Or function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            var y = [true, [true, false]];
            output = or(x, y);
            assert.deepEqual(output, [true, [true, false]]);
        });

        /**
         * Test case for or.
         *
         * @input or([true, [true, false], false], [true, false, [true, false]])
         * @expected [true, [true, false],[true, false]]
         */
        test("| Or function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [true, [true, false], false];
            var y = [true, false, [true, false]];
            output = or(x, y);
            assert.deepEqual(output, [true, [true, false],
                [true, false]
            ]);
        });

    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of or.
         *
         * @input x = true
         *        y = or(x, false)
         * @expected y = true
         */
        test("| Should expand for 'x = true, y = or(x, false)'", function() {
            compiler.setUnits(false);
            var input = "x = true\ny = or(x, false)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
        });

        /**
         * Test case for expansion of or.
         *
         * @input x = false
         *        y = or(x, false)
         *        z = or(x, or(true, y))
         * @expected y = false
         *           z = true
         */
        test("| Should expand for 'x = false, y = or(x, false), z = or(x, or(true, y))'", function() {
            compiler.setUnits(false);
            var input = "x = false\ny = or(x, false) \nz = or(x, or(true, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
            assert.equal(output.__z__(), true);
        });

    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = true\n" +
            "b = 25\n" +
            "c = or(a,b)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().isNormal());
            assert.equal(true, output.__c__().value);
            assert.ifError(output.__c__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = false ; d\n" +
            "b = 40 ; kg\n" +
            "c = or(a,b)\n" +
            "z = or(c, true)\n";
            var output = compiler.compile(new script(input));

            assert.equal(40, output.__c__().value);
            assert.equal(output.__c__().error, "unitError");

            assert.equal(40, output.__z__().value);
            assert.equal(output.__z__().error, "uncheckedUnit");
            assert.ok(output.__z__().isNormal());
        });
    });
});

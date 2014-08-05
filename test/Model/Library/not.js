suite("Not Library", function() {

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
            fileLoader.load("not", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("| Not", function() {

        /**
         * Test case for not.
         *
         * @input not(true)
         * @expected false
         */
        test("| Not function with 1 variable", function() {
            eval(fileLoader.getContent());
            var x = true;
            output = not(x);
            assert.deepEqual(output, false);
        });

        /**
         * Test case for not.
         *
         * @input not(3 == 4)
         * @expected true
         */
        test("| Not function with 1 variable", function() {
            eval(fileLoader.getContent());
            var x = (3 == 4);
            output = not(x);
            assert.deepEqual(output, true);
        });

        /**
         * Test case for not.
         *
         * @input not([true, false])
         * @expected [false, true]
         */
        test("| Not function with an array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            output = not(x);
            assert.deepEqual(output, [false, true]);
        });

        /**
         * Test case for not.
         *
         * @input not((1 == 2), (3 == 3))
         * @expected [true, false]
         */
        test("| Not function with an", function() {
            eval(fileLoader.getContent());
            var x = [(1 == 2), (3 == 3)];
            output = not(x);
            assert.deepEqual(output, [true, false]);
        });

        /**
         * Test case for not.
         *
         * @input not([true, [true, false], false])
         * @expected [false, [false, true], true]
         */
        test("| Not function with a nested array", function() {
            eval(fileLoader.getContent());
            var x = [true, [true, false], false];
            output = not(x);
            assert.deepEqual(output, [false, [false, true], true]);
        });

        /**
         * Test case for not.
         *
         * @input not((1 == 2), [(2 == 3), (3 == 3)], (4 == 4))
         * @expected [true, [true, false], false]
         */
        test("| Not function with a nested array", function() {
            eval(fileLoader.getContent());
            var x = [(1 == 2), [(2 == 3), (3 == 3)], (4 == 4)];
            output = not(x);
            assert.deepEqual(output, [true, [true, false], false]);
        });

    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of not.
         *
         * @input x = 5
         *        y = not(x)
         * @expected y = false
         */
        test("| Should expand for 'x = 5, y = not(x)'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = not(x)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
        });

        /**
         * Test case for expansion of not.
         *
         * @input x = 5
         *        y = not(x)
         *        z = not(y)
         * @expected y = false
         *           z = true
         */
        test("| Should expand for 'x = 5, y = not(x), z = not(y)'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = not(x) \nz = not(y)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
            assert.equal(output.__z__(), true);
        });

    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = 25\n" +
            "c = not(a)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().isNormal());
            assert.equal(false, output.__c__().value);
            assert.ifError(output.__c__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = false ; d\n" +
            "c = not(a)\n" +
            "z = not(c)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().value);
            assert.equal(output.__c__().error, "unitError");

            assert.equal(false, output.__z__().value);
            assert.equal(output.__z__().error, "uncheckedUnit");
            assert.ok(output.__z__().isNormal());
        });
    });
});
